#!/usr/bin/env python3
"""DV360 HTML5 interstitial builder.

Bir videoyu DV360'a yuklenebilir HTML5 interstitial zip'ine cevirir:
  - Videoyu hedef boyuta (varsayilan zip <= 3 MB) iki gecisli H.264 ile sikistirir
  - x264'un videoya yazdigi "http://www.videolan.org/x264.html" imzasini (SEI) ve metadata'yi siler
  - Videoyu zip'e .mp4 olarak KOYMAZ; base64 olarak video.js icine gomer
    (DV360, zip icindeki .mp4 icin "not SSL-compliant" hatasi veriyor)
  - base64 metninde tesadufen olusan "http" harf dizilerini boler
  - Videoyu kirpmaz (object-fit: contain, bosluklar siyah)
  - clickTag + istege bagli impression pikseli ekler

Kullanim:
  python3 build.py VIDEO.mp4 --click URL [--impression URL] [--out cikti.zip]
"""
import argparse
import base64
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))


def ffmpeg_bin():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "imageio-ffmpeg"])
        import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def probe(ff, path):
    out = subprocess.run([ff, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
    duration = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    m = re.search(r"Video:.*?, (\d{2,5})x(\d{2,5})", out)
    w, h = int(m.group(1)), int(m.group(2))
    has_audio = "Audio:" in out
    return duration, w, h, has_audio


def run(cmd, cwd=None):
    subprocess.check_call(cmd, cwd=cwd)


def encode(ff, src, dst, workdir, duration, w, h, has_audio, target_bytes):
    # Dikey videolar 720x1280, yataylar 1280x720; oran korunur
    scale = "scale=720:-2" if h >= w else "scale=-2:720"
    audio_kbps = 96 if has_audio else 0
    # %3 kap (container) payi
    total_kbps = target_bytes * 8 / 1000 / duration * 0.97
    video_kbps = int(total_kbps - audio_kbps)
    if video_kbps < 300:
        sys.exit(f"Video cok uzun: hedef boyuta sigmak icin video bitrate {video_kbps} kbps olurdu.")
    base = [ff, "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-vf", scale,
            "-c:v", "libx264", "-profile:v", "main", "-preset", "slow", "-pix_fmt", "yuv420p",
            "-b:v", f"{video_kbps}k", "-passlogfile", os.path.join(workdir, "pass")]
    run(base + ["-pass", "1", "-an", "-f", "mp4", os.devnull])
    audio = ["-c:a", "aac", "-b:a", f"{audio_kbps}k", "-ac", "2"] if has_audio else ["-an"]
    tmp = os.path.join(workdir, "enc.mp4")
    run(base + ["-pass", "2"] + audio + [tmp])
    # x264 SEI imzasini (icinde http:// adresi var) ve metadata'yi temizle
    run([ff, "-y", "-hide_banner", "-loglevel", "error", "-i", tmp, "-map", "0", "-c", "copy",
         "-bsf:v", "filter_units=remove_types=6", "-map_metadata", "-1",
         "-fflags", "+bitexact", "-flags:v", "+bitexact", "-flags:a", "+bitexact",
         "-movflags", "+faststart", dst])
    return video_kbps


def make_poster(ff, video, dst):
    run([ff, "-y", "-hide_banner", "-loglevel", "error", "-ss", "0.5", "-i", video,
         "-frames:v", "1", "-vf", "scale='min(360,iw)':-2", "-q:v", "5", dst])


def make_video_js(video, dst):
    b = base64.b64encode(open(video, "rb").read()).decode()
    parts, last = [], 0
    for m in re.finditer("(?i)http", b):
        parts.append(b[last:m.start() + 1])
        last = m.start() + 1
    parts.append(b[last:])
    js = "var VIDEO_B64=[" + ",".join('"%s"' % p for p in parts) + '].join("");\n'
    assert not re.search("(?i)http", js)
    open(dst, "w").write(js)


def make_html(dst, click, impression, width, height):
    html = open(os.path.join(HERE, "template.html")).read()
    pixel = ""
    if impression:
        pixel = ('<img src="%s" width="0" height="0" style="display:none" alt="" '
                 'referrerpolicy="no-referrer-when-downgrade">' % impression)
    html = (html.replace("{{CLICK_URL}}", click)
                .replace("{{IMPRESSION_PIXEL}}", pixel)
                .replace("{{WIDTH}}", str(width))
                .replace("{{HEIGHT}}", str(height)))
    open(dst, "w").write(html)


def main():
    ap = argparse.ArgumentParser(description="DV360 HTML5 interstitial zip olusturucu")
    ap.add_argument("video")
    ap.add_argument("--click", required=True, help="Tiklama (clickTag) URL'si, https olmali")
    ap.add_argument("--impression", help="Impression piksel URL'si, https olmali")
    ap.add_argument("--size", default="320x480", help="Reklam boyutu (varsayilan 320x480)")
    ap.add_argument("--max-mb", type=float, default=3.0, help="Zip icin ust sinir MB (varsayilan 3)")
    ap.add_argument("--out", help="Cikti zip yolu")
    a = ap.parse_args()

    for u in filter(None, [a.click, a.impression]):
        if not u.startswith("https://"):
            sys.exit(f"URL https ile baslamali: {u}")
    width, height = (int(x) for x in a.size.lower().split("x"))
    name = os.path.splitext(os.path.basename(a.video))[0]
    out = os.path.abspath(a.out or f"{name}_interstitial_{width}x{height}.zip")

    ff = ffmpeg_bin()
    duration, w, h, has_audio = probe(ff, a.video)
    print(f"Kaynak: {w}x{h}, {duration:.1f} sn, ses: {'var' if has_audio else 'yok'}")

    # base64 zip icinde ~%76'ya siniyor: video_boyutu * 4/3 * 0.76 ~= video_boyutu * 1.01
    target = int(a.max_mb * 1024 * 1024 * 0.95 / 1.02)
    with tempfile.TemporaryDirectory() as wd:
        pkg = os.path.join(wd, "pkg")
        os.makedirs(pkg)
        video = os.path.join(wd, "video.mp4")
        for attempt in range(4):
            kbps = encode(ff, a.video, video, wd, duration, w, h, has_audio, target)
            make_poster(ff, video, os.path.join(pkg, "poster.jpg"))
            make_video_js(video, os.path.join(pkg, "video.js"))
            make_html(os.path.join(pkg, "index.html"), a.click, a.impression, width, height)
            if os.path.exists(out):
                os.remove(out)
            with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
                for f in ("index.html", "video.js", "poster.jpg"):
                    z.write(os.path.join(pkg, f), f)
            size = os.path.getsize(out)
            if size <= a.max_mb * 1024 * 1024:
                break
            target = int(target * 0.92)
            print(f"Zip {size / 1048576:.2f} MB, sinir asildi; tekrar sikistiriliyor...")
        else:
            sys.exit("Hedef boyuta indirilemedi.")

        for f in os.listdir(pkg):
            data = open(os.path.join(pkg, f), "rb").read()
            if re.search(rb"(?i)http:", data):
                sys.exit(f"UYARI: {f} icinde http: bulundu, DV360 SSL hatasi verebilir.")

    print(f"Video: {kbps} kbps. Zip: {out} ({size / 1048576:.2f} MB)")


if __name__ == "__main__":
    main()
