import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const imageDir = resolve(root, "assets/images");

function svg({ id, a, b, c, glow, shapes }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${id}">
  <defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="0.54" stop-color="${b}"/>
      <stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="38%" r="48%">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.86"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#sky-${id})"/>
  <rect width="1600" height="900" fill="url(#glow-${id})"/>
  ${shapes}
</svg>
`;
}

const assets = [
  {
    id: "movie-title",
    a: "#071018",
    b: "#17324a",
    c: "#0c0507",
    glow: "#b8d8ff",
    shapes: `
  <circle cx="1190" cy="170" r="86" fill="#d6e7ff" opacity="0.82"/>
  <path d="M0 710 C210 640 360 700 530 630 C730 548 940 628 1110 570 C1310 500 1460 545 1600 500 L1600 900 L0 900 Z" fill="#081018" opacity="0.88"/>
  <g fill="#071018">
    <rect x="90" y="390" width="82" height="340"/><rect x="205" y="340" width="120" height="390"/>
    <rect x="365" y="430" width="92" height="300"/><rect x="1120" y="360" width="130" height="370"/>
    <rect x="1290" y="430" width="72" height="300"/><rect x="1410" y="330" width="110" height="400"/>
  </g>
  <g fill="#ffd98f" opacity="0.75">
    <rect x="225" y="384" width="18" height="24"/><rect x="278" y="460" width="18" height="24"/>
    <rect x="1158" y="420" width="18" height="24"/><rect x="1460" y="400" width="18" height="24"/>
  </g>`
  },
  {
    id: "movie-protagonist",
    a: "#1a1020",
    b: "#3b1d3d",
    c: "#081118",
    glow: "#ffc0a6",
    shapes: `
  <ellipse cx="820" cy="730" rx="460" ry="80" fill="#05070a" opacity="0.6"/>
  <path d="M840 270 C780 275 740 330 748 390 C752 430 782 458 805 470 L772 720 L915 720 L885 470 C925 450 945 410 938 368 C930 312 895 270 840 270 Z" fill="#0a0c12"/>
  <path d="M670 720 C720 610 760 530 810 480 L882 480 C940 545 982 620 1020 720 Z" fill="#111827"/>
  <path d="M520 270 C680 310 910 318 1080 230" stroke="#fbbf77" stroke-width="8" opacity="0.36" fill="none"/>`
  },
  {
    id: "movie-incident",
    a: "#17090d",
    b: "#5b1224",
    c: "#050509",
    glow: "#ff6a3d",
    shapes: `
  <path d="M780 0 L842 260 L760 392 L875 510 L790 900" stroke="#ffd2a1" stroke-width="18" fill="none" opacity="0.92"/>
  <path d="M0 690 L260 590 L470 740 L700 620 L910 720 L1160 560 L1600 660 L1600 900 L0 900 Z" fill="#08070a" opacity="0.84"/>
  <g fill="#ffbc68" opacity="0.62">
    <circle cx="480" cy="260" r="18"/><circle cx="1050" cy="340" r="12"/><circle cx="1220" cy="210" r="16"/>
    <circle cx="665" cy="520" r="10"/><circle cx="945" cy="590" r="13"/>
  </g>`
  },
  {
    id: "movie-collapse",
    a: "#101319",
    b: "#373e4b",
    c: "#100c10",
    glow: "#f4b86a",
    shapes: `
  <path d="M0 710 L210 650 L355 705 L520 620 L700 720 L900 590 L1080 698 L1260 620 L1600 705 L1600 900 L0 900 Z" fill="#07090f"/>
  <g fill="#111827" opacity="0.96">
    <path d="M180 370 L330 330 L380 760 L130 760 Z"/><path d="M510 310 L660 370 L640 760 L470 760 Z"/>
    <path d="M1020 330 L1190 310 L1160 760 L980 760 Z"/><path d="M1290 380 L1460 350 L1505 760 L1245 760 Z"/>
  </g>
  <g stroke="#ffcf86" stroke-width="5" opacity="0.55">
    <path d="M250 430 L325 560"/><path d="M555 420 L635 500"/><path d="M1090 390 L1160 510"/><path d="M1360 450 L1480 590"/>
  </g>`
  },
  {
    id: "movie-final",
    a: "#05070a",
    b: "#102235",
    c: "#1d1208",
    glow: "#fff2b7",
    shapes: `
  <path d="M740 0 L900 0 L1030 900 L610 900 Z" fill="#fff0a3" opacity="0.32" filter="url(#soft-movie-final)"/>
  <path d="M0 690 C250 620 360 700 560 640 C760 578 920 650 1120 590 C1350 520 1480 580 1600 540 L1600 900 L0 900 Z" fill="#05070a"/>
  <circle cx="820" cy="590" r="52" fill="#f8fafc" opacity="0.74"/>
  <path d="M780 652 L860 652 L910 790 L730 790 Z" fill="#0a0c12"/>`
  },
  {
    id: "portfolio-idea",
    a: "#20364a",
    b: "#d9a463",
    c: "#263223",
    glow: "#fff5c7",
    shapes: `
  <rect x="250" y="490" width="1100" height="180" rx="8" fill="#302b28" opacity="0.84"/>
  <rect x="430" y="300" width="300" height="190" rx="8" fill="#f4e7cf"/>
  <rect x="790" y="260" width="360" height="230" rx="8" fill="#dce8ef"/>
  <circle cx="800" cy="190" r="70" fill="#fff2a8" opacity="0.86"/>
  <path d="M520 370 L650 370 M520 420 L620 420 M870 330 L1070 330 M870 390 L1010 390" stroke="#314155" stroke-width="14" stroke-linecap="round"/>`
  },
  {
    id: "portfolio-design",
    a: "#0f172a",
    b: "#29436b",
    c: "#13332d",
    glow: "#8dd7ff",
    shapes: `
  <rect x="260" y="170" width="1080" height="560" rx="18" fill="#f8fafc" opacity="0.9"/>
  <rect x="320" y="230" width="280" height="430" rx="8" fill="#d9f99d"/>
  <rect x="650" y="230" width="630" height="120" rx="8" fill="#bfdbfe"/>
  <rect x="650" y="390" width="290" height="270" rx="8" fill="#fecdd3"/>
  <rect x="990" y="390" width="290" height="270" rx="8" fill="#fde68a"/>
  <g stroke="#334155" stroke-width="8" opacity="0.52"><path d="M360 300 H560 M690 290 H1160 M690 450 H900 M1030 450 H1230"/></g>`
  },
  {
    id: "portfolio-code",
    a: "#09111f",
    b: "#103f55",
    c: "#10291f",
    glow: "#67e8f9",
    shapes: `
  <rect x="250" y="165" width="1100" height="570" rx="18" fill="#020617" opacity="0.9"/>
  <rect x="250" y="165" width="1100" height="58" rx="18" fill="#1e293b"/>
  <circle cx="304" cy="194" r="10" fill="#fb7185"/><circle cx="338" cy="194" r="10" fill="#fbbf24"/><circle cx="372" cy="194" r="10" fill="#34d399"/>
  <g stroke-linecap="round" stroke-width="16">
    <path d="M360 310 H610" stroke="#93c5fd"/><path d="M410 370 H820" stroke="#a7f3d0"/>
    <path d="M410 430 H700" stroke="#fde68a"/><path d="M470 490 H1040" stroke="#f0abfc"/>
    <path d="M410 550 H760" stroke="#a7f3d0"/><path d="M360 610 H960" stroke="#93c5fd"/>
  </g>`
  },
  {
    id: "portfolio-iteration",
    a: "#172554",
    b: "#396b68",
    c: "#2b193d",
    glow: "#c4b5fd",
    shapes: `
  <g fill="#f8fafc" opacity="0.88">
    <rect x="235" y="245" width="300" height="360" rx="14"/><rect x="650" y="185" width="300" height="480" rx="14"/><rect x="1065" y="245" width="300" height="360" rx="14"/>
  </g>
  <g stroke="#38bdf8" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.82">
    <path d="M555 420 H620 L590 390 M620 420 L590 450"/>
    <path d="M970 420 H1035 L1005 390 M1035 420 L1005 450"/>
  </g>
  <g fill="#475569" opacity="0.48">
    <rect x="285" y="305" width="200" height="28" rx="8"/><rect x="700" y="255" width="200" height="28" rx="8"/><rect x="1115" y="305" width="200" height="28" rx="8"/>
  </g>`
  },
  {
    id: "portfolio-launch",
    a: "#0b1120",
    b: "#1d4d4f",
    c: "#25160b",
    glow: "#fef3c7",
    shapes: `
  <path d="M0 760 H1600 V900 H0 Z" fill="#080a0f"/>
  <g fill="#f8fafc" opacity="0.9">
    <rect x="280" y="240" width="260" height="360" rx="10"/><rect x="670" y="180" width="260" height="420" rx="10"/><rect x="1060" y="240" width="260" height="360" rx="10"/>
  </g>
  <path d="M360 0 L490 0 L570 720 L250 720 Z" fill="#fde68a" opacity="0.18"/>
  <path d="M1110 0 L1240 0 L1360 720 L990 720 Z" fill="#bfdbfe" opacity="0.18"/>
  <circle cx="800" cy="650" r="54" fill="#facc15" opacity="0.85"/>`
  },
  {
    id: "travel-departure",
    a: "#14213d",
    b: "#4d7c8a",
    c: "#f0b36a",
    glow: "#ffedd5",
    shapes: `
  <rect x="0" y="650" width="1600" height="250" fill="#1f2937"/>
  <path d="M110 630 H1490 L1300 350 H300 Z" fill="#e5e7eb" opacity="0.74"/>
  <rect x="390" y="430" width="820" height="220" rx="24" fill="#f8fafc"/>
  <rect x="460" y="475" width="170" height="92" rx="8" fill="#93c5fd"/><rect x="700" y="475" width="170" height="92" rx="8" fill="#93c5fd"/><rect x="940" y="475" width="170" height="92" rx="8" fill="#93c5fd"/>
  <g stroke="#f8fafc" stroke-width="12"><path d="M210 760 H1390"/><path d="M280 820 H1320"/></g>`
  },
  {
    id: "travel-coast",
    a: "#7dd3fc",
    b: "#2563eb",
    c: "#064e3b",
    glow: "#fff7ad",
    shapes: `
  <circle cx="1220" cy="190" r="92" fill="#fde68a"/>
  <path d="M0 600 C180 560 320 630 520 590 C740 545 900 628 1120 575 C1320 530 1460 565 1600 520 L1600 900 L0 900 Z" fill="#0ea5e9" opacity="0.88"/>
  <path d="M0 710 C250 660 390 740 610 700 C830 650 1050 750 1600 675 L1600 900 L0 900 Z" fill="#f5deb3"/>
  <path d="M120 630 C310 610 410 660 600 632" stroke="#f8fafc" stroke-width="10" fill="none" opacity="0.72"/>`
  },
  {
    id: "travel-city",
    a: "#151b2d",
    b: "#4b5563",
    c: "#422006",
    glow: "#fb923c",
    shapes: `
  <path d="M0 700 H1600 V900 H0 Z" fill="#1f2937"/>
  <g fill="#0f172a">
    <rect x="80" y="350" width="120" height="350"/><rect x="260" y="270" width="150" height="430"/><rect x="500" y="410" width="110" height="290"/>
    <rect x="980" y="320" width="150" height="380"/><rect x="1190" y="260" width="130" height="440"/><rect x="1380" y="390" width="100" height="310"/>
  </g>
  <path d="M620 900 L810 520 L990 900 Z" fill="#111827"/>
  <g fill="#facc15" opacity="0.75">
    <circle cx="720" cy="690" r="12"/><circle cx="880" cy="690" r="12"/><rect x="300" y="350" width="18" height="28"/><rect x="1240" y="340" width="18" height="28"/>
  </g>`
  },
  {
    id: "travel-night",
    a: "#020617",
    b: "#172554",
    c: "#111827",
    glow: "#a5b4fc",
    shapes: `
  <circle cx="1190" cy="180" r="72" fill="#e0e7ff" opacity="0.86"/>
  <path d="M0 640 C240 590 380 665 590 620 C850 565 1010 660 1600 610 L1600 900 L0 900 Z" fill="#0f172a"/>
  <path d="M0 760 C260 715 520 790 800 745 C1060 700 1260 762 1600 720 L1600 900 L0 900 Z" fill="#111827"/>
  <g fill="#fef3c7" opacity="0.8"><circle cx="310" cy="180" r="5"/><circle cx="540" cy="120" r="4"/><circle cx="820" cy="220" r="5"/><circle cx="1370" cy="285" r="4"/></g>`
  },
  {
    id: "story-cover",
    a: "#13351f",
    b: "#2f6b45",
    c: "#f1c27d",
    glow: "#fef08a",
    shapes: `
  <circle cx="800" cy="260" r="120" fill="#fde68a" opacity="0.7"/>
  <path d="M0 640 C210 570 420 650 590 590 C810 510 1050 630 1600 530 L1600 900 L0 900 Z" fill="#164e2f"/>
  <g fill="#0f3f24">
    <path d="M160 700 L250 360 L350 700 Z"/><path d="M360 710 L470 300 L590 710 Z"/><path d="M1080 710 L1190 340 L1320 710 Z"/><path d="M1320 700 L1430 300 L1550 700 Z"/>
  </g>
  <path d="M680 735 C740 680 860 680 920 735 L920 800 C860 750 740 750 680 800 Z" fill="#f8fafc" opacity="0.9"/>`
  },
  {
    id: "story-path",
    a: "#0f2418",
    b: "#2f5d3f",
    c: "#10251a",
    glow: "#b7f7c5",
    shapes: `
  <path d="M0 690 C230 580 390 690 600 595 C820 496 1040 640 1600 520 L1600 900 L0 900 Z" fill="#123b24"/>
  <path d="M690 900 C740 720 780 580 805 420 C835 585 890 720 980 900 Z" fill="#caa66a" opacity="0.88"/>
  <g fill="#0b2c1a"><path d="M160 730 L280 240 L420 730 Z"/><path d="M1120 730 L1240 250 L1390 730 Z"/><path d="M430 730 L520 340 L650 730 Z"/></g>
  <circle cx="810" cy="360" r="34" fill="#fef9c3" opacity="0.88"/>`
  },
  {
    id: "story-lost",
    a: "#020617",
    b: "#13251d",
    c: "#100f1f",
    glow: "#64748b",
    shapes: `
  <g fill="#07150f">
    <path d="M0 760 L120 210 L260 760 Z"/><path d="M260 780 L390 160 L540 780 Z"/><path d="M530 790 L690 250 L850 790 Z"/>
    <path d="M820 790 L990 190 L1160 790 Z"/><path d="M1120 790 L1300 155 L1490 790 Z"/><path d="M1400 790 L1540 260 L1600 790 Z"/>
  </g>
  <path d="M720 900 C740 750 780 650 810 520 C850 650 890 750 930 900 Z" fill="#3f2f22"/>
  <circle cx="810" cy="500" r="18" fill="#fef08a" opacity="0.78"/>`
  },
  {
    id: "story-light",
    a: "#10251a",
    b: "#236449",
    c: "#19334f",
    glow: "#fef3c7",
    shapes: `
  <circle cx="820" cy="380" r="160" fill="#fef3c7" opacity="0.42" filter="url(#soft-story-light)"/>
  <path d="M0 705 C240 620 430 710 650 640 C860 570 1060 690 1600 610 L1600 900 L0 900 Z" fill="#0f3f2a"/>
  <g fill="#0c2d20" opacity="0.88"><path d="M130 730 L250 270 L390 730 Z"/><path d="M1170 730 L1290 270 L1430 730 Z"/></g>
  <circle cx="820" cy="420" r="42" fill="#fff7ad" opacity="0.92"/>`
  },
  {
    id: "story-exit",
    a: "#173b2b",
    b: "#5b8f65",
    c: "#f2ba74",
    glow: "#fef08a",
    shapes: `
  <path d="M0 680 C210 600 420 690 640 610 C880 520 1080 660 1600 540 L1600 900 L0 900 Z" fill="#165237"/>
  <path d="M640 900 C700 710 760 600 805 470 C860 600 940 720 1040 900 Z" fill="#d9b573"/>
  <path d="M650 620 C700 470 910 470 960 620 L930 620 C880 520 730 520 680 620 Z" fill="#f8fafc" opacity="0.78"/>
  <circle cx="810" cy="430" r="88" fill="#fde68a" opacity="0.72"/>`
  },
  {
    id: "story-ending",
    a: "#f7c06a",
    b: "#7dd3fc",
    c: "#2f6b45",
    glow: "#fff7ad",
    shapes: `
  <circle cx="800" cy="430" r="130" fill="#fde68a" opacity="0.78"/>
  <path d="M0 660 C210 580 420 670 640 600 C880 520 1080 660 1600 540 L1600 900 L0 900 Z" fill="#3f8f5f"/>
  <path d="M0 760 C280 690 520 780 800 710 C1060 650 1320 730 1600 680 L1600 900 L0 900 Z" fill="#256d46"/>
  <path d="M700 735 C760 690 860 690 920 735 L920 790 C860 755 760 755 700 790 Z" fill="#f8fafc" opacity="0.9"/>`
  }
];

await mkdir(imageDir, { recursive: true });

await Promise.all(
  assets.map((asset) => writeFile(resolve(imageDir, `${asset.id}.svg`), svg(asset)))
);
