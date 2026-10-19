"use strict";

(function() {
  const canvas = document.getElementById("soulCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  let width = 0;
  let height = 0;
  let particles = [];
  const pointer = { x: -1000, y: -1000, active: false };

  const COLORS = [
    { r: 56, g: 189, b: 248 },
    { r: 168, g: 85, b: 247 },
    { r: 249, g: 115, b: 22 }
  ];

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * width,
      y: height + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(0.5 + Math.random() * 1.2),
      radius: 1.5 + Math.random() * 2.5,
      alpha: 0.1 + Math.random() * 0.6,
      fade: 0.003 + Math.random() * 0.004,
      color: col,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(65, Math.floor((width * height) / 22000));
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.y = Math.random() * height;
      particles.push(p);
    }
  }

  function updateAndDraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.4;
      p.y += p.vy;
      p.alpha -= p.fade;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }
      }

      if (p.alpha <= 0 || p.y < -20 || p.x < -20 || p.x > width + 20) {
        particles[i] = createParticle();
        continue;
      }

      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.8);
      grad.addColorStop(0, "rgba(" + p.color.r + "," + p.color.g + "," + p.color.b + "," + p.alpha + ")");
      grad.addColorStop(1, "rgba(" + p.color.r + "," + p.color.g + "," + p.color.b + ",0)");
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(updateAndDraw);
  }

  window.addEventListener("resize", function() {
    resize();
    initParticles();
  });

  window.addEventListener("mousemove", function(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  });

  window.addEventListener("mouseleave", function() {
    pointer.active = false;
  });

  resize();
  initParticles();
  requestAnimationFrame(updateAndDraw);
})();

(function() {
  const btn = document.getElementById("btnAudioToggle");
  const audio = document.getElementById("audioLobby");
  const iconOff = document.getElementById("iconAudioOff");
  const iconOn = document.getElementById("iconAudioOn");
  const label = document.getElementById("audioLabel");

  if (!btn || !audio) return;

  btn.addEventListener("click", function() {
    if (audio.paused) {
      audio.volume = 0.45;
      audio.play().then(function() {
        btn.classList.add("active");
        iconOff.classList.add("hidden");
        iconOn.classList.remove("hidden");
        if (label) label.textContent = "BGM ON";
      }).catch(function() {
        btn.classList.remove("active");
      });
    } else {
      audio.pause();
      btn.classList.remove("active");
      iconOff.classList.remove("hidden");
      iconOn.classList.add("hidden");
      if (label) label.textContent = "BGM OFF";
    }
  });
})();

(function() {
  const versionEl = document.getElementById("versionText");
  const infoAndroid = document.getElementById("infoAndroid");
  const linkAndroid = document.getElementById("btnDownloadAndroid");
  const linkPc = document.getElementById("btnDownloadPc");
  const linkMsi = document.getElementById("linkDownloadMsi");

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return "";
    const mb = bytes / (1024 * 1024);
    return " (" + mb.toFixed(1) + " MB)";
  }

  fetch("https://api.github.com/repos/Nakenzo/Soul-Essence/releases/latest")
    .then(function(res) {
      if (!res.ok) throw new Error("Gagal memuat status");
      return res.json();
    })
    .then(function(data) {
      const tag = data.tag_name || "v0.1.0";
      if (versionEl) {
        versionEl.textContent = "Versi Terbaru: " + tag + " • Siap Diunduh";
      }

      if (Array.isArray(data.assets)) {
        for (let i = 0; i < data.assets.length; i++) {
          const a = data.assets[i];
          const sizeStr = formatBytes(a.size);
          if (a.name === "Soul-Essence.apk") {
            if (linkAndroid && a.browser_download_url) linkAndroid.href = a.browser_download_url;
            if (infoAndroid) infoAndroid.textContent = "Soul-Essence.apk" + sizeStr;
          } else if (a.name === "Soul-Essence-Setup.exe") {
            if (linkPc && a.browser_download_url) linkPc.href = a.browser_download_url;
          } else if (a.name === "Soul-Essence.msi") {
            if (linkMsi && a.browser_download_url) linkMsi.href = a.browser_download_url;
          }
        }
      }
    })
    .catch(function() {
      if (versionEl) {
        versionEl.textContent = "Rilis Resmi v0.1.0 • Siap Diunduh";
      }
    });
})();

(function() {
  const cards = document.querySelectorAll(".platform-card");
  if (!cards.length) return;

  cards.forEach(function(card) {
    card.addEventListener("mousemove", function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotX = ((y - midY) / midY) * -4;
      const rotY = ((x - midX) / midX) * 4;

      card.style.transform = "perspective(1000px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) translateY(-6px)";
    });

    card.addEventListener("mouseleave", function() {
      card.style.transform = "";
    });
  });
})();

(function() {
  const ELEMENTS = [
    { id: "nature", name: "Nature", color: "#22c55e", icon: "assets/element-nature.svg", x: 400, y: 75, labelY: -48 },
    { id: "api", name: "Api", color: "#f97316", icon: "assets/element-api.svg", x: 400, y: 360, labelY: 48 },
    { id: "es", name: "Es", color: "#38bdf8", icon: "assets/element-es.svg", x: 400, y: 645, labelY: 48 },
    { id: "petir", name: "Petir", color: "#facc15", icon: "assets/element-petir.svg", x: 150, y: 360, labelY: 48 },
    { id: "nihil", name: "Nihil", color: "#a855f7", icon: "assets/element-nihil.svg", x: 650, y: 360, labelY: 48 },
    { id: "angin", name: "Angin", color: "#34d399", icon: "assets/element-angin.svg", x: 135, y: 115, labelY: 48 },
    { id: "tanah", name: "Tanah", color: "#d97706", icon: "assets/element-tanah.svg", x: 665, y: 115, labelY: 48 },
    { id: "fisik", name: "Fisik", color: "#cbd5e1", icon: "assets/element-fisik.svg", x: 145, y: 590, labelY: 48 }
  ];

  const CHART_RIBBONS = [
    {
      id: "combustion",
      e1: "api",
      e2: "nature",
      x1: 400,
      y1: 360,
      x2: 400,
      y2: 75,
      r1: 46,
      r2: 46,
      double: true,
      label: "COMBUSTION"
    },
    {
      id: "melt",
      e1: "api",
      e2: "es",
      x1: 400,
      y1: 360,
      x2: 400,
      y2: 645,
      r1: 46,
      r2: 46,
      double: true,
      label: "MELT (x2.0)"
    },
    {
      id: "overload",
      e1: "petir",
      e2: "api",
      x1: 150,
      y1: 360,
      x2: 400,
      y2: 360,
      r1: 46,
      r2: 46,
      double: true,
      label: "OVERLOAD"
    },
    {
      id: "flame_corrosion",
      e1: "api",
      e2: "nihil",
      x1: 400,
      y1: 360,
      x2: 650,
      y2: 360,
      r1: 46,
      r2: 46,
      double: true,
      label: "FLAME CORROSION"
    },
    {
      id: "catalyze",
      e1: "petir",
      e2: "nature",
      x1: 150,
      y1: 360,
      x2: 400,
      y2: 75,
      r1: 46,
      r2: 46,
      double: true,
      label: "CATALYZE"
    },
    {
      id: "superconduct",
      e1: "petir",
      e2: "es",
      x1: 150,
      y1: 360,
      x2: 400,
      y2: 645,
      r1: 46,
      r2: 46,
      double: true,
      label: "SUPERCONDUCT"
    },
    {
      id: "plague_corrosion",
      e1: "nature",
      e2: "nihil",
      x1: 400,
      y1: 75,
      x2: 650,
      y2: 360,
      r1: 46,
      r2: 46,
      double: true,
      label: "PLAGUE CORROSION"
    },
    {
      id: "frost_corrosion",
      e1: "nihil",
      e2: "es",
      x1: 650,
      y1: 360,
      x2: 400,
      y2: 645,
      r1: 46,
      r2: 46,
      double: true,
      label: "FROST CORROSION"
    },
    {
      id: "shatter",
      e1: "fisik",
      e2: "es",
      x1: 145,
      y1: 590,
      x2: 400,
      y2: 645,
      r1: 46,
      r2: 46,
      double: true,
      label: "SHATTER (x2.5)"
    },
    {
      id: "swirl_api",
      e1: "angin",
      e2: "api",
      x1: 135,
      y1: 115,
      x2: 275,
      y2: 235,
      r1: 46,
      r2: 10,
      double: false,
      label: "SWIRL (4 Elemen)"
    },
    {
      id: "cryst_api",
      e1: "tanah",
      e2: "api",
      x1: 665,
      y1: 115,
      x2: 525,
      y2: 235,
      r1: 46,
      r2: 10,
      double: false,
      label: "CRYSTALLIZE"
    }
  ];

  const REACTIONS = [
    {
      id: "melt",
      e1: "api",
      e2: "es",
      name: "MELT",
      cat: "energi",
      desc: "Peleburan panas ekstrem yang melipatgandakan damage serangan menjadi 2.0x lipat instan.",
      tip: "Taktik: Dinginkan musuh dengan panah es Kenzro lalu sambut dengan sabit api Vender untuk damage puncak."
    },
    {
      id: "overload",
      e1: "api",
      e2: "petir",
      name: "OVERLOAD",
      cat: "energi",
      desc: "Ledakan plasma dahsyat berskala AoE yang mementalkan musuh di dekatnya.",
      tip: "Taktik: Efektif membubarkan formasi kerumunan monster kecil yang mengepung karakter."
    },
    {
      id: "combustion",
      e1: "api",
      e2: "nature",
      name: "COMBUSTION",
      cat: "energi",
      desc: "Kobaran api hayati membakar hebat dengan DoT tinggi yang bisa menyebar ke musuh lain.",
      tip: "Taktik: Tempelkan benih nature lalu sulut dengan api untuk damage bakar berkepanjangan."
    },
    {
      id: "superconduct",
      e1: "es",
      e2: "petir",
      name: "SUPERCONDUCT",
      cat: "energi",
      desc: "Hantaran suhu rendah bertegangan tinggi yang meruntuhkan Armor/Defense musuh sebesar 40%.",
      tip: "Taktik: Sangat krusial digunakan sebelum melancarkan rentetan damage fisik masif."
    },
    {
      id: "catalyze",
      e1: "petir",
      e2: "nature",
      name: "CATALYZE",
      cat: "energi",
      desc: "Medan bio-listrik yang memicu sengatan listrik rantai tambahan pada setiap serangan berikutnya.",
      tip: "Taktik: Cocok untuk karakter dengan attack speed tinggi agar memicu proc listrik beruntun."
    },
    {
      id: "frostbite_spore",
      e1: "es",
      e2: "nature",
      name: "FROSTBITE SPORE",
      cat: "energi",
      desc: "Spora es meletus, membekukan musuh di sekitar target selama 1.5 detik.",
      tip: "Taktik: Hentikan laju monster cepat agar posisinya terkunci di arena."
    },
    {
      id: "flame_corrosion",
      e1: "nihil",
      e2: "api",
      name: "FLAME CORROSION",
      cat: "nihil",
      desc: "Korosi api hitam yang menggerogoti HP musuh dan menular ke monster lain yang bersentuhan.",
      tip: "Taktik: Api hitam akan terus menyebar selama musuh bergerombol rapat."
    },
    {
      id: "frost_corrosion",
      e1: "nihil",
      e2: "es",
      name: "FROST CORROSION",
      cat: "nihil",
      desc: "Korosi dingin ekstrem yang membekukan musuh seketika selama 1.5 detik dan mengikis movement speed.",
      tip: "Taktik: Kunci musuh berbahaya tanpa memberi jeda serangan balasan."
    },
    {
      id: "plague_corrosion",
      e1: "nihil",
      e2: "nature",
      name: "PLAGUE CORROSION",
      cat: "nihil",
      desc: "Korosi asam hayati yang merontokkan 30% armor musuh dan menguras HP secara bertahap.",
      tip: "Taktik: Sangat efektif mengikis musuh dengan darah tebal."
    },
    {
      id: "volt_corrosion",
      e1: "nihil",
      e2: "petir",
      name: "VOLT CORROSION",
      cat: "nihil",
      desc: "Korosi statis yang memancarkan sengatan mini setiap detik, menginterupsi animasi serangan musuh.",
      tip: "Taktik: Gagalkan jurus bos yang memiliki waktu ancang-ancang panjang."
    },
    {
      id: "enchant_corrosion",
      e1: "nihil",
      e2: "fisik",
      name: "ENCHANT CORROSION",
      cat: "nihil",
      desc: "Skill fisik memicu pasif buff pelapisan korosi selama 5 detik untuk seluruh serangan karakter.",
      tip: "Taktik: Aktifkan skill fisik pada musuh void, lalu serang bebas dengan base attack."
    },
    {
      id: "shatter",
      e1: "fisik",
      e2: "es",
      name: "SHATTER",
      cat: "fisik",
      desc: "Memecahkan kristal es musuh dengan damage kritis instan x2.5 lipat dan menyebarkan serpihan es.",
      tip: "Taktik: Bekukan musuh terlebih dahulu lalu hantam dengan serangan fisik keras."
    },
    {
      id: "discharge",
      e1: "fisik",
      e2: "petir",
      name: "DISCHARGE",
      cat: "fisik",
      desc: "Pelepasan arus mendadak yang memicu micro-stun 0.4 detik dan membatalkan serangan musuh.",
      tip: "Taktik: Gunakan untuk menghentikan serangan mendadak monster agresif."
    },
    {
      id: "spark",
      e1: "fisik",
      e2: "api",
      name: "SPARK",
      cat: "fisik",
      desc: "Letupan percikan gesekan bara (+25% Crit Damage + Micro Knockback mundur).",
      tip: "Taktik: Beri jarak aman bagi pemain jarak dekat saat menyerang musuh membara."
    },
    {
      id: "splinter",
      e1: "fisik",
      e2: "nature",
      name: "SPLINTER",
      cat: "fisik",
      desc: "Pecahan duri tajam berhamburan ke segala arah dan menimbulkan pendarahan ringan.",
      tip: "Taktik: Mengubah serangan fisik satu target menjadi kerusakan area mini."
    },
    {
      id: "swirl_api",
      e1: "angin",
      e2: "api",
      name: "FIRE SWIRL",
      cat: "angin",
      desc: "Pusaran badai api menyerap elemen dan menyebarkan aura bakar ke seluruh musuh di sekitar.",
      tip: "Taktik: Menyebarkan status bakar ke seluruh gerombolan musuh hanya dengan satu hembusan."
    },
    {
      id: "swirl_es",
      e1: "angin",
      e2: "es",
      name: "FROST SWIRL",
      cat: "angin",
      desc: "Pusaran badai es menyebarkan efek perlambatan gerak dan hawa dingin ke area luas.",
      tip: "Taktik: Melambatkan seluruh pasukan musuh di satu layar sekaligus."
    },
    {
      id: "swirl_petir",
      e1: "angin",
      e2: "petir",
      name: "THUNDER SWIRL",
      cat: "angin",
      desc: "Pusaran angin petir memicu sambaran listrik berantai ke beberapa monster terdekat.",
      tip: "Taktik: Memperluas jangkauan sengatan listrik Voiz tanpa harus mendekati musuh."
    },
    {
      id: "swirl_nature",
      e1: "angin",
      e2: "nature",
      name: "NATURE SWIRL",
      cat: "angin",
      desc: "Pusaran daun berputar menyebarkan benih flora ke seluruh target di sekitarnya.",
      tip: "Taktik: Mempersiapkan banyak musuh sekaligus untuk kombo reaksi lanjutan."
    },
    {
      id: "cryst_api",
      e1: "tanah",
      e2: "api",
      name: "FIRE CRYSTALLIZE",
      cat: "tanah",
      desc: "Menjatuhkan kristal perisai api di lantai; memberikan perisai penyerap damage api.",
      tip: "Taktik: Ambil pecahan kristal agar kebal terhadap serangan bara musuh."
    },
    {
      id: "cryst_es",
      e1: "tanah",
      e2: "es",
      name: "FROST CRYSTALLIZE",
      cat: "tanah",
      desc: "Menjatuhkan kristal perisai es; memberikan perisai penyerap damage es.",
      tip: "Taktik: Menangkal efek beku dari serangan bos berelemen es."
    },
    {
      id: "crush",
      e1: "tanah",
      e2: "fisik",
      name: "CRUSH",
      cat: "tanah",
      desc: "Hantaman remuk yang meremukkan ketahanan monster armor tebal dan memberi efek stun singkat.",
      tip: "Taktik: Hancurkan pelindung musuh yang memiliki bar armor keras."
    },
    {
      id: "erosion",
      e1: "tanah",
      e2: "nihil",
      name: "EROSION",
      cat: "tanah",
      desc: "Pengikisan kepadatan tanah yang mengabaikan 50% defense musuh terhadap serangan berikutnya.",
      tip: "Taktik: Membuat musuh dengan pertahanan tinggi menjadi sangat rentan."
    }
  ];

  const svg = document.getElementById("reactionChartSvg");
  const grid = document.getElementById("reactionsGrid");

  const inspTitle = document.getElementById("inspectorTitle");
  const inspFormula = document.getElementById("inspectorFormula");
  const inspDesc = document.getElementById("inspectorDesc");
  const inspTip = document.getElementById("inspectorTip");
  const inspIcon1 = document.getElementById("inspIcon1");
  const inspIcon2 = document.getElementById("inspIcon2");
  const inspCatBadge = document.getElementById("inspectorCatBadge");

  let selectedElementId = "api";
  let selectedReactionId = "melt";
  let activeFilter = "all";

  function getElementById(id) {
    return ELEMENTS.find(function(e) { return e.id === id; });
  }

  function getReactionById(id) {
    return REACTIONS.find(function(r) { return r.id === id; });
  }

  function makeRibbonPath(x1, y1, x2, y2, r1, r2, width, headLen, headWidth, doubleHeaded) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= r1 + r2) return null;

    const ux = dx / dist;
    const uy = dy / dist;
    const px = -uy;
    const py = ux;

    const sx = x1 + ux * r1;
    const sy = y1 + uy * r1;
    const ex = x2 - ux * r2;
    const ey = y2 - uy * r2;

    const halfW = width / 2;
    const halfHw = headWidth / 2;

    if (doubleHeaded) {
      const p1x = sx;
      const p1y = sy;
      const p2x = sx + ux * headLen + px * halfHw;
      const p2y = sy + uy * headLen + py * halfHw;
      const p3x = sx + ux * headLen + px * halfW;
      const p3y = sy + uy * headLen + py * halfW;

      const p4x = ex - ux * headLen + px * halfW;
      const p4y = ey - uy * headLen + py * halfW;
      const p5x = ex - ux * headLen + px * halfHw;
      const p5y = ey - uy * headLen + py * halfHw;
      const p6x = ex;
      const p6y = ey;

      const p7x = ex - ux * headLen - px * halfHw;
      const p7y = ey - uy * headLen - py * halfHw;
      const p8x = ex - ux * headLen - px * halfW;
      const p8y = ey - uy * headLen - py * halfW;

      const p9x = sx + ux * headLen - px * halfW;
      const p9y = sy + uy * headLen - py * halfW;
      const p10x = sx + ux * headLen - px * halfHw;
      const p10y = sy + uy * headLen - py * halfHw;

      return "M " + p1x.toFixed(1) + " " + p1y.toFixed(1) +
             " L " + p2x.toFixed(1) + " " + p2y.toFixed(1) +
             " L " + p3x.toFixed(1) + " " + p3y.toFixed(1) +
             " L " + p4x.toFixed(1) + " " + p4y.toFixed(1) +
             " L " + p5x.toFixed(1) + " " + p5y.toFixed(1) +
             " L " + p6x.toFixed(1) + " " + p6y.toFixed(1) +
             " L " + p7x.toFixed(1) + " " + p7y.toFixed(1) +
             " L " + p8x.toFixed(1) + " " + p8y.toFixed(1) +
             " L " + p9x.toFixed(1) + " " + p9y.toFixed(1) +
             " L " + p10x.toFixed(1) + " " + p10y.toFixed(1) + " Z";
    } else {
      const p1x = sx + px * halfW;
      const p1y = sy + py * halfW;
      const p2x = ex - ux * headLen + px * halfW;
      const p2y = ey - uy * headLen + py * halfW;
      const p3x = ex - ux * headLen + px * halfHw;
      const p3y = ey - uy * headLen + py * halfHw;
      const p4x = ex;
      const p4y = ey;
      const p5x = ex - ux * headLen - px * halfHw;
      const p5y = ey - uy * headLen - py * halfHw;
      const p6x = ex - ux * headLen - px * halfW;
      const p6y = ey - uy * headLen - py * halfW;
      const p7x = sx - px * halfW;
      const p7y = sy - py * halfW;

      return "M " + p1x.toFixed(1) + " " + p1y.toFixed(1) +
             " L " + p2x.toFixed(1) + " " + p2y.toFixed(1) +
             " L " + p3x.toFixed(1) + " " + p3y.toFixed(1) +
             " L " + p4x.toFixed(1) + " " + p4y.toFixed(1) +
             " L " + p5x.toFixed(1) + " " + p5y.toFixed(1) +
             " L " + p6x.toFixed(1) + " " + p6y.toFixed(1) +
             " L " + p7x.toFixed(1) + " " + p7y.toFixed(1) + " Z";
    }
  }

  function renderInfographicChart() {
    if (!svg) return;
    svg.innerHTML = "";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    CHART_RIBBONS.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      grad.setAttribute("id", "grad-" + r.id);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", r.x1.toString());
      grad.setAttribute("y1", r.y1.toString());
      grad.setAttribute("x2", r.x2.toString());
      grad.setAttribute("y2", r.y2.toString());

      const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", e1.color);
      stop1.setAttribute("stop-opacity", "0.92");

      const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", e2.color);
      stop2.setAttribute("stop-opacity", "0.92");

      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });

    svg.appendChild(defs);

    const bgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    bgGroup.setAttribute("class", "diagram-bg-group");

    const diamondGrid = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    diamondGrid.setAttribute("points", "400,75 650,360 400,645 150,360");
    diamondGrid.setAttribute("class", "diagram-diamond-grid");
    bgGroup.appendChild(diamondGrid);

    const dashCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dashCircle.setAttribute("cx", "400");
    dashCircle.setAttribute("cy", "360");
    dashCircle.setAttribute("r", "160");
    dashCircle.setAttribute("class", "diagram-dash-circle");
    bgGroup.appendChild(dashCircle);

    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", "400");
    bgCircle.setAttribute("cy", "360");
    bgCircle.setAttribute("r", "280");
    bgCircle.setAttribute("class", "diagram-bg-circle");
    bgGroup.appendChild(bgCircle);

    const swirlZone = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    swirlZone.setAttribute("points", "50,40 240,40 280,210 180,240 50,180");
    swirlZone.setAttribute("class", "zone-polygon");
    swirlZone.setAttribute("fill", "#34d399");
    swirlZone.setAttribute("fill-opacity", "0.10");
    swirlZone.setAttribute("stroke", "#34d399");
    swirlZone.setAttribute("stroke-width", "1.5");
    swirlZone.setAttribute("stroke-dasharray", "5 5");
    swirlZone.setAttribute("data-element", "angin");
    swirlZone.addEventListener("click", function() {
      selectElement("angin");
    });
    bgGroup.appendChild(swirlZone);

    const swirlLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    swirlLabel.setAttribute("x", "135");
    swirlLabel.setAttribute("y", "55");
    swirlLabel.setAttribute("class", "zone-label");
    swirlLabel.setAttribute("fill", "#34d399");
    swirlLabel.setAttribute("text-anchor", "middle");
    swirlLabel.textContent = "PUSARAN (SWIRL)";
    bgGroup.appendChild(swirlLabel);

    const crystZone = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    crystZone.setAttribute("points", "560,40 750,40 750,180 620,240 520,210");
    crystZone.setAttribute("class", "zone-polygon");
    crystZone.setAttribute("fill", "#d97706");
    crystZone.setAttribute("fill-opacity", "0.10");
    crystZone.setAttribute("stroke", "#d97706");
    crystZone.setAttribute("stroke-width", "1.5");
    crystZone.setAttribute("stroke-dasharray", "5 5");
    crystZone.setAttribute("data-element", "tanah");
    crystZone.addEventListener("click", function() {
      selectElement("tanah");
    });
    bgGroup.appendChild(crystZone);

    const crystLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    crystLabel.setAttribute("x", "655");
    crystLabel.setAttribute("y", "55");
    crystLabel.setAttribute("class", "zone-label");
    crystLabel.setAttribute("fill", "#d97706");
    crystLabel.setAttribute("text-anchor", "middle");
    crystLabel.textContent = "KRISTAL (CRYSTALLIZE)";
    bgGroup.appendChild(crystLabel);

    const fisikZone = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    fisikZone.setAttribute("points", "45,515 210,535 210,680 65,680");
    fisikZone.setAttribute("class", "zone-polygon");
    fisikZone.setAttribute("fill", "#cbd5e1");
    fisikZone.setAttribute("fill-opacity", "0.08");
    fisikZone.setAttribute("stroke", "#cbd5e1");
    fisikZone.setAttribute("stroke-width", "1.2");
    fisikZone.setAttribute("stroke-dasharray", "4 4");
    fisikZone.setAttribute("data-element", "fisik");
    fisikZone.addEventListener("click", function() {
      selectElement("fisik");
    });
    bgGroup.appendChild(fisikZone);

    const fisikLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    fisikLabel.setAttribute("x", "125");
    fisikLabel.setAttribute("y", "532");
    fisikLabel.setAttribute("class", "zone-label");
    fisikLabel.setAttribute("fill", "#cbd5e1");
    fisikLabel.setAttribute("text-anchor", "middle");
    fisikLabel.textContent = "IMPAK KINETIK";
    bgGroup.appendChild(fisikLabel);

    svg.appendChild(bgGroup);

    const ribbonsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ribbonsGroup.setAttribute("class", "diagram-ribbons-group");

    CHART_RIBBONS.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const pathData = makeRibbonPath(r.x1, r.y1, r.x2, r.y2, r.r1, r.r2, 24, 14, 38, r.double);
      if (!pathData) return;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "arrow-ribbon");
      g.setAttribute("data-react-id", r.id);
      g.setAttribute("data-e1", r.e1);
      g.setAttribute("data-e2", r.e2);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("class", "arrow-polygon");
      path.setAttribute("fill", "url(#grad-" + r.id + ")");
      path.setAttribute("stroke", e1.color);

      const midX = (r.x1 + r.x2) / 2;
      const midY = (r.y1 + r.y2) / 2;
      const dx = r.x2 - r.x1;
      const dy = r.y2 - r.y1;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "arrow-text");
      text.setAttribute("transform", "translate(" + midX.toFixed(1) + "," + midY.toFixed(1) + ") rotate(" + angle.toFixed(1) + ")");
      text.textContent = r.label;

      g.appendChild(path);
      g.appendChild(text);

      g.addEventListener("click", function() {
        const found = getReactionById(r.id);
        if (found) {
          selectReaction(found);
        }
      });

      ribbonsGroup.appendChild(g);
    });

    svg.appendChild(ribbonsGroup);

    const crestsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    crestsGroup.setAttribute("class", "diagram-crests-group");

    ELEMENTS.forEach(function(el) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "elem-crest" + (selectedElementId === el.id ? " active" : ""));
      g.setAttribute("data-id", el.id);
      g.setAttribute("transform", "translate(" + el.x.toFixed(1) + "," + el.y.toFixed(1) + ")");

      const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      halo.setAttribute("class", "crest-halo");
      halo.setAttribute("r", "38");
      halo.setAttribute("fill", "none");
      halo.setAttribute("stroke", el.color);
      halo.setAttribute("stroke-width", selectedElementId === el.id ? "3" : "1.8");
      halo.setAttribute("stroke-dasharray", "4 4");
      halo.setAttribute("opacity", selectedElementId === el.id ? "0.95" : "0.4");

      const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      diamond.setAttribute("class", "crest-diamond");
      diamond.setAttribute("points", "0,-35 35,0 0,35 -35,0");
      diamond.setAttribute("stroke", el.color);
      diamond.setAttribute("stroke-width", selectedElementId === el.id ? "2.8" : "2");

      const gem = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      gem.setAttribute("points", "0,-25 25,0 0,25 -25,0");
      gem.setAttribute("fill", el.color);
      gem.setAttribute("fill-opacity", "0.18");
      gem.setAttribute("stroke", el.color);
      gem.setAttribute("stroke-width", "1");

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
      icon.setAttribute("href", el.icon);
      icon.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", el.icon);
      icon.setAttribute("x", "-17");
      icon.setAttribute("y", "-17");
      icon.setAttribute("width", "34");
      icon.setAttribute("height", "34");
      icon.setAttribute("pointer-events", "none");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "crest-label");
      label.setAttribute("x", "0");
      label.setAttribute("y", el.labelY.toString());
      label.textContent = el.name.toUpperCase();

      g.appendChild(halo);
      g.appendChild(diamond);
      g.appendChild(gem);
      g.appendChild(icon);
      g.appendChild(label);

      g.addEventListener("click", function() {
        selectElement(el.id);
      });

      crestsGroup.appendChild(g);
    });

    svg.appendChild(crestsGroup);
  }

  function selectElement(id) {
    selectedElementId = id;

    const crests = document.querySelectorAll(".elem-crest");
    crests.forEach(function(c) {
      const cid = c.getAttribute("data-id");
      if (cid === id) {
        c.classList.add("active");
        c.classList.remove("dimmed");
      } else {
        const isConnected = REACTIONS.some(function(r) {
          return (r.e1 === id && r.e2 === cid) || (r.e2 === id && r.e1 === cid);
        });
        if (isConnected) {
          c.classList.remove("active", "dimmed");
        } else {
          c.classList.add("dimmed");
          c.classList.remove("active");
        }
      }
    });

    const ribbons = document.querySelectorAll(".arrow-ribbon");
    ribbons.forEach(function(rb) {
      const e1 = rb.getAttribute("data-e1");
      const e2 = rb.getAttribute("data-e2");
      if (e1 === id || e2 === id) {
        rb.classList.add("active");
        rb.classList.remove("dimmed");
      } else {
        rb.classList.add("dimmed");
        rb.classList.remove("active", "selected");
      }
    });

    const candidate = REACTIONS.find(function(r) {
      return (r.e1 === id && r.e2 === selectedReactionId) ||
             (r.e2 === id && r.e1 === selectedReactionId) ||
             (r.id === selectedReactionId && (r.e1 === id || r.e2 === id));
    }) || REACTIONS.find(function(r) {
      return r.e1 === id || r.e2 === id;
    });

    if (candidate) {
      selectReaction(candidate);
    }
  }

  function selectReaction(r) {
    if (!r) return;
    selectedReactionId = r.id;

    const e1 = getElementById(r.e1);
    const e2 = getElementById(r.e2);
    if (!e1 || !e2) return;

    if (inspTitle) inspTitle.textContent = r.name;
    if (inspFormula) inspFormula.textContent = e1.name + " + " + e2.name;
    if (inspDesc) inspDesc.textContent = r.desc;
    if (inspTip) inspTip.innerHTML = "<strong>Taktik:</strong> " + r.tip.replace(/^Taktik:\s*/, "");

    if (inspIcon1) {
      inspIcon1.src = e1.icon;
      inspIcon1.alt = e1.name;
    }
    if (inspIcon2) {
      inspIcon2.src = e2.icon;
      inspIcon2.alt = e2.name;
    }

    if (inspCatBadge) {
      const catMap = {
        energi: "REAKSI ENERGI TINGGI",
        angin: "PUSARAN ANGIN (SWIRL)",
        tanah: "DEFENSIF & IMPAK TANAH",
        nihil: "KOROSI KEHAMPAAN",
        fisik: "REAKSI FISIK & KINETIK"
      };
      inspCatBadge.textContent = catMap[r.cat] || "REAKSI SINERGI";
    }

    const ribbons = document.querySelectorAll(".arrow-ribbon");
    ribbons.forEach(function(rb) {
      if (rb.getAttribute("data-react-id") === r.id) {
        rb.classList.add("selected", "active");
        rb.classList.remove("dimmed");
      } else {
        rb.classList.remove("selected");
      }
    });

    const crests = document.querySelectorAll(".elem-crest");
    crests.forEach(function(c) {
      const cid = c.getAttribute("data-id");
      if (cid === r.e1 || cid === r.e2) {
        c.classList.add("active");
        c.classList.remove("dimmed");
      } else {
        c.classList.remove("active");
      }
    });

    const cards = document.querySelectorAll(".reaction-card");
    cards.forEach(function(c) {
      if (c.getAttribute("data-react-id") === r.id) {
        c.classList.add("highlight");
      } else {
        c.classList.remove("highlight");
      }
    });
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = REACTIONS.filter(function(r) {
      if (activeFilter === "all") return true;
      return r.cat === activeFilter;
    });

    filtered.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const card = document.createElement("div");
      card.className = "reaction-card" + (r.id === selectedReactionId ? " highlight" : "");
      card.setAttribute("data-react-id", r.id);

      card.innerHTML =
        '<div class="card-top">' +
          '<div class="react-icons-pair">' +
            '<img src="' + e1.icon + '" alt="' + e1.name + '" class="react-icon-img">' +
            '<span class="plus-sign">+</span>' +
            '<img src="' + e2.icon + '" alt="' + e2.name + '" class="react-icon-img">' +
          '</div>' +
          '<span class="react-badge">' + r.cat.toUpperCase() + '</span>' +
        '</div>' +
        '<h4 class="react-card-title">' + r.name + '</h4>' +
        '<span class="react-formula-text">' + e1.name + ' + ' + e2.name + '</span>' +
        '<p class="react-desc-text">' + r.desc + '</p>';

      card.addEventListener("click", function() {
        selectElement(r.e1);
        selectReaction(r);
        const section = document.getElementById("reactions");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      });

      grid.appendChild(card);
    });
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll(".btn-filter");
    if (!filterBtns.length) return;

    filterBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        filterBtns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter") || "all";
        renderGrid();
      });
    });
  }

  renderInfographicChart();
  renderGrid();
  initFilters();

  if (REACTIONS.length > 0) {
    selectReaction(REACTIONS[0]);
  }
})();
