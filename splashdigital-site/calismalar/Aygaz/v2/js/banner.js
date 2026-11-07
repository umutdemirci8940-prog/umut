/* Aygaz 100+ Oktan 970x250 – Aygaz3.html'den derlendi (build-dv360.js) */
const {
  useState,
  useEffect,
  useRef
} = React;
const ShieldCheck = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
}), React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const ChevronRight = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
const Play = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("polygon", {
  points: "6 3 20 12 6 21 6 3"
}));
const Pause = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("rect", {
  x: "14",
  y: "4",
  width: "4",
  height: "16",
  rx: "1"
}), React.createElement("rect", {
  x: "6",
  y: "4",
  width: "4",
  height: "16",
  rx: "1"
}));
const Volume2 = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("polygon", {
  points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
}), React.createElement("path", {
  d: "M15.54 8.46a5 5 0 0 1 0 7.07"
}), React.createElement("path", {
  d: "M19.07 4.93a10 10 0 0 1 0 14.14"
}));
const VolumeX = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("polygon", {
  points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
}), React.createElement("line", {
  x1: "22",
  x2: "16",
  y1: "9",
  y2: "15"
}), React.createElement("line", {
  x1: "16",
  x2: "22",
  y1: "9",
  y2: "15"
}));
const Users = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
}), React.createElement("circle", {
  cx: "9",
  cy: "7",
  r: "4"
}), React.createElement("path", {
  d: "M22 21v-2a4 4 0 0 0-3-3.87"
}), React.createElement("path", {
  d: "M16 3.13a4 4 0 0 1 0 7.75"
}));
const Briefcase = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
}), React.createElement("rect", {
  width: "20",
  height: "14",
  x: "2",
  y: "6",
  rx: "2"
}));
const Car = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
}), React.createElement("circle", {
  cx: "7",
  cy: "17",
  r: "2"
}), React.createElement("path", {
  d: "M9 17h6"
}), React.createElement("circle", {
  cx: "17",
  cy: "17",
  r: "2"
}));
const Building2 = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
}), React.createElement("path", {
  d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
}), React.createElement("path", {
  d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0 2 2h-2"
}), React.createElement("path", {
  d: "M10 6h4"
}), React.createElement("path", {
  d: "M10 10h4"
}), React.createElement("path", {
  d: "M10 14h4"
}), React.createElement("path", {
  d: "M10 18h4"
}));
const CheckCircle2 = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const MapPin = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
}), React.createElement("circle", {
  cx: "12",
  cy: "10",
  r: "3"
}));
const Flame = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
}));
const Globe = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), React.createElement("path", {
  d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
}), React.createElement("path", {
  d: "M2 12h20"
}));
const MapIcon = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
}), React.createElement("path", {
  d: "M15 5.764v15"
}), React.createElement("path", {
  d: "M9 3.236v15"
}));
const Flag = ({
  className = "w-4 h-4"
}) => React.createElement("svg", {
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-7.333-2A6 6 0 0 0 4 15"
}));
const ASSETS = Object.assign({
  LOGO_URL: 'https://100oktan.aygaz.com.tr/assets/images/logo/logo-white.png',
  VIDEO_BASE: '',
  KEY_VISUAL_URL: '../../aygaz.jpg',
  PRICE_URL: 'fiyat.json',
  LOGO_NAME: 'Aygaz Otogaz'
}, window.AYGAZ_ASSETS || {});
const OPTIONS = Object.assign({
  startUnmuted: false
}, window.AYGAZ_OPTIONS || {});
const EXITS = {
  site: {
    clickTag: 'clickTag',
    url: 'https://100oktan.aygaz.com.tr/',
    studioExit: 'Site'
  },
  station: {
    clickTag: 'clickTag1',
    url: 'https://100oktan.aygaz.com.tr/nerede.html',
    studioExit: 'Istasyon'
  }
};
const openExit = key => {
  const exit = EXITS[key] || EXITS.site;
  if (window.Enabler && typeof window.Enabler.exit === 'function') {
    window.Enabler.exit(exit.studioExit, exit.url);
    return;
  }
  const tagged = window[exit.clickTag] || window.clickTag;
  window.open(typeof tagged === 'string' && tagged ? tagged : exit.url, '_blank');
};
const PERSONA_VIDEOS = {
  'Aile': 'Aile.mp4',
  'Beyaz Yaka': 'Beyazyaka.mp4',
  'Taksici': 'Taksi.mp4',
  'Filo Yöneticisi': 'filoyoneticisi.mp4'
};
const videoUrlFor = persona => ASSETS.VIDEO_BASE + PERSONA_VIDEOS[persona.title];
const PERSONAS = [{
  id: 'aile',
  title: 'Aile',
  badge: 'Güvenli & Konforlu Sürüş',
  tagline: 'Ailenize Güvenli, Bütçenize Dost Otogaz',
  benefits: ['Benzine kıyasla %40\'a varan tasarruf', 'Sessiz ve konforlu sürüş'],
  ctaText: 'Şimdi İncele',
  iconName: 'Users'
}, {
  id: 'beyaz_yaka',
  title: 'Beyaz Yaka',
  badge: 'Akıllı Şehir Sürüşü',
  tagline: 'Şehir İçi Trafikte Akıllı & Verimli Seçim',
  benefits: ['Dur-kalk trafikte düşük tüketim', 'Temiz enjektör ve motor bakımı'],
  ctaText: 'Şimdi İncele',
  iconName: 'Briefcase'
}, {
  id: 'taksici',
  title: 'Taksici',
  badge: '7/24 Kazanç & Verim',
  tagline: 'Yüksek Kilometrede Maksimum Kazanç',
  benefits: ['Her km için net bütçe kazancı', 'Aşınmayı önleyen katkılı formül'],
  ctaText: 'Şimdi İncele',
  iconName: 'Car'
}, {
  id: 'patron',
  title: 'Filo Yöneticisi',
  badge: 'Filo & Kurumsal Çözüm',
  tagline: 'Filolarınızda Yüksek Verim ve Bütçe Kontrolü',
  benefits: ['Filo bütçesinde doğrudan tasarruf', 'Yüksek tork ve araç koruma'],
  ctaText: 'Şimdi İncele',
  iconName: 'Building2'
}];
const STATION_STATS = {
  worldLpgStations: 80000,
  aygazStations: 1900
};
const formatNumber = n => n.toLocaleString('tr-TR');
const CALC = {
  fiyatTarihi: '2026-10-02',
  bolge: 'İstanbul Anadolu Yakası',
  benzinLitreTL: 84.50,
  otogazLitreTL: 43.29,
  benzinTuketimL100km: 8.0,
  otogazTuketimL100km: 9.6,
  kitFiyatiTL: 56000,
  kmMin: 5000,
  kmMax: 50000,
  kmStep: 1000,
  kmVarsayilan: 18000
};
const formatTL = n => (+n).toLocaleString('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const formatDateTR = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d.split('-').reverse().join('.') : d || '';
const isValidPrices = j => j && isFinite(+j.benzin) && isFinite(+j.otogaz) && +j.benzin > 0 && +j.otogaz > 0 && +j.otogaz < +j.benzin;
const OKTAN_BENEFITS = [{
  id: 'power',
  title: 'Yüksek Tork & İvmelenme',
  description: 'Vuruntusuz çalışan motor ile dik yokuşlarda ve sollamalarda anında tork tepkisi.',
  statValue: '+18%'
}, {
  id: 'economy',
  title: 'Maksimum Tasarruf',
  description: 'Tam yanma sağlayan formülü ile her depoda daha uzun mesafe ve tasarruf.',
  statValue: '%40'
}, {
  id: 'engine_protection',
  title: 'Motor Koruma',
  description: 'Silindir içi kurum birikmesini önler, motor ömrünü uzatır.',
  statValue: '2x'
}, {
  id: 'safety',
  title: 'Aygaz Güvencesi',
  description: 'Türkiye genelinde 1.900+ denetimli istasyonda %100 emniyet garantisi.',
  statValue: '1.900+'
}];
function Masthead970x250() {
  const [activePersonaId, setActivePersonaId] = useState('aile');
  const [activeTab, setActiveTab] = useState('personas');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(!OPTIONS.startUnmuted);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [annualKm, setAnnualKm] = useState(CALC.kmVarsayilan);
  const [prices, setPrices] = useState({
    benzin: CALC.benzinLitreTL,
    otogaz: CALC.otogazLitreTL,
    kit: CALC.kitFiyatiTL,
    tarih: CALC.fiyatTarihi,
    bolge: CALC.bolge,
    kaynak: 'gomulu'
  });
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [worldCount, setWorldCount] = useState(0);
  const [stationCount, setStationCount] = useState(0);
  const videoRefs = useRef({});
  const getVideo = id => videoRefs.current[id] || null;
  const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];
  useEffect(() => {
    setIsIntroActive(true);
    setIntroFading(false);
    setIntroStep(1);
    const timer1 = setTimeout(() => setIntroStep(2), 400);
    const timer2 = setTimeout(() => setIntroStep(3), 1100);
    const timer3 = setTimeout(() => setIntroFading(true), 2400);
    const timer4 = setTimeout(() => {
      setIsIntroActive(false);
      setIntroStep(0);
    }, 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  useEffect(() => {
    if (!ASSETS.PRICE_URL || typeof fetch !== 'function') return;
    let cancelled = false;
    fetch(ASSETS.PRICE_URL, {
      cache: 'no-store',
      credentials: 'omit'
    }).then(r => r.ok ? r.json() : null).then(j => {
      if (!cancelled && isValidPrices(j)) setPrices({
        benzin: +j.benzin,
        otogaz: +j.otogaz,
        kit: isFinite(+j.kit) && +j.kit > 0 ? +j.kit : CALC.kitFiyatiTL,
        tarih: j.tarih || '',
        bolge: j.bolge || CALC.bolge,
        kaynak: 'fiyat.json'
      });
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!OPTIONS.startUnmuted) return;
    const first = getVideo(PERSONAS[0].id);
    if (!first) return;
    first.muted = false;
    first.play().then(() => {
      setSoundBlocked(false);
    }).catch(() => {
      first.muted = true;
      setIsMuted(true);
      setSoundBlocked(true);
      first.play().catch(() => {});
    });
  }, []);
  const unmuteAll = () => {
    PERSONAS.forEach(p => {
      const v = getVideo(p.id);
      if (v) v.muted = false;
    });
    setIsMuted(false);
    setSoundBlocked(false);
  };
  const handleFirstInteraction = () => {
    if (soundBlocked) unmuteAll();
  };
  useEffect(() => {
    if (activeTab === 'station') {
      setWorldCount(0);
      setStationCount(0);
      const duration = 1000;
      const startTime = performance.now();
      const animate = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setWorldCount(Math.floor(easeProgress * STATION_STATS.worldLpgStations));
        setStationCount(Math.floor(easeProgress * STATION_STATS.aygazStations));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [activeTab]);
  const handleCtaClick = ctaName => {
    const name = (ctaName || '').toLowerCase();
    const isStation = name.includes('istasyon') || name.includes('station');
    openExit(isStation ? 'station' : 'site');
  };
  const handlePersonaSelect = personaId => {
    const next = getVideo(personaId);
    if (personaId !== activePersonaId) {
      const current = getVideo(activePersonaId);
      if (current) current.pause();
      if (next) {
        try {
          next.currentTime = 0;
        } catch (e) {}
      }
      setActivePersonaId(personaId);
    }
    if (next) {
      next.play().catch(() => {});
      setIsPlaying(true);
    }
  };
  const togglePlay = () => {
    const video = getVideo(activePersonaId);
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };
  const toggleMute = () => {
    const nextMuted = !isMuted;
    PERSONAS.forEach(p => {
      const video = getVideo(p.id);
      if (video) video.muted = nextMuted;
    });
    setIsMuted(nextMuted);
  };
  const annualBenzinTL = Math.round(annualKm / 100 * CALC.benzinTuketimL100km * prices.benzin);
  const annualOtogazTL = Math.round(annualKm / 100 * CALC.otogazTuketimL100km * prices.otogaz);
  const annualSavingsTL = annualBenzinTL - annualOtogazTL;
  const savingsPct = annualBenzinTL > 0 ? Math.round(annualSavingsTL / annualBenzinTL * 100) : 0;
  const paybackMonths = annualSavingsTL > 0 ? Math.round(prices.kit / annualSavingsTL * 12) : null;
  const priceBasis = (prices.tarih ? formatDateTR(prices.tarih) + ' tarihli ' : '') + (prices.bolge ? prices.bolge + ' ' : '') + 'fiyatları: benzin ' + formatTL(prices.benzin) + ' TL/L, otogaz ' + formatTL(prices.otogaz) + ' TL/L';
  const getPersonaIcon = iconName => {
    switch (iconName) {
      case 'Users':
        return React.createElement(Users, {
          className: "w-3.5 h-3.5"
        });
      case 'Briefcase':
        return React.createElement(Briefcase, {
          className: "w-3.5 h-3.5"
        });
      case 'Car':
        return React.createElement(Car, {
          className: "w-3.5 h-3.5"
        });
      case 'Building2':
        return React.createElement(Building2, {
          className: "w-3.5 h-3.5"
        });
      default:
        return React.createElement(Users, {
          className: "w-3.5 h-3.5"
        });
    }
  };
  return React.createElement("div", {
    id: "aygaz-masthead-interactive-970x250",
    className: "relative bg-[#000D21] rounded-none overflow-hidden shadow-2xl border border-slate-800/90 font-sans text-white select-none",
    style: {
      width: '970px',
      height: '250px',
      minWidth: '970px',
      minHeight: '250px'
    },
    onPointerDownCapture: handleFirstInteraction
  }, React.createElement("div", {
    className: "absolute top-0 left-0 right-0 h-[38px] bg-[#00122E] border-b border-slate-800 px-3.5 flex items-center justify-between z-20"
  }, React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("img", {
    src: ASSETS.LOGO_URL,
    alt: "Aygaz Otogaz Logo",
    className: "h-6 object-contain"
  })), React.createElement("div", {
    className: "flex items-center gap-1.5 text-[11px] font-bold"
  }, React.createElement("button", {
    onClick: () => setActiveTab('personas'),
    className: `px-3 py-1 rounded transition-all cursor-pointer ${activeTab === 'personas' ? 'bg-[#004791] text-white shadow-sm border border-sky-400/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
  }, "S\xFCr\xFCc\xFC Profilleri"), React.createElement("button", {
    onClick: () => setActiveTab('benefits'),
    className: `px-3 py-1 rounded transition-all cursor-pointer ${activeTab === 'benefits' ? 'bg-[#004791] text-white shadow-sm border border-sky-400/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
  }, "100+ Oktan G\xFCc\xFC"), React.createElement("button", {
    onClick: () => setActiveTab('calculator'),
    className: `px-3 py-1 rounded transition-all cursor-pointer ${activeTab === 'calculator' ? 'bg-[#FF5500] text-white font-extrabold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
  }, "Tasarruf Hesapla"), React.createElement("button", {
    onClick: () => setActiveTab('station'),
    className: `px-3 py-1 rounded transition-all cursor-pointer ${activeTab === 'station' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
  }, "\u0130stasyon Bul"))), React.createElement("div", {
    className: "absolute top-[38px] left-0 right-0 bottom-[36px] flex items-center overflow-hidden"
  }, React.createElement("div", {
    className: "w-[340px] h-full relative bg-slate-950 border-r border-slate-800 flex-shrink-0 group overflow-hidden"
  }, PERSONAS.map((p, idx) => {
    const isActive = p.id === activePersonaId;
    return React.createElement("video", {
      key: p.id,
      ref: el => {
        videoRefs.current[p.id] = el;
      },
      src: videoUrlFor(p),
      poster: ASSETS.KEY_VISUAL_URL,
      autoPlay: idx === 0,
      loop: true,
      muted: isMuted,
      playsInline: true,
      preload: isActive ? 'auto' : 'metadata',
      "aria-hidden": !isActive,
      "data-persona": p.title,
      className: `absolute inset-0 w-full h-full object-cover object-bottom transition-opacity duration-300 ${isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'}`
    });
  }), React.createElement("div", {
    className: "absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-[2]"
  }), React.createElement("div", {
    className: "absolute top-2.5 left-2.5 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-800 z-10"
  }, React.createElement("button", {
    onClick: togglePlay,
    className: "w-5 h-5 rounded bg-[#004791] text-white flex items-center justify-center hover:bg-[#003B7A] cursor-pointer",
    title: isPlaying ? 'Duraklat' : 'Oynat'
  }, isPlaying ? React.createElement(Pause, {
    className: "w-3 h-3"
  }) : React.createElement(Play, {
    className: "w-3 h-3"
  })), React.createElement("button", {
    onClick: toggleMute,
    className: "w-5 h-5 rounded bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 cursor-pointer",
    title: isMuted ? 'Sesi Aç' : 'Sesi Kapat'
  }, isMuted ? React.createElement(VolumeX, {
    className: "w-3 h-3 text-red-400"
  }) : React.createElement(Volume2, {
    className: "w-3 h-3 text-emerald-400"
  })), soundBlocked && React.createElement("span", {
    className: "ml-1 text-[9.5px] font-bold text-amber-300 whitespace-nowrap animate-pulse"
  }, "Ses i\xE7in t\u0131klay\u0131n"))), React.createElement("div", {
    className: "flex-1 h-full bg-[#000D21] p-3 flex flex-col justify-between overflow-hidden"
  }, activeTab === 'personas' && React.createElement("div", {
    className: "flex flex-col h-full justify-between"
  }, React.createElement("div", {
    className: "grid grid-cols-4 gap-1.5"
  }, PERSONAS.map(p => {
    const isSelected = activePersonaId === p.id;
    return React.createElement("button", {
      key: p.id,
      onClick: () => handlePersonaSelect(p.id),
      className: `flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-bold transition-all border cursor-pointer ${isSelected ? 'bg-[#004791] text-white border-sky-400/60 shadow-md' : 'bg-[#001533] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-[#001D47]'}`
    }, getPersonaIcon(p.iconName), React.createElement("span", {
      className: "truncate"
    }, p.title));
  })), React.createElement("div", {
    className: "bg-[#001533] border border-slate-800 rounded-lg p-3 my-1 flex items-start gap-3"
  }, React.createElement("div", {
    className: "p-2 rounded bg-[#004791]/30 border border-[#004791]/50 text-sky-400 flex-shrink-0"
  }, getPersonaIcon(activePersona.iconName)), React.createElement("div", {
    className: "flex-1 min-w-0"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("h4", {
    className: "text-xs font-black text-white truncate"
  }, activePersona.title), React.createElement("span", {
    className: "text-[10px] text-slate-400 font-medium truncate"
  }, activePersona.badge)), React.createElement("p", {
    className: "text-[11px] text-sky-200 font-semibold mt-0.5 line-clamp-1 italic"
  }, "\"", activePersona.tagline, "\""), React.createElement("ul", {
    className: "mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] text-slate-300"
  }, activePersona.benefits.slice(0, 2).map((b, idx) => React.createElement("li", {
    key: idx,
    className: "flex items-center gap-1.5 truncate"
  }, React.createElement(CheckCircle2, {
    className: "w-3 h-3 text-emerald-400 flex-shrink-0"
  }), React.createElement("span", {
    className: "truncate"
  }, b))))))), activeTab === 'benefits' && React.createElement("div", {
    className: "grid grid-cols-2 gap-2 h-full py-0.5"
  }, OKTAN_BENEFITS.map(benefit => React.createElement("div", {
    key: benefit.id,
    className: "bg-[#001533] border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("span", {
    className: "text-[11px] font-black text-white truncate"
  }, benefit.title), React.createElement("span", {
    className: "text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30"
  }, benefit.statValue)), React.createElement("p", {
    className: "text-[10px] text-slate-300 line-clamp-2 mt-1 leading-tight"
  }, benefit.description)))), activeTab === 'calculator' && React.createElement("div", {
    className: "bg-[#001533] border border-slate-800 rounded-lg p-3 h-full flex items-stretch justify-between gap-3",
    "data-fiyat-kaynak": prices.kaynak,
    "data-fiyat-tarih": prices.tarih,
    "data-benzin": prices.benzin,
    "data-otogaz": prices.otogaz,
    "data-kit": prices.kit
  }, React.createElement("div", {
    className: "flex-1 min-w-0 flex flex-col justify-between"
  }, React.createElement("div", null, React.createElement("div", {
    className: "flex justify-between text-[11px] font-bold text-slate-300 mb-1"
  }, React.createElement("span", null, "1 Y\u0131lda Yap\u0131lan Mesafe (KM)"), React.createElement("span", {
    className: "text-amber-400 font-mono font-bold"
  }, formatNumber(annualKm), " km")), React.createElement("input", {
    type: "range",
    min: CALC.kmMin,
    max: CALC.kmMax,
    step: CALC.kmStep,
    value: annualKm,
    onChange: e => setAnnualKm(Number(e.target.value)),
    className: "w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-[#FF5500]"
  })), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", {
    className: "bg-[#000D21] border border-slate-800 rounded px-2 py-1"
  }, React.createElement("div", {
    className: "text-[9.5px] text-slate-400 font-semibold"
  }, "Y\u0131ll\u0131k Benzin T\xFCketiminiz"), React.createElement("div", {
    className: "text-xs font-black text-slate-100 font-mono",
    "data-benzin-yillik": annualBenzinTL
  }, formatNumber(annualBenzinTL), " TL")), React.createElement("div", {
    className: "bg-[#000D21] border border-slate-800 rounded px-2 py-1"
  }, React.createElement("div", {
    className: "text-[9.5px] text-slate-400 font-semibold"
  }, "Y\u0131ll\u0131k Otogaz T\xFCketiminiz"), React.createElement("div", {
    className: "text-xs font-black text-emerald-400 font-mono",
    "data-otogaz-yillik": annualOtogazTL
  }, formatNumber(annualOtogazTL), " TL"))), React.createElement("div", {
    className: "text-[9.5px] leading-tight"
  }, React.createElement("span", {
    className: "text-slate-300 font-semibold"
  }, "Benzine k\u0131yasla %40'a varan tasarruf."), React.createElement("br", null), React.createElement("span", {
    className: "text-slate-500"
  }, priceBasis, "; otogaz t\xFCketimi benzine g\xF6re %20 fazla, d\xF6n\xFC\u015F\xFCm kiti ", formatNumber(prices.kit), " TL al\u0131nm\u0131\u015Ft\u0131r."))), React.createElement("div", {
    className: "bg-gradient-to-br from-[#001D4A] to-[#003B7A] border border-sky-500/30 rounded p-2.5 text-center min-w-[190px] flex flex-col justify-center"
  }, React.createElement("span", {
    className: "text-[10px] font-bold text-sky-300 uppercase tracking-wider block"
  }, "Otogaz ile Y\u0131ll\u0131k Kazanc\u0131n\u0131z"), React.createElement("div", {
    className: "text-xl font-black text-amber-400 my-0.5 font-mono"
  }, formatNumber(annualSavingsTL), " TL"), React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5 mt-1"
  }, React.createElement("div", {
    className: "bg-[#000D21]/60 rounded px-1 py-1"
  }, React.createElement("div", {
    className: "text-sm font-black text-sky-300 font-mono leading-none",
    "data-oran": savingsPct
  }, "%", savingsPct), React.createElement("div", {
    className: "text-[9px] text-slate-300 font-semibold mt-0.5"
  }, "Tasarruf Oran\u0131")), React.createElement("div", {
    className: "bg-[#000D21]/60 rounded px-1 py-1"
  }, React.createElement("div", {
    className: "text-sm font-black text-emerald-400 font-mono leading-none",
    "data-geri-donus": paybackMonths == null ? '' : paybackMonths
  }, paybackMonths == null ? '—' : paybackMonths + ' Ay'), React.createElement("div", {
    className: "text-[9px] text-slate-300 font-semibold mt-0.5"
  }, "Geri D\xF6n\xFC\u015F S\xFCresi"))))), activeTab === 'station' && React.createElement("div", {
    className: "bg-[#001533] border border-slate-800 rounded-lg p-3 h-full flex flex-col justify-between"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement(MapPin, {
    className: "w-4 h-4 text-emerald-400 flex-shrink-0"
  }), React.createElement("span", {
    className: "text-xs font-black text-white"
  }, "T\xFCrkiye Geneli Yayg\u0131n Aygaz \u0130stasyon A\u011F\u0131")), React.createElement("span", {
    className: "text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
  }, "Canl\u0131 \u0130stasyon Bulucu")), React.createElement("div", {
    className: "grid grid-cols-3 gap-2 my-1"
  }, React.createElement("div", {
    className: "bg-[#000D21] px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-2"
  }, React.createElement("div", {
    className: "w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#FF8A00] flex-shrink-0"
  }, React.createElement(Globe, {
    className: "w-4 h-4"
  })), React.createElement("div", {
    className: "min-w-0"
  }, React.createElement("div", {
    className: "text-base font-black text-emerald-400 font-mono tracking-tight leading-none"
  }, formatNumber(worldCount)), React.createElement("div", {
    className: "text-[9.5px] text-slate-300 font-semibold mt-1 leading-tight"
  }, "D\xFCnya Genelinde", React.createElement("br", null), "LPG istasyonu"))), React.createElement("div", {
    className: "bg-[#000D21] px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-2"
  }, React.createElement("div", {
    className: "w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#FF8A00] flex-shrink-0"
  }, React.createElement(MapIcon, {
    className: "w-4 h-4"
  })), React.createElement("div", {
    className: "min-w-0"
  }, React.createElement("div", {
    className: "text-base font-black text-sky-400 font-mono tracking-tight leading-none"
  }, formatNumber(stationCount), "+"), React.createElement("div", {
    className: "text-[9.5px] text-slate-300 font-semibold mt-1 leading-tight"
  }, "T\xFCrkiye'de", React.createElement("br", null), "Aygaz istasyonu"))), React.createElement("div", {
    className: "bg-[#000D21] px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-2"
  }, React.createElement("div", {
    className: "w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#FF8A00] flex-shrink-0"
  }, React.createElement(Flag, {
    className: "w-4 h-4"
  })), React.createElement("div", {
    className: "min-w-0"
  }, React.createElement("div", {
    className: "text-base font-black text-amber-400 tracking-tight leading-none"
  }, "Aygaz"), React.createElement("div", {
    className: "text-[9.5px] text-slate-300 font-semibold mt-1 leading-tight"
  }, "100+ Oktan", React.createElement("br", null), "Aygaz'\u0131n t\xFCm istasyonlar\u0131nda!")))), React.createElement("button", {
    onClick: () => handleCtaClick('station'),
    className: "w-full bg-[#004791] hover:bg-[#003B7A] text-white text-[11px] font-bold py-1.5 px-3 rounded transition-all flex items-center justify-between border border-sky-400/30 cursor-pointer shadow-sm"
  }, React.createElement("span", null, "Size En Yak\u0131n Aygaz \u0130stasyonunu Haritada Bulun"), React.createElement("span", {
    className: "text-amber-300 text-[10px] underline flex items-center gap-1"
  }, "100oktan.aygaz.com.tr/nerede.html \u2192"))))), React.createElement("div", {
    className: "absolute bottom-0 left-0 right-0 h-[36px] bg-[#00122E] border-t border-slate-800 px-3.5 flex items-center justify-between z-20"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 text-[10.5px] text-slate-300 font-semibold"
  }, React.createElement(ShieldCheck, {
    className: "w-3.5 h-3.5 text-emerald-400"
  }), React.createElement("span", null, activePersona.badge)), React.createElement("button", {
    onClick: () => handleCtaClick(activePersona.ctaText),
    className: "bg-[#FF5500] hover:bg-[#E04B00] text-white font-black text-xs px-4 py-1 rounded shadow-md transition-all flex items-center gap-1 cursor-pointer"
  }, React.createElement("span", null, activePersona.ctaText), React.createElement(ChevronRight, {
    className: "w-3.5 h-3.5"
  }))), isIntroActive && React.createElement("div", {
    className: `absolute inset-0 z-50 bg-[#000B21] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${introFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`
  }, React.createElement("div", {
    className: "absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#003B7A]/40 via-[#00102E]/80 to-[#000817] pointer-events-none"
  }), React.createElement("div", {
    className: "relative z-10 flex flex-col items-center text-center px-4 space-y-3"
  }, React.createElement("div", {
    className: `transform transition-all duration-700 ease-out flex items-center justify-center ${introStep >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`
  }, React.createElement("div", {
    className: "relative"
  }, React.createElement("div", {
    className: "absolute -inset-4 rounded-full bg-sky-500/20 blur-xl animate-pulse"
  }), React.createElement("img", {
    src: ASSETS.LOGO_URL,
    alt: "Aygaz Logo",
    className: "h-10 md:h-12 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,140,255,0.6)]"
  }))), React.createElement("div", {
    className: `transform transition-all duration-700 delay-200 ease-out flex flex-col items-center space-y-1 ${introStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`
  }, React.createElement("div", {
    className: "bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#E04B00] text-white px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,85,0,0.6)] border border-amber-300/40"
  }, React.createElement(Flame, {
    className: "w-4 h-4 text-white fill-white animate-bounce"
  }), React.createElement("span", null, "100+ OKTAN TEKNOLOJ\u0130S\u0130")), React.createElement("p", {
    className: `text-xs font-bold text-slate-200 tracking-wide transition-all duration-500 delay-500 ${introStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`
  }, "Yollarda Maksimum Performans & B\xFCt\xE7e Dostu S\xFCr\xFC\u015F"))), React.createElement("button", {
    onClick: () => {
      setIntroFading(true);
      setTimeout(() => setIsIntroActive(false), 300);
    },
    className: "absolute top-2 right-3 text-[10px] text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700/60 z-20 cursor-pointer transition-all"
  }, "Ge\xE7 \u2715")));
}
ReactDOM.createRoot(document.getElementById('aygaz-masthead-root')).render(React.createElement(Masthead970x250, null));
