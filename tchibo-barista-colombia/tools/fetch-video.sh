#!/usr/bin/env bash
# Kampanya videosunu (YouTube) indirir, kareleri ve 960p sessiz H.264 kopyayı assets/video/ altına çıkarır.
# Kullanım: tools/fetch-video.sh [VIDEO_ID]   (yt-dlp + ffmpeg; normal internet erişimi gerekir – GitHub Actions'ta çalışır)
set -uo pipefail
ID="${1:-QD5d6irb-ZA}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/../assets/video"
mkdir -p "$OUT/frames"
URL="https://www.youtube.com/watch?v=$ID"
log(){ echo "[video] $*"; }

python3 -m pip install -q --upgrade yt-dlp >/dev/null 2>&1 || pip install -q --upgrade yt-dlp
log "yt-dlp $(yt-dlp --version 2>/dev/null || echo '?')"

ok=0
for client in "" "web_safari" "android" "ios" "tv" "mweb" "web_embedded"; do
  args=(); [ -n "$client" ] && args=(--extractor-args "youtube:player_client=$client")
  log "deneniyor: player_client=${client:-varsayılan}"
  if yt-dlp "${args[@]}" --no-playlist --no-warnings \
      -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/bv*[height<=1080]+ba/b" \
      --merge-output-format mp4 -o "$OUT/source.%(ext)s" --write-info-json --write-thumbnail "$URL"; then ok=1; break; fi
done

# küçük resimler her durumda
for n in maxresdefault sddefault hqdefault 0 1 2 3; do
  curl -sSf -A "Mozilla/5.0" -o "$OUT/thumb-$n.jpg" "https://i.ytimg.com/vi/$ID/$n.jpg" 2>/dev/null || rm -f "$OUT/thumb-$n.jpg"
done

if [ "$ok" = 1 ]; then
  src="$(ls -1 "$OUT"/source.mp4 "$OUT"/source.mkv "$OUT"/source.webm 2>/dev/null | head -1)"
  log "kaynak: $src"
  ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of json "$src" > "$OUT/probe.json" || true
  if [ -f "$OUT/source.info.json" ]; then
    python3 - "$OUT/source.info.json" "$OUT/info.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1],encoding='utf-8'))
keys=['id','title','uploader','channel','upload_date','duration','width','height','fps','description','webpage_url','license']
json.dump({k:d.get(k) for k in keys},open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False,indent=1)
PY
    rm -f "$OUT/source.info.json"
  fi
  # 960p sessiz kopya (yerelde kesip kırpmak için)
  ffmpeg -v error -y -i "$src" -vf "scale=960:-2" -c:v libx264 -crf 27 -preset medium -pix_fmt yuv420p -an -movflags +faststart "$OUT/source-960.mp4"
  # saniyede 1 kare (inceleme için)
  rm -f "$OUT/frames/"*.jpg
  ffmpeg -v error -y -i "$src" -vf "fps=1,scale=640:-2" -q:v 4 "$OUT/frames/f-%03d.jpg"
  # sahne kesme zamanları
  ffmpeg -y -i "$src" -vf "select='gt(scene,0.25)',showinfo" -vsync vfr -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | sed 's/pts_time://' > "$OUT/scenes.txt" || true
  # kontak sayfaları (2 kare/sn, 8x6 mozaik)
  rm -f "$OUT"/contact-*.jpg
  ffmpeg -v error -y -i "$src" -vf "fps=2,scale=240:-2,tile=8x6" -q:v 5 "$OUT/contact-%02d.jpg"
  mkdir -p "$HERE/../../.video-original" && mv "$src" "$HERE/../../.video-original/" # depoya değil, artifact'a
  rm -f "$OUT"/source.*.webp "$OUT"/source.*.jpg 2>/dev/null
  log "bitti: $(ls "$OUT/frames" | wc -l) kare, $(ls "$OUT"/contact-*.jpg | wc -l) kontak sayfası, $(du -h "$OUT/source-960.mp4" | cut -f1) video"
else
  log "UYARI: video indirilemedi; yalnızca küçük resimler alındı."
fi
du -sh "$OUT"
