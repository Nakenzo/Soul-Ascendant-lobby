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

  fetch("https://api.github.com/repos/Nakenzo/Soul-Ascendant/releases/latest")
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
          if (a.name === "Soul-Ascendant.apk") {
            if (linkAndroid && a.browser_download_url) linkAndroid.href = a.browser_download_url;
            if (infoAndroid) infoAndroid.textContent = a.name + sizeStr;
          } else if (a.name === "Soul-Ascendant.exe") {
            if (linkPc && a.browser_download_url) linkPc.href = a.browser_download_url;
          } else if (a.name === "Soul-Ascendant-Setup.exe") {
            const linkSetup = document.getElementById("linkDownloadSetup");
            if (linkSetup && a.browser_download_url) linkSetup.href = a.browser_download_url;
          } else if (a.name === "Soul-Ascendant.msi") {
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
    { id: "nature", name: "Nature", color: "#22c55e", icon: "assets/element-nature.svg", x: 440, y: 120, labelX: 0, labelY: -46 },
    { id: "tanah", name: "Tanah", color: "#d97706", icon: "assets/element-tanah.svg", x: 690, y: 240, labelX: 48, labelY: -20 },
    { id: "nihil", name: "Nihil", color: "#a855f7", icon: "assets/element-nihil.svg", x: 752, y: 511, labelX: 52, labelY: 4 },
    { id: "es", name: "Es", color: "#38bdf8", icon: "assets/element-es.svg", x: 579, y: 728, labelX: 0, labelY: 46 },
    { id: "api", name: "Api", color: "#f97316", icon: "assets/element-api.svg", x: 301, y: 728, labelX: 0, labelY: 46 },
    { id: "petir", name: "Petir", color: "#facc15", icon: "assets/element-petir.svg", x: 128, y: 511, labelX: -52, labelY: 4 },
    { id: "angin", name: "Angin", color: "#34d399", icon: "assets/element-angin.svg", x: 190, y: 240, labelX: -48, labelY: -20 },
    { id: "fisik", name: "Fisik", color: "#cbd5e1", icon: "assets/element-fisik.svg", x: 440, y: 440, labelX: 0, labelY: -46 }
  ];

  const REACTIONS = [
    {
      id: "shatters",
      e1: "fisik",
      e2: "es",
      name: "SHATTERS",
      label: "SHATTERS x2.5",
      badgeT: 0.50,
      cat: "fisik",
      anim: "shatters",
      desc: "Pecahan es fatal saat musuh yang membeku total (Freeze) dihantam serangan Fisik. Menimbulkan burst damage kritis 2.5x lipat berskala EM dan memecahkan kebekuan musuh.",
      tip: "Taktik: Timbun Elemental Gauge es sampai musuh membeku (Freeze), lalu hantam dengan serangan fisik untuk burst damage puncak."
    },
    {
      id: "vortex",
      e1: "fisik",
      e2: "angin",
      name: "VORTEX",
      label: "VORTEX",
      badgeT: 0.50,
      cat: "fisik",
      anim: "vortex",
      desc: "Hantaman fisik berpadu pusaran angin memicu daya hisap vakum yang menarik musuh sekitar dalam radius 240px ke pusat ledakan dan memberi damage instan berskala EM.",
      tip: "Taktik: Kumpulkan gerombolan monster ke satu titik sebelum melancarkan serangan area besar."
    },
    {
      id: "assault",
      e1: "fisik",
      e2: "api",
      name: "ASSAULT",
      label: "ASSAULT!",
      badgeT: 0.45,
      cat: "fisik",
      anim: "assault",
      desc: "Serangan tebasan fisik saat musuh terkena status Burn. Memberikan damage tebasan beruntun 1.8x lipat ditambah seluruh sisa damage bakar seketika.",
      tip: "Taktik: Bakar musuh hingga terbakar (Burn), lalu timpa dengan serangan fisik untuk meletuskan seluruh sisa DoT api sekaligus."
    },
    {
      id: "discharge",
      e1: "fisik",
      e2: "petir",
      name: "DISCHARGE",
      label: "DISCHARGE!",
      badgeT: 0.50,
      cat: "fisik",
      anim: "discharge",
      desc: "Pelepasan muatan listrik statis dahsyat saat musuh yang lumpuh (Paralyze) ditimpa serangan fisik. Menghasilkan bonus damage 1.9x lipat dan memancarkan sengatan listrik rantai (chain lightning) ke musuh lain dalam radius 180px.",
      tip: "Taktik: Timbun gauge listrik hingga musuh mengalami Paralyze, lalu hantam dengan serangan fisik untuk menyengat gerombolan musuh sekitar."
    },
    {
      id: "bleeding_nature",
      e1: "fisik",
      e2: "nature",
      name: "BLEEDING",
      label: "BLEEDING!",
      badgeT: 0.50,
      cat: "fisik",
      anim: "bleeding",
      desc: "Luka robek duri alami memicu pendarahan hebat berkepanjangan selama 4 detik (tick tiap 0.35s berskala damage awal & EM).",
      tip: "Taktik: Terapkan efek bleed lalu jaga jarak selagi musuh terkikis darahnya."
    },
    {
      id: "crush",
      e1: "tanah",
      e2: "fisik",
      name: "CRUSH",
      label: "CRUSH!",
      badgeT: 0.50,
      cat: "tanah",
      anim: "crush",
      desc: "Hantaman remuk kinetik pada musuh yang mengalami efek Crystalize. Menghasilkan damage remuk 2.2x lipat berskala EM dan memberikan stun berat 0.4 detik pada musuh.",
      tip: "Taktik: Penuhi gauge elemen Tanah hingga musuh ter-Crystalize, lalu hantam dengan fisik untuk menghentikan gerak musuh."
    },
    {
      id: "enchant_corrosion",
      e1: "nihil",
      e2: "fisik",
      name: "ENCHANT CORROSION",
      label: "VOID ENCHANT",
      badgeT: 0.50,
      cat: "nihil",
      anim: "void_corrosion",
      desc: "Skill fisik memicu pasif buff pelapisan korosi selama 5 detik untuk seluruh serangan karakter.",
      tip: "Taktik: Aktifkan skill fisik pada musuh void, lalu serang bebas dengan base attack."
    },

    {
      id: "melt",
      e1: "api",
      e2: "es",
      name: "MELT",
      label: "MELT x2.0",
      badgeT: 0.50,
      cat: "energi",
      anim: "melt",
      desc: "Peleburan panas ekstrem yang melipatgandakan damage serangan menjadi 2.0x lipat instan.",
      tip: "Taktik: Dinginkan musuh dengan panah es Kenzro lalu sambut dengan sabit api Vender untuk damage puncak."
    },
    {
      id: "overload",
      e1: "api",
      e2: "petir",
      name: "OVERLOAD",
      label: "OVERLOAD",
      badgeT: 0.52,
      cat: "energi",
      anim: "overload",
      desc: "Ledakan plasma dahsyat berskala AoE yang mementalkan musuh di dekatnya.",
      tip: "Taktik: Efektif membubarkan formasi kerumunan monster kecil yang mengepung karakter."
    },
    {
      id: "combustion",
      e1: "api",
      e2: "nature",
      name: "COMBUSTION",
      label: "COMBUSTION",
      badgeT: 0.72,
      cat: "energi",
      anim: "combustion",
      desc: "Kobaran api hayati membakar hebat dengan DoT tinggi yang bisa menyebar ke musuh lain.",
      tip: "Taktik: Tempelkan benih nature lalu sulut dengan api untuk damage bakar berkepanjangan."
    },
    {
      id: "superconduct",
      e1: "es",
      e2: "petir",
      name: "SUPERCONDUCT",
      label: "SUPERCONDUCT",
      badgeT: 0.32,
      cat: "energi",
      anim: "superconduct",
      desc: "Hantaran suhu rendah bertegangan tinggi yang meruntuhkan Armor/Defense musuh sebesar 40%.",
      tip: "Taktik: Sangat krusial digunakan sebelum melancarkan rentetan damage fisik masif."
    },
    {
      id: "catalyze",
      e1: "petir",
      e2: "nature",
      name: "CATALYZE",
      label: "CATALYZE",
      badgeT: 0.50,
      cat: "energi",
      anim: "catalyze",
      desc: "Medan bio-listrik yang memicu sengatan listrik rantai tambahan pada setiap serangan berikutnya.",
      tip: "Taktik: Cocok untuk karakter dengan attack speed tinggi agar memicu proc listrik beruntun."
    },
    {
      id: "frostbite_spore",
      e1: "es",
      e2: "nature",
      name: "FROSTBITE SPORE",
      label: "FROSTBITE",
      badgeT: 0.70,
      cat: "energi",
      anim: "frostbite",
      desc: "Spora es meletus, membekukan musuh di sekitar target selama 1.5 detik.",
      tip: "Taktik: Hentikan laju monster cepat agar posisinya terkunci di arena."
    },

    {
      id: "ignis",
      e1: "nihil",
      e2: "api",
      name: "IGNIS",
      label: "IGNIS",
      badgeT: 0.28,
      cat: "nihil",
      anim: "ignis",
      desc: "Pusaran kobaran api hampa kirmizi (Nihil + Api) yang merambat ganas, mengikis HP musuh berkala (DoT tick tiap 0.35s selama 4 detik berskala EM) dengan pancaran energi kosmis.",
      tip: "Taktik: Kombinasikan elemen Nihil dan Api untuk menimbulkan kerusakan korosi api dahsyat pada monster elit dan bos."
    },
    {
      id: "frost_corrosion",
      e1: "nihil",
      e2: "es",
      name: "FROST CORROSION",
      label: "FROST CORR",
      badgeT: 0.50,
      cat: "nihil",
      anim: "frost_corrosion",
      desc: "Korosi dingin ekstrem yang membekukan musuh seketika selama 1.5 detik dan mengikis movement speed.",
      tip: "Taktik: Kunci musuh berbahaya tanpa memberi jeda serangan balasan."
    },
    {
      id: "plague_corrosion",
      e1: "nihil",
      e2: "nature",
      name: "PLAGUE CORROSION",
      label: "PLAGUE CORR",
      badgeT: 0.50,
      cat: "nihil",
      anim: "plague_corrosion",
      desc: "Korosi asam hayati yang merontokkan 30% armor musuh dan menguras HP secara bertahap.",
      tip: "Taktik: Sangat efektif mengikis musuh dengan darah tebal."
    },
    {
      id: "volt_corrosion",
      e1: "nihil",
      e2: "petir",
      name: "VOLT CORROSION",
      label: "VOLT CORR",
      badgeT: 0.28,
      cat: "nihil",
      anim: "volt_corrosion",
      desc: "Korosi statis yang memancarkan sengatan mini setiap detik, menginterupsi animasi serangan musuh.",
      tip: "Taktik: Gagalkan jurus bos yang memiliki waktu ancang-ancang panjang."
    },

    {
      id: "swirl_api",
      e1: "angin",
      e2: "api",
      name: "FIRE SWIRL",
      label: "FIRE SWIRL",
      badgeT: 0.28,
      cat: "angin",
      anim: "swirl_api",
      desc: "Pusaran badai api menyerap elemen dan menyebarkan aura bakar ke seluruh musuh di sekitar.",
      tip: "Taktik: Menyebarkan status bakar ke seluruh gerombolan musuh hanya dengan satu hembusan."
    },
    {
      id: "swirl_es",
      e1: "angin",
      e2: "es",
      name: "FROST SWIRL",
      label: "FROST SWIRL",
      badgeT: 0.28,
      cat: "angin",
      anim: "swirl_es",
      desc: "Pusaran badai es menyebarkan efek perlambatan gerak dan hawa dingin ke area luas.",
      tip: "Taktik: Melambatkan seluruh pasukan musuh di satu layar sekaligus."
    },
    {
      id: "swirl_petir",
      e1: "angin",
      e2: "petir",
      name: "THUNDER SWIRL",
      label: "VOLT SWIRL",
      badgeT: 0.50,
      cat: "angin",
      anim: "swirl_petir",
      desc: "Pusaran angin petir memicu sambaran listrik berantai ke beberapa monster terdekat.",
      tip: "Taktik: Memperluas jangkauan sengatan listrik Voiz tanpa harus mendekati musuh."
    },
    {
      id: "swirl_nature",
      e1: "angin",
      e2: "nature",
      name: "NATURE SWIRL",
      label: "BIO SWIRL",
      badgeT: 0.50,
      cat: "angin",
      anim: "swirl_nature",
      desc: "Pusaran daun berputar menyebarkan benih flora ke seluruh target di sekitarnya.",
      tip: "Taktik: Mempersiapkan banyak musuh sekaligus untuk kombo reaksi lanjutan."
    },
    {
      id: "swirl_nihil",
      e1: "angin",
      e2: "nihil",
      name: "SWIRL CORROSION",
      label: "SWIRL CORR",
      badgeT: 0.40,
      cat: "angin",
      anim: "swirl_corrosion",
      desc: "Pusaran badai void mengoyak target utama (damage 0.5x + DoT korosi 4.5s) dan menyebarkan status korosi serta damage cipratan ke seluruh musuh sekitar dalam radius 190px.",
      tip: "Taktik: Sebarkan korosi void ke banyak musuh sekaligus hanya dengan serangan elemen angin."
    },
    {
      id: "sandstorm",
      e1: "angin",
      e2: "tanah",
      name: "SANDSTORM",
      label: "SANDSTORM",
      badgeT: 0.50,
      cat: "angin",
      anim: "sandstorm",
      desc: "Badai gurun berputar dahsyat menghasilkan damage ledakan 1.1x berskala EM, efek slow 1.2 detik, dan sapuan badai pasir ke area sekitar seluas radius 210px.",
      tip: "Taktik: Paduan angin dan tanah untuk melumpuhkan laju musuh sekaligus menyapu kerumunan."
    },

    {
      id: "cryst_api",
      e1: "tanah",
      e2: "api",
      name: "FIRE CRYSTALLIZE",
      label: "FIRE CRYST",
      badgeT: 0.26,
      cat: "tanah",
      anim: "crystallize",
      desc: "Menjatuhkan kristal perisai api di lantai; memberikan perisai penyerap damage api.",
      tip: "Taktik: Ambil pecahan kristal agar kebal terhadap serangan bara musuh."
    },
    {
      id: "cryst_es",
      e1: "tanah",
      e2: "es",
      name: "FROST CRYSTALLIZE",
      label: "FROST CRYST",
      badgeT: 0.28,
      cat: "tanah",
      anim: "crystallize",
      desc: "Menjatuhkan kristal perisai es; memberikan perisai penyerap damage es.",
      tip: "Taktik: Menangkal efek beku dari serangan bos berelemen es."
    },
    {
      id: "cryst_petir",
      e1: "tanah",
      e2: "petir",
      name: "VOLT CRYSTALLIZE",
      label: "VOLT CRYST",
      badgeT: 0.28,
      cat: "tanah",
      anim: "crystallize",
      desc: "Menjatuhkan kristal perisai petir; memberikan perisai penyerap damage listrik.",
      tip: "Taktik: Melindungi diri dari sengatan statis di lantai pertarungan."
    },
    {
      id: "cryst_nature",
      e1: "tanah",
      e2: "nature",
      name: "BIO CRYSTALLIZE",
      label: "BIO CRYST",
      badgeT: 0.50,
      cat: "tanah",
      anim: "crystallize",
      desc: "Menjatuhkan kristal perisai alam; memberikan regenerasi shield ringan.",
      tip: "Taktik: Memperpanjang daya tahan hidup karakter saat menghadapi wave panjang."
    },
    {
      id: "erosion",
      e1: "tanah",
      e2: "nihil",
      name: "EROSION",
      label: "EROSION",
      badgeT: 0.50,
      cat: "tanah",
      anim: "crush",
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
  const inspAnimCanvas = document.getElementById("reactionSpritePreview");

  let selectedElementId = "fisik";
  let selectedReactionId = "shatter";
  let activeFilter = "all";
  let currentAnimReaction = "shatter";
  let spriteAnimProgress = 0;
  let lastAnimTime = performance.now();
  const LOBBY_SPRITE_CACHE = {};

  function getElementById(id) {
    return ELEMENTS.find(function(e) { return e.id === id; });
  }

  function getReactionById(id) {
    return REACTIONS.find(function(r) { return r.id === id; });
  }

  function renderCircleNetworkChart() {
    if (!svg) return;
    svg.innerHTML = "";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    REACTIONS.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      grad.setAttribute("id", "cable-grad-" + r.id);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", e1.x.toString());
      grad.setAttribute("y1", e1.y.toString());
      grad.setAttribute("x2", e2.x.toString());
      grad.setAttribute("y2", e2.y.toString());

      const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s1.setAttribute("offset", "0%");
      s1.setAttribute("stop-color", e1.color);

      const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      s2.setAttribute("offset", "100%");
      s2.setAttribute("stop-color", e2.color);

      grad.appendChild(s1);
      grad.appendChild(s2);
      defs.appendChild(grad);
    });

    svg.appendChild(defs);

    const orbitOuter = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    orbitOuter.setAttribute("cx", "440");
    orbitOuter.setAttribute("cy", "440");
    orbitOuter.setAttribute("r", "320");
    orbitOuter.setAttribute("class", "diagram-orbit-outer");
    svg.appendChild(orbitOuter);

    const orbitInner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    orbitInner.setAttribute("cx", "440");
    orbitInner.setAttribute("cy", "440");
    orbitInner.setAttribute("r", "160");
    orbitInner.setAttribute("class", "diagram-orbit-inner");
    svg.appendChild(orbitInner);

    const cablesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    cablesGroup.setAttribute("class", "diagram-cables-group");

    REACTIONS.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const dx = e2.x - e1.x;
      const dy = e2.y - e1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;

      const ux = dx / dist;
      const uy = dy / dist;

      const r1 = e1.id === "fisik" ? 36 : 30;
      const r2 = e2.id === "fisik" ? 36 : 30;

      const sx = e1.x + ux * r1;
      const sy = e1.y + uy * r1;
      const ex = e2.x - ux * r2;
      const ey = e2.y - uy * r2;

      const isConnected = r.e1 === selectedElementId || r.e2 === selectedElementId;
      const isSelected = r.id === selectedReactionId;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "cable-conduit" + (isSelected ? " selected active" : (isConnected ? " active" : " dimmed")));
      g.setAttribute("data-react-id", r.id);
      g.setAttribute("data-e1", r.e1);
      g.setAttribute("data-e2", r.e2);

      const hit = document.createElementNS("http://www.w3.org/2000/svg", "line");
      hit.setAttribute("x1", sx.toFixed(1));
      hit.setAttribute("y1", sy.toFixed(1));
      hit.setAttribute("x2", ex.toFixed(1));
      hit.setAttribute("y2", ey.toFixed(1));
      hit.setAttribute("class", "cable-hit");

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", sx.toFixed(1));
      line.setAttribute("y1", sy.toFixed(1));
      line.setAttribute("x2", ex.toFixed(1));
      line.setAttribute("y2", ey.toFixed(1));
      line.setAttribute("class", "cable-line");
      line.setAttribute("stroke", "url(#cable-grad-" + r.id + ")");

      const core = document.createElementNS("http://www.w3.org/2000/svg", "line");
      core.setAttribute("x1", sx.toFixed(1));
      core.setAttribute("y1", sy.toFixed(1));
      core.setAttribute("x2", ex.toFixed(1));
      core.setAttribute("y2", ey.toFixed(1));
      core.setAttribute("class", "cable-core");

      const t = r.badgeT !== undefined ? r.badgeT : 0.5;
      const badgeX = sx + (ex - sx) * t;
      const badgeY = sy + (ey - sy) * t;

      const labelText = r.label || r.name;
      const badgeW = Math.max(54, labelText.length * 6.4 + 14);

      const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
      badge.setAttribute("class", "cable-badge");
      badge.setAttribute("transform", "translate(" + badgeX.toFixed(1) + "," + badgeY.toFixed(1) + ")");

      const pill = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      pill.setAttribute("x", (-badgeW / 2).toFixed(1));
      pill.setAttribute("y", "-9.5");
      pill.setAttribute("width", badgeW.toFixed(1));
      pill.setAttribute("height", "19");
      pill.setAttribute("class", "cable-badge-pill");
      pill.setAttribute("stroke", e1.color);

      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("class", "cable-badge-text");
      txt.setAttribute("x", "0");
      txt.setAttribute("y", "0.5");
      txt.textContent = labelText;

      badge.appendChild(pill);
      badge.appendChild(txt);

      g.appendChild(hit);
      g.appendChild(line);
      g.appendChild(core);
      g.appendChild(badge);

      g.addEventListener("click", function() {
        selectReaction(r);
      });

      cablesGroup.appendChild(g);
    });

    svg.appendChild(cablesGroup);

    const crestsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    crestsGroup.setAttribute("class", "diagram-crests-group");

    ELEMENTS.forEach(function(el) {
      const isCenter = el.id === "fisik";
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "elem-crest" + (selectedElementId === el.id ? " active" : ""));
      g.setAttribute("data-id", el.id);
      g.setAttribute("transform", "translate(" + el.x.toFixed(1) + "," + el.y.toFixed(1) + ")");

      const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("r", isCenter ? "40" : "36");
      hit.setAttribute("class", "crest-hit");

      const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      halo.setAttribute("class", "crest-halo");
      halo.setAttribute("r", isCenter ? "38" : "33");
      halo.setAttribute("fill", "none");
      halo.setAttribute("stroke", el.color);
      halo.setAttribute("stroke-width", selectedElementId === el.id ? "3.5" : "2");
      halo.setAttribute("stroke-dasharray", isCenter ? "4 4" : "3 3");
      halo.setAttribute("opacity", selectedElementId === el.id ? "1" : "0.55");

      const gem = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      gem.setAttribute("class", "crest-gem");
      gem.setAttribute("r", isCenter ? "30" : "26");
      gem.setAttribute("stroke", el.color);
      gem.setAttribute("stroke-width", selectedElementId === el.id ? "2.6" : "1.8");

      const iconSize = isCenter ? 34 : 30;
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
      icon.setAttribute("href", el.icon);
      icon.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", el.icon);
      icon.setAttribute("x", (-iconSize / 2).toFixed(1));
      icon.setAttribute("y", (-iconSize / 2).toFixed(1));
      icon.setAttribute("width", iconSize.toString());
      icon.setAttribute("height", iconSize.toString());
      icon.setAttribute("pointer-events", "none");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "crest-label");
      label.setAttribute("x", el.labelX.toString());
      label.setAttribute("y", el.labelY.toString());
      label.textContent = el.name.toUpperCase();

      g.appendChild(hit);
      g.appendChild(halo);
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

    const cables = document.querySelectorAll(".cable-conduit");
    cables.forEach(function(cb) {
      const e1 = cb.getAttribute("data-e1");
      const e2 = cb.getAttribute("data-e2");
      if (e1 === id || e2 === id) {
        cb.classList.add("active");
        cb.classList.remove("dimmed");
      } else {
        cb.classList.add("dimmed");
        cb.classList.remove("active", "selected");
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
    if (r.anim && typeof updateSpritePreview === "function") {
      updateSpritePreview(r.anim);
    }

    const e1 = getElementById(r.e1);
    const e2 = getElementById(r.e2);
    if (!e1 || !e2) return;

    if (inspTitle) inspTitle.textContent = r.name;
    if (inspFormula) inspFormula.textContent = e1.name + " + " + e2.name;
    if (inspDesc) inspDesc.textContent = r.desc;
    if (inspTip) inspTip.innerHTML = "<strong>Taktik:</strong> " + r.tip.replace(/^Taktik:s*/, "");

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

    const cables = document.querySelectorAll(".cable-conduit");
    cables.forEach(function(cb) {
      if (cb.getAttribute("data-react-id") === r.id) {
        cb.classList.add("selected", "active");
        cb.classList.remove("dimmed");
      } else {
        cb.classList.remove("selected");
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

  function bakeReactionSpriteFrames(jenis, canvasW, canvasH) {
    const W = canvasW || 96;
    const H = canvasH || 96;
    const cx = W / 2;
    const cy = H / 2;
    const kJenis = String(jenis || "vortex").toLowerCase();
    let totalFrames = 10;
    const frames = [];

    for (let f = 0; f < totalFrames; f++) {
      const cs = document.createElement("canvas");
      cs.width = W;
      cs.height = H;
      const g = cs.getContext("2d");
      const t = f / (totalFrames - 1);

      if (kJenis === "shatters" || kJenis === "shatter") {
        const alpha = Math.max(0, 1 - Math.pow(t, 1.8));
        const rBloom = 12 + t * 40;
        const bgG = g.createRadialGradient(cx, cy, 2, cx, cy, rBloom);
        bgG.addColorStop(0, "rgba(56, 189, 248, " + (0.65 * (1 - t)) + ")");
        bgG.addColorStop(0.55, "rgba(186, 230, 253, " + (0.35 * (1 - t)) + ")");
        bgG.addColorStop(1, "rgba(2, 132, 199, 0)");
        g.fillStyle = bgG;
        g.beginPath();
        g.arc(cx, cy, rBloom, 0, Math.PI * 2);
        g.fill();

        if (t < 0.35) {
          const rCore = 22 * (1 - t * 0.75);
          g.fillStyle = "rgba(56, 189, 248, " + (0.95 * (1 - t * 1.5)) + ")";
          g.beginPath();
          for (let a = 0; a < 6; a++) {
            const ang = a * Math.PI / 3;
            const px = cx + Math.cos(ang) * rCore;
            const py = cy + Math.sin(ang) * rCore;
            if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.closePath();
          g.fill();
          g.strokeStyle = "rgba(255, 255, 255, " + (1 - t * 1.5) + ")";
          g.lineWidth = 2.4;
          g.stroke();
        }

        const numShards = 8;
        const dShard = 8 + Math.pow(t, 0.7) * 46;
        for (let s = 0; s < numShards; s++) {
          const ang = s * (Math.PI * 2 / numShards) + 0.22;
          const sx = cx + Math.cos(ang) * dShard;
          const sy = cy + Math.sin(ang) * dShard;
          const rot = ang + t * 3.4;
          const sz = Math.max(3, 11 * (1 - t * 0.55));
          g.save();
          g.translate(sx, sy);
          g.rotate(rot);
          g.beginPath();
          g.moveTo(0, -sz * 1.3);
          g.lineTo(sz * 0.6, 0);
          g.lineTo(0, sz * 0.85);
          g.lineTo(-sz * 0.6, 0);
          g.closePath();
          g.fillStyle = "rgba(56, 189, 248, " + alpha + ")";
          g.fill();
          g.beginPath();
          g.moveTo(0, -sz * 1.3);
          g.lineTo(sz * 0.6, 0);
          g.lineTo(0, sz * 0.85);
          g.closePath();
          g.fillStyle = "rgba(224, 242, 254, " + (0.9 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.lineWidth = 1.6;
          g.stroke();
          g.restore();
        }

        g.strokeStyle = "rgba(186, 230, 253, " + (0.85 * (1 - t)) + ")";
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(cx, cy, 10 + t * 48, 0, Math.PI * 2);
        g.stroke();
        g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * (1 - t)) + ")";
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(cx, cy, 6 + t * 34, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "vortex") {
        const rotBase = t * Math.PI * 3.8;
        const alpha = Math.max(0, 1 - Math.pow(t, 2.2));

        const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 40);
        gl.addColorStop(0, "rgba(15, 118, 110, " + (0.65 * alpha) + ")");
        gl.addColorStop(0.35, "rgba(45, 212, 191, " + (0.4 * alpha) + ")");
        gl.addColorStop(0.7, "rgba(13, 148, 136, " + (0.15 * alpha) + ")");
        gl.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gl;
        g.beginPath();
        g.arc(cx, cy, 40, 0, Math.PI * 2);
        g.fill();

        for (let b = 0; b < 4; b++) {
          const aOff = rotBase + b * (Math.PI / 2);
          g.save();
          g.translate(cx, cy);
          g.rotate(aOff);
          g.beginPath();
          const rIn = 5 + (1 - t) * 7;
          const rOut = 14 + Math.sin(t * Math.PI) * 28;
          g.arc(0, 0, rOut, 0, Math.PI * 0.55, false);
          g.arc(0, 0, rIn, Math.PI * 0.55, 0, true);
          g.closePath();
          g.fillStyle = "rgba(45, 212, 191, " + (0.85 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(204, 251, 241, " + (0.95 * alpha) + ")";
          g.lineWidth = 2.0;
          g.stroke();
          g.restore();
        }

        g.strokeStyle = "rgba(167, 243, 208, " + (0.85 * alpha) + ")";
        g.lineWidth = 1.6;
        for (let sl = 0; sl < 6; sl++) {
          const aSl = rotBase * 1.6 + sl * 1.05;
          const rSl = 8 + sl * 5.5;
          g.beginPath();
          g.arc(cx, cy, rSl, aSl, aSl + 0.65);
          g.stroke();
        }

        const eyeR = Math.max(2.5, 7.5 * (1 - t));
        g.fillStyle = "rgba(4, 47, 46, " + (0.95 * alpha) + ")";
        g.beginPath();
        g.arc(cx, cy, eyeR, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
        g.lineWidth = 1.8;
        g.stroke();

      } else if (kJenis === "swirl_nature") {
        const rotBase = t * Math.PI * 3.4;
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));

        const bgG = g.createRadialGradient(cx, cy, 2, cx, cy, 38);
        bgG.addColorStop(0, "rgba(34, 197, 94, " + (0.55 * alpha) + ")");
        bgG.addColorStop(0.5, "rgba(163, 230, 53, " + (0.25 * alpha) + ")");
        bgG.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = bgG;
        g.beginPath();
        g.arc(cx, cy, 38, 0, Math.PI * 2);
        g.fill();

        for (let c = 0; c < 4; c++) {
          const aC = rotBase + c * (Math.PI / 2);
          const rC = 10 + Math.sin(t * Math.PI) * 26;
          g.strokeStyle = c % 2 === 0 ? "rgba(34, 197, 94, " + (0.9 * alpha) + ")" : "rgba(74, 222, 128, " + (0.85 * alpha) + ")";
          g.lineWidth = 2.4;
          g.beginPath();
          g.arc(cx, cy, rC, aC, aC + 1.1);
          g.stroke();
        }

        const numLeaves = 6;
        for (let l = 0; l < numLeaves; l++) {
          const aL = rotBase * 1.3 + l * (Math.PI * 2 / numLeaves);
          const dL = 10 + t * 32 + (l % 2) * 5;
          const lx = cx + Math.cos(aL) * dL;
          const ly = cy + Math.sin(aL) * dL;
          const lfSz = Math.max(2.5, 6.5 * (1 - t * 0.45));
          g.save();
          g.translate(lx, ly);
          g.rotate(aL + Math.PI / 2);
          g.beginPath();
          g.moveTo(0, -lfSz * 1.5);
          g.quadraticCurveTo(lfSz * 0.9, 0, 0, lfSz * 1.2);
          g.quadraticCurveTo(-lfSz * 0.9, 0, 0, -lfSz * 1.5);
          g.closePath();
          g.fillStyle = "rgba(22, 163, 74, " + alpha + ")";
          g.fill();
          g.strokeStyle = "rgba(163, 230, 53, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.2;
          g.stroke();
          g.beginPath();
          g.moveTo(0, -lfSz * 1.2);
          g.lineTo(0, lfSz * 0.9);
          g.stroke();
          g.restore();
        }

        for (let pl = 0; pl < 8; pl++) {
          const aPl = rotBase * 2.0 + pl * 0.8;
          const dPl = 6 + pl * 4.2;
          const px = cx + Math.cos(aPl) * dPl;
          const py = cy + Math.sin(aPl) * dPl - t * 6;
          const pR = Math.max(1.2, 3.2 * (1 - t * 0.6));
          g.fillStyle = "rgba(217, 249, 157, " + alpha + ")";
          g.beginPath();
          g.arc(px, py, pR, 0, Math.PI * 2);
          g.fill();
        }

      } else if (kJenis === "swirl_petir") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 4.8;

        const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 40);
        gl.addColorStop(0, "rgba(255, 255, 255, " + (0.8 * alpha) + ")");
        gl.addColorStop(0.3, "rgba(250, 204, 21, " + (0.5 * alpha) + ")");
        gl.addColorStop(0.7, "rgba(202, 138, 4, " + (0.2 * alpha) + ")");
        gl.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gl;
        g.beginPath();
        g.arc(cx, cy, 40, 0, Math.PI * 2);
        g.fill();

        for (let b = 0; b < 3; b++) {
          const aOff = rot + b * (Math.PI * 2 / 3);
          g.save();
          g.translate(cx, cy);
          g.rotate(aOff);
          g.beginPath();
          const rOut = 14 + Math.sin(t * Math.PI) * 26;
          g.arc(0, 0, rOut, 0, Math.PI * 0.65, false);
          g.arc(0, 0, 5, Math.PI * 0.65, 0, true);
          g.closePath();
          g.fillStyle = "rgba(234, 179, 8, " + (0.85 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
          g.lineWidth = 2.0;
          g.stroke();
          g.restore();
        }

        const numBolts = 5;
        for (let z = 0; z < numBolts; z++) {
          const aZ = rot * 0.8 + z * (Math.PI * 2 / numBolts);
          const lenZ = 12 + t * 36;
          const p1x = cx + Math.cos(aZ - 0.25) * (lenZ * 0.35);
          const p1y = cy + Math.sin(aZ - 0.25) * (lenZ * 0.35);
          const p2x = cx + Math.cos(aZ + 0.25) * (lenZ * 0.7);
          const p2y = cy + Math.sin(aZ + 0.25) * (lenZ * 0.7);
          const ex = cx + Math.cos(aZ) * lenZ;
          const ey = cy + Math.sin(aZ) * lenZ;
          g.strokeStyle = "rgba(250, 204, 21, " + alpha + ")";
          g.lineWidth = 2.6;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(p1x, p1y);
          g.lineTo(p2x, p2y);
          g.lineTo(ex, ey);
          g.stroke();
          g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.3;
          g.stroke();
        }

        for (let sp = 0; sp < 6; sp++) {
          const aSp = rot * 1.8 + sp * 1.1;
          const dSp = 8 + t * 34;
          const sx = cx + Math.cos(aSp) * dSp;
          const sy = cy + Math.sin(aSp) * dSp;
          g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.fillRect(sx - 1.5, sy - 1.5, 3, 3);
        }

      } else if (kJenis === "swirl_api") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 4.2;

        const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 38);
        gl.addColorStop(0, "rgba(255, 255, 255, " + (0.85 * alpha) + ")");
        gl.addColorStop(0.25, "rgba(253, 224, 71, " + (0.6 * alpha) + ")");
        gl.addColorStop(0.65, "rgba(239, 68, 68, " + (0.25 * alpha) + ")");
        gl.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gl;
        g.beginPath();
        g.arc(cx, cy, 38, 0, Math.PI * 2);
        g.fill();

        for (let b = 0; b < 4; b++) {
          const aOff = rot + b * (Math.PI / 2);
          g.save();
          g.translate(cx, cy);
          g.rotate(aOff);
          g.beginPath();
          const rIn = 5 + (1 - t) * 6;
          const rOut = 14 + Math.sin(t * Math.PI) * 26;
          g.arc(0, 0, rOut, 0, Math.PI * 0.7, false);
          g.arc(0, 0, rIn, Math.PI * 0.7, 0, true);
          g.closePath();
          g.fillStyle = b % 2 === 0 ? "rgba(249, 115, 22, " + (0.9 * alpha) + ")" : "rgba(239, 68, 68, " + (0.85 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
          g.lineWidth = 2.0;
          g.stroke();
          g.restore();
        }

        for (let em = 0; em < 8; em++) {
          const aEm = rot * 1.5 + em * 0.8;
          const dEm = 10 + t * 36;
          const ex = cx + Math.cos(aEm) * dEm;
          const ey = cy + Math.sin(aEm) * dEm - t * 12;
          const eR = Math.max(1.2, 3.2 * (1 - t * 0.6));
          g.fillStyle = "rgba(254, 240, 138, " + alpha + ")";
          g.beginPath();
          g.arc(ex, ey, eR, 0, Math.PI * 2);
          g.fill();
        }

      } else if (kJenis === "swirl_es") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = -t * Math.PI * 4.2;

        const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 38);
        gl.addColorStop(0, "rgba(224, 242, 254, " + (0.8 * alpha) + ")");
        gl.addColorStop(0.4, "rgba(56, 189, 248, " + (0.45 * alpha) + ")");
        gl.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gl;
        g.beginPath();
        g.arc(cx, cy, 38, 0, Math.PI * 2);
        g.fill();

        for (let b = 0; b < 3; b++) {
          const aOff = rot + b * (Math.PI * 2 / 3);
          g.save();
          g.translate(cx, cy);
          g.rotate(aOff);
          g.beginPath();
          const rOut = 14 + Math.sin(t * Math.PI) * 26;
          g.arc(0, 0, rOut, 0, Math.PI * 0.6, false);
          g.arc(0, 0, 5, Math.PI * 0.6, 0, true);
          g.closePath();
          g.fillStyle = "rgba(56, 189, 248, " + (0.85 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(224, 242, 254, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.8;
          g.stroke();
          g.restore();
        }

        for (let ic = 0; ic < 6; ic++) {
          const aIc = rot * 1.2 + ic * (Math.PI * 2 / 6);
          const dIc = 10 + t * 34;
          const ix = cx + Math.cos(aIc) * dIc;
          const iy = cy + Math.sin(aIc) * dIc;
          const iSz = Math.max(2.5, 6.0 * (1 - t * 0.5));
          g.save();
          g.translate(ix, iy);
          g.rotate(aIc * 1.5);
          g.beginPath();
          g.moveTo(0, -iSz * 1.4);
          g.lineTo(iSz * 0.7, 0);
          g.lineTo(0, iSz * 1.0);
          g.lineTo(-iSz * 0.7, 0);
          g.closePath();
          g.fillStyle = "rgba(186, 230, 253, " + (0.9 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.lineWidth = 1.2;
          g.stroke();
          g.restore();
        }

      } else if (kJenis === "bleeding") {
        const alpha = Math.max(0, 1 - Math.pow(t, 1.8));

        if (t < 0.45) {
          const slashP = t / 0.45;
          const slashL = 40 * (0.4 + slashP * 0.6);
          g.save();
          g.translate(cx, cy);
          g.strokeStyle = "rgba(239, 68, 68, " + (1 - slashP * 0.4) + ")";
          g.lineWidth = 5.0;
          g.lineCap = "round";
          g.beginPath();
          g.moveTo(-slashL * 0.72, -slashL * 0.62);
          g.lineTo(slashL * 0.72, slashL * 0.62);
          g.stroke();

          g.beginPath();
          g.moveTo(-slashL * 0.65, slashL * 0.62);
          g.lineTo(slashL * 0.65, -slashL * 0.62);
          g.stroke();

          g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * (1 - slashP)) + ")";
          g.lineWidth = 2.0;
          g.beginPath();
          g.moveTo(-slashL * 0.68, -slashL * 0.58);
          g.lineTo(slashL * 0.68, slashL * 0.58);
          g.moveTo(-slashL * 0.6, slashL * 0.58);
          g.lineTo(slashL * 0.6, -slashL * 0.58);
          g.stroke();
          g.restore();
        }

        const numDrops = 12;
        for (let d = 0; d < numDrops; d++) {
          const ang = d * (Math.PI * 2 / numDrops) + (d % 2 === 0 ? 0.25 : -0.25);
          const distD = 8 + Math.pow(t, 0.7) * 44;
          const grav = Math.pow(t, 2) * 18;
          const dx = cx + Math.cos(ang) * distD;
          const dy = cy + Math.sin(ang) * distD * 0.85 + grav;
          const dropR = Math.max(1.8, 5.0 * (1 - t * 0.55));
          g.fillStyle = "rgba(185, 28, 28, " + alpha + ")";
          g.beginPath();
          g.arc(dx, dy, dropR, 0, Math.PI * 2);
          g.fill();

          const tailX = dx - Math.cos(ang) * dropR * 2.4;
          const tailY = dy - (Math.sin(ang) * dropR * 2.4 + grav * 0.4);
          g.beginPath();
          g.moveTo(dx + Math.sin(ang) * dropR, dy - Math.cos(ang) * dropR);
          g.lineTo(tailX, tailY);
          g.lineTo(dx - Math.sin(ang) * dropR, dy + Math.cos(ang) * dropR);
          g.closePath();
          g.fill();

          g.fillStyle = "rgba(254, 202, 202, " + (alpha * 0.85) + ")";
          g.beginPath();
          g.arc(dx - dropR * 0.3, dy - dropR * 0.3, dropR * 0.35, 0, Math.PI * 2);
          g.fill();
        }

        g.strokeStyle = "rgba(220, 38, 38, " + (0.75 * (1 - t)) + ")";
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(cx, cy, 8 + t * 44, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "void_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.2));
        const coreR = Math.max(3.5, 16 * Math.sin(t * Math.PI));

        const gCore = g.createRadialGradient(cx, cy, 1, cx, cy, coreR + 10);
        gCore.addColorStop(0, "rgba(5, 2, 12, " + alpha + ")");
        gCore.addColorStop(0.45, "rgba(88, 28, 135, " + (0.95 * alpha) + ")");
        gCore.addColorStop(0.8, "rgba(168, 85, 247, " + (0.35 * alpha) + ")");
        gCore.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gCore;
        g.beginPath();
        g.arc(cx, cy, coreR + 10, 0, Math.PI * 2);
        g.fill();

        g.strokeStyle = "rgba(216, 180, 254, " + (0.9 * alpha) + ")";
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(cx, cy, coreR, 0, Math.PI * 2);
        g.stroke();

        const numTendrils = 6;
        for (let tn = 0; tn < numTendrils; tn++) {
          const angT = tn * (Math.PI * 2 / numTendrils) + t * 2.5;
          const wave = Math.sin(t * 8 + tn * 2) * 8;
          const len = coreR + 10 + Math.sin(t * Math.PI) * 22;
          const mx = cx + Math.cos(angT + 0.35) * (len * 0.5) + wave;
          const my = cy + Math.sin(angT + 0.35) * (len * 0.5) - wave;
          const ex = cx + Math.cos(angT) * len;
          const ey = cy + Math.sin(angT) * len;
          g.strokeStyle = "rgba(168, 85, 247, " + (0.9 * alpha) + ")";
          g.lineWidth = Math.max(1.2, 3.0 * (1 - t * 0.65));
          g.beginPath();
          g.moveTo(cx + Math.cos(angT) * coreR, cy + Math.sin(angT) * coreR);
          g.quadraticCurveTo(mx, my, ex, ey);
          g.stroke();
        }

        for (let bb = 0; bb < 6; bb++) {
          const angB = bb * 1.25 + t * 4;
          const distB = coreR + 6 + (bb * 4) * t;
          const bx = cx + Math.cos(angB) * distB;
          const by = cy + Math.sin(angB) * distB;
          const bR = Math.max(1, 3.8 * Math.sin((t + bb * 0.16) * Math.PI));
          g.fillStyle = "rgba(216, 180, 254, " + (0.95 * alpha) + ")";
          g.beginPath();
          g.arc(bx, by, bR, 0, Math.PI * 2);
          g.fill();
        }

      } else if (kJenis === "combustion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rBoom = 10 + Math.sin(Math.min(1, t * 1.5) * Math.PI * 0.5) * 36;

        const numPetals = 8;
        const rotC = t * 1.6;
        for (let p = 0; p < numPetals; p++) {
          const angP = rotC + p * (Math.PI * 2 / numPetals);
          const distP = rBoom * 0.48;
          const px = cx + Math.cos(angP) * distP;
          const py = cy + Math.sin(angP) * distP - t * 8;
          const petR = rBoom * 0.55;
          g.fillStyle = "rgba(220, 38, 38, " + (0.8 * alpha) + ")";
          g.beginPath();
          g.arc(px, py, petR, 0, Math.PI * 2);
          g.fill();

          g.fillStyle = "rgba(249, 115, 22, " + (0.9 * alpha) + ")";
          g.beginPath();
          g.arc(px, py, petR * 0.68, 0, Math.PI * 2);
          g.fill();
        }

        if (t < 0.45) {
          const coreR = Math.max(2, (1 - t * 2.2) * 18);
          g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.beginPath();
          g.arc(cx, cy - t * 4, coreR * 0.7, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(254, 240, 138, " + alpha + ")";
          g.beginPath();
          g.arc(cx, cy - t * 4, coreR, 0, Math.PI * 2);
          g.fill();
        }

        for (let sp = 0; sp < 10; sp++) {
          const aSp = sp * (Math.PI * 2 / 10) + 0.35;
          const dSp = 10 + t * 44;
          const sx = cx + Math.cos(aSp) * dSp;
          const sy = cy + Math.sin(aSp) * dSp - t * 10;
          const sR = Math.max(1.2, 3.2 * (1 - t));
          g.fillStyle = "rgba(254, 240, 138, " + alpha + ")";
          g.fillRect(sx - sR, sy - sR, sR * 2, sR * 2);
        }

        g.strokeStyle = "rgba(255, 87, 34, " + (0.8 * (1 - t)) + ")";
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(cx, cy, 10 + t * 44, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "frostbite") {
        const alpha = Math.max(0, 1 - Math.pow(t, 1.8));
        const numSpikes = 8;
        const lenSpike = 12 + Math.sin(t * Math.PI * 0.8) * 36;

        for (let sk = 0; sk < numSpikes; sk++) {
          const angSk = sk * (Math.PI * 2 / numSpikes);
          const wBase = Math.max(2.5, 7.0 * (1 - t * 0.6));
          g.save();
          g.translate(cx, cy);
          g.rotate(angSk);
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(wBase, lenSpike * 0.35);
          g.lineTo(0, lenSpike);
          g.lineTo(-wBase, lenSpike * 0.35);
          g.closePath();
          g.fillStyle = "rgba(56, 189, 248, " + (0.85 * alpha) + ")";
          g.fill();

          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(0, lenSpike);
          g.lineTo(wBase, lenSpike * 0.35);
          g.closePath();
          g.fillStyle = "rgba(224, 242, 254, " + (0.95 * alpha) + ")";
          g.fill();

          g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.4;
          g.stroke();
          g.restore();
        }

        g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        g.beginPath();
        g.arc(cx, cy, Math.max(2.5, 7 * (1 - t)), 0, Math.PI * 2);
        g.fill();

        g.strokeStyle = "rgba(125, 211, 252, " + (0.85 * alpha) + ")";
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(cx, cy, 6 + t * 34, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "melt") {
        const alpha = Math.max(0, 1 - Math.pow(t, 1.8));

        if (t < 0.4) {
          const blastR = 14 + t * 32;
          g.strokeStyle = "rgba(56, 189, 248, " + (0.95 * (1 - t * 2.5)) + ")";
          g.lineWidth = 3.5;
          g.beginPath();
          g.arc(cx - 6, cy, blastR, Math.PI * 0.5, Math.PI * 1.5);
          g.stroke();

          g.strokeStyle = "rgba(244, 63, 94, " + (0.95 * (1 - t * 2.5)) + ")";
          g.lineWidth = 3.5;
          g.beginPath();
          g.arc(cx + 6, cy, blastR, -Math.PI * 0.5, Math.PI * 0.5);
          g.stroke();
        }

        const plumeY = cy - t * 24;
        const numClouds = 7;
        for (let c = 0; c < numClouds; c++) {
          const angC = c * (Math.PI * 2 / numClouds) + t * 1.8;
          const distC = 8 + t * 28;
          const px = cx + Math.cos(angC) * distC;
          const py = plumeY + Math.sin(angC) * (distC * 0.6);
          const cR = 8 + Math.sin(t * Math.PI) * 14;
          g.fillStyle = c % 2 === 0 ? "rgba(254, 205, 211, " + (0.6 * alpha) + ")" : "rgba(224, 242, 254, " + (0.6 * alpha) + ")";
          g.beginPath();
          g.arc(px, py, cR, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(255, 255, 255, " + (0.75 * alpha) + ")";
          g.beginPath();
          g.arc(px - cR * 0.25, py - cR * 0.25, cR * 0.65, 0, Math.PI * 2);
          g.fill();
        }

        for (let ms = 0; ms < 8; ms++) {
          const aM = ms * 0.85 + t * 2.2;
          const dM = 8 + t * 38;
          const mx = cx + Math.cos(aM) * dM;
          const my = cy + Math.sin(aM) * dM - t * 16;
          g.fillStyle = ms % 2 === 0 ? "rgba(255, 255, 255, " + (0.9 * alpha) + ")" : "rgba(251, 113, 133, " + (0.9 * alpha) + ")";
          g.fillRect(mx - 1.5, my - 1.5, 3, 3);
        }

      } else if (kJenis === "swirl_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 4.2;

        g.save();
        g.translate(cx, cy);
        g.rotate(rot);

        g.beginPath();
        g.arc(0, 0, 14 + Math.sin(t * Math.PI) * 28, 0, Math.PI * 0.7, false);
        g.arc(0, 0, 5, Math.PI * 0.7, 0, true);
        g.closePath();
        g.fillStyle = "rgba(45, 212, 191, " + (0.85 * alpha) + ")";
        g.fill();
        g.strokeStyle = "rgba(167, 243, 208, " + (0.95 * alpha) + ")";
        g.lineWidth = 2.0;
        g.stroke();

        g.beginPath();
        g.arc(0, 0, 14 + Math.sin(t * Math.PI) * 28, Math.PI, Math.PI * 1.7, false);
        g.arc(0, 0, 5, Math.PI * 1.7, Math.PI, true);
        g.closePath();
        g.fillStyle = "rgba(192, 132, 252, " + (0.85 * alpha) + ")";
        g.fill();
        g.strokeStyle = "rgba(233, 213, 255, " + (0.95 * alpha) + ")";
        g.lineWidth = 2.0;
        g.stroke();

        g.restore();

        for (let dr = 0; dr < 6; dr++) {
          const aDr = rot + dr * (Math.PI / 3) + Math.PI;
          const dDr = 10 + t * 40;
          const dx = cx + Math.cos(aDr) * dDr;
          const dy = cy + Math.sin(aDr) * dDr;
          const drR = Math.max(1.5, 3.8 * (1 - t * 0.6));
          g.fillStyle = dr % 2 === 0 ? "rgba(168, 85, 247, " + (0.9 * alpha) + ")" : "rgba(45, 212, 191, " + (0.9 * alpha) + ")";
          g.beginPath();
          g.arc(dx, dy, drR, 0, Math.PI * 2);
          g.fill();
        }

        g.strokeStyle = "rgba(45, 212, 191, " + (0.75 * alpha) + ")";
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(cx, cy, 8 + t * 36, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "sandstorm") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 3.8;

        for (let sb = 0; sb < 4; sb++) {
          const aSb = rot + sb * (Math.PI / 2);
          const rSb = 8 + sb * 8 + Math.sin(t * Math.PI) * 12;
          g.strokeStyle = sb % 2 === 0 ? "rgba(245, 158, 11, " + (0.9 * alpha) + ")" : "rgba(217, 119, 6, " + (0.8 * alpha) + ")";
          g.lineWidth = 2.6;
          g.beginPath();
          g.arc(cx, cy, rSb, aSb, aSb + 1.25);
          g.stroke();
        }

        const numRocks = 6;
        for (let rk = 0; rk < numRocks; rk++) {
          const aRk = rot * 1.4 + rk * (Math.PI * 2 / numRocks);
          const dRk = 12 + rk * 4.8;
          const rx = cx + Math.cos(aRk) * dRk;
          const ry = cy + Math.sin(aRk) * dRk * 0.78;
          const rSz = Math.max(2.5, 5.2 * (1 - t * 0.5));
          g.save();
          g.translate(rx, ry);
          g.rotate(aRk * 2.2);
          g.fillStyle = "rgba(120, 53, 15, " + alpha + ")";
          g.fillRect(-rSz, -rSz, rSz * 2, rSz * 2);
          g.fillStyle = "rgba(245, 158, 11, " + (alpha * 0.9) + ")";
          g.fillRect(-rSz * 0.5, -rSz * 0.5, rSz, rSz);
          g.strokeStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.0;
          g.strokeRect(-rSz, -rSz, rSz * 2, rSz * 2);
          g.restore();
        }

        for (let gd = 0; gd < 12; gd++) {
          const aGd = rot * 2 + gd * 0.65;
          const dGd = 6 + gd * 3.4;
          const gx = cx + Math.cos(aGd) * dGd;
          const gy = cy + Math.sin(aGd) * dGd;
          g.fillStyle = "rgba(251, 191, 36, " + (0.9 * alpha) + ")";
          g.fillRect(gx - 1.2, gy - 1.2, 2.4, 2.4);
        }

      } else if (kJenis === "plague_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const bubbleR = Math.max(4, 20 * Math.sin(t * Math.PI));
        const gVenom = g.createRadialGradient(cx, cy, 1, cx, cy, bubbleR + 8);
        gVenom.addColorStop(0, "rgba(168, 85, 247, " + alpha + ")");
        gVenom.addColorStop(0.55, "rgba(34, 197, 94, " + (0.9 * alpha) + ")");
        gVenom.addColorStop(1, "rgba(22, 101, 52, 0)");
        g.fillStyle = gVenom;
        g.beginPath();
        g.arc(cx, cy, bubbleR + 8, 0, Math.PI * 2);
        g.fill();

        for (let sp = 0; sp < 8; sp++) {
          const aSp = sp * (Math.PI * 2 / 8) + t * 2.8;
          const dSp = bubbleR * 0.5 + t * 32;
          const sx = cx + Math.cos(aSp) * dSp;
          const sy = cy + Math.sin(aSp) * dSp - t * 14;
          const sR = Math.max(1.8, 5.0 * Math.sin((t + sp * 0.14) * Math.PI));
          g.fillStyle = sp % 2 === 0 ? "rgba(34, 197, 94, " + (0.95 * alpha) + ")" : "rgba(192, 132, 252, " + (0.95 * alpha) + ")";
          g.beginPath();
          g.arc(sx, sy, sR, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(255, 255, 255, " + (0.85 * alpha) + ")";
          g.beginPath();
          g.arc(sx - sR * 0.3, sy - sR * 0.3, sR * 0.35, 0, Math.PI * 2);
          g.fill();
        }

      } else if (kJenis === "overload") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rBlast = 12 + Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) * 36;

        if (t < 0.4) {
          const flashR = Math.max(2, (1 - t / 0.4) * 22);
          g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.beginPath();
          g.arc(cx, cy, flashR, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
          g.beginPath();
          g.arc(cx, cy, flashR * 1.5, 0, Math.PI * 2);
          g.fill();
        }

        const numBolts = 8;
        for (let b = 0; b < numBolts; b++) {
          const aB = b * (Math.PI * 2 / numBolts) + 0.2;
          const lenB = rBlast * (0.75 + (b % 2) * 0.4);
          const mx = cx + Math.cos(aB - 0.22) * (lenB * 0.5);
          const my = cy + Math.sin(aB - 0.22) * (lenB * 0.5);
          const ex = cx + Math.cos(aB) * lenB;
          const ey = cy + Math.sin(aB) * lenB;
          g.strokeStyle = b % 2 === 0 ? "rgba(250, 204, 21, " + alpha + ")" : "rgba(255, 87, 34, " + alpha + ")";
          g.lineWidth = Math.max(1.2, 2.8 * (1 - t * 0.65));
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(mx, my);
          g.lineTo(ex, ey);
          g.stroke();
        }

        g.strokeStyle = "rgba(255, 87, 34, " + (0.9 * alpha) + ")";
        g.lineWidth = 2.8;
        g.beginPath();
        g.arc(cx, cy, rBlast, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "superconduct") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const ringR = 10 + Math.sin(t * Math.PI * 0.7) * 36;

        g.strokeStyle = "rgba(56, 189, 248, " + (0.85 * alpha) + ")";
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(cx, cy, ringR, 0, Math.PI * 2);
        g.stroke();

        const numNodes = 6;
        const pts = [];
        for (let n = 0; n < numNodes; n++) {
          const aN = n * (Math.PI * 2 / numNodes) + t * 0.6;
          const dN = ringR * 0.88;
          const nx = cx + Math.cos(aN) * dN;
          const ny = cy + Math.sin(aN) * dN;
          pts.push({ x: nx, y: ny });

          g.fillStyle = "rgba(186, 230, 253, " + alpha + ")";
          g.beginPath();
          g.arc(nx, ny, Math.max(1.8, 4.0 * (1 - t * 0.5)), 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.lineWidth = 1.2;
          g.stroke();
        }

        g.strokeStyle = "rgba(192, 132, 252, " + (0.95 * alpha) + ")";
        g.lineWidth = 1.8;
        g.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 2) % pts.length];
          const midX = (p1.x + p2.x) / 2 + Math.sin(t * 10 + i) * 5;
          const midY = (p1.y + p2.y) / 2 + Math.cos(t * 10 + i) * 5;
          g.moveTo(p1.x, p1.y);
          g.lineTo(midX, midY);
          g.lineTo(p2.x, p2.y);
        }
        g.stroke();

      } else if (kJenis === "catalyze") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rBloom = 10 + Math.sin(t * Math.PI) * 28;

        for (let v = 0; v < 4; v++) {
          const aV = v * (Math.PI / 2) + t * 1.8;
          const mx = cx + Math.cos(aV + 0.35) * (rBloom * 0.6);
          const my = cy + Math.sin(aV + 0.35) * (rBloom * 0.6);
          const ex = cx + Math.cos(aV) * rBloom;
          const ey = cy + Math.sin(aV) * rBloom;
          g.strokeStyle = "rgba(16, 185, 129, " + (0.95 * alpha) + ")";
          g.lineWidth = 2.6;
          g.beginPath();
          g.moveTo(cx, cy);
          g.quadraticCurveTo(mx, my, ex, ey);
          g.stroke();

          g.fillStyle = "rgba(163, 230, 53, " + alpha + ")";
          g.beginPath();
          g.arc(ex, ey, Math.max(1.8, 4.5 * (1 - t * 0.5)), 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.lineWidth = 1.2;
          g.stroke();
        }

        const numSparks = 8;
        for (let s = 0; s < numSparks; s++) {
          const aS = s * (Math.PI * 2 / numSparks) + 0.45;
          const dS = 8 + t * 40;
          const sx = cx + Math.cos(aS) * dS;
          const sy = cy + Math.sin(aS) * dS;
          g.fillStyle = "rgba(250, 204, 21, " + alpha + ")";
          g.fillRect(sx - 1.5, sy - 1.5, 3, 3);
        }

      } else if (kJenis === "crush") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rDust = 10 + t * 46;

        g.strokeStyle = "rgba(217, 119, 6, " + (0.85 * alpha) + ")";
        g.lineWidth = 3.5;
        g.beginPath();
        g.arc(cx, cy, rDust, 0, Math.PI * 2);
        g.stroke();

        const numChunks = 6;
        for (let k = 0; k < numChunks; k++) {
          const ang = k * (Math.PI * 2 / numChunks) + 0.3;
          const distK = 8 + Math.pow(t, 0.65) * 44;
          const kx = cx + Math.cos(ang) * distK;
          const ky = cy + Math.sin(ang) * distK;
          const sz = Math.max(3, 9 * (1 - t * 0.5));
          g.save();
          g.translate(kx, ky);
          g.rotate(ang + t * 4.2);
          g.fillStyle = "rgba(120, 53, 15, " + alpha + ")";
          g.beginPath();
          g.moveTo(0, -sz * 1.1);
          g.lineTo(sz, -sz * 0.2);
          g.lineTo(sz * 0.75, sz);
          g.lineTo(-sz * 0.65, sz * 0.85);
          g.closePath();
          g.fill();
          g.fillStyle = "rgba(245, 158, 11, " + (0.9 * alpha) + ")";
          g.beginPath();
          g.moveTo(0, -sz * 1.1);
          g.lineTo(sz, -sz * 0.2);
          g.lineTo(0, sz * 0.4);
          g.closePath();
          g.fill();
          g.strokeStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.6;
          g.stroke();
          g.restore();
        }

        for (let db = 0; db < 8; db++) {
          const aDb = db * (Math.PI * 2 / 8) + 0.5;
          const dDb = 10 + t * 48;
          const grav = Math.pow(t, 2) * 14;
          const dbx = cx + Math.cos(aDb) * dDb;
          const dby = cy + Math.sin(aDb) * dDb + grav;
          const dbSz = Math.max(1.5, 3.5 * (1 - t * 0.6));
          g.fillStyle = "rgba(245, 158, 11, " + alpha + ")";
          g.fillRect(dbx - dbSz, dby - dbSz, dbSz * 2, dbSz * 2);
        }

      } else if (kJenis === "ignis" || kJenis === "flame_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 3.5;
        const rBloom = 12 + t * 44;
        const gBloom = g.createRadialGradient(cx, cy, 2, cx, cy, rBloom);
        gBloom.addColorStop(0, "rgba(244, 63, 94, " + (0.6 * alpha) + ")");
        gBloom.addColorStop(0.5, "rgba(147, 51, 234, " + (0.35 * alpha) + ")");
        gBloom.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gBloom;
        g.beginPath();
        g.arc(cx, cy, rBloom, 0, Math.PI * 2);
        g.fill();

        for (let f = 0; f < 4; f++) {
          const aF = rot + f * (Math.PI / 2);
          g.save();
          g.translate(cx, cy);
          g.rotate(aF);
          g.beginPath();
          const rIn = 6 + (1 - t) * 6;
          const rOut = 14 + Math.sin(t * Math.PI) * 36;
          g.arc(0, 0, rOut, 0, Math.PI * 0.65, false);
          g.arc(0, 0, rIn, Math.PI * 0.65, 0, true);
          g.closePath();
          g.fillStyle = f % 2 === 0 ? "rgba(244, 63, 94, " + (0.9 * alpha) + ")" : "rgba(168, 85, 247, " + (0.85 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(254, 205, 211, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.8;
          g.stroke();
          g.restore();
        }

        const rCore = Math.max(3, 16 * Math.sin(t * Math.PI * 0.85));
        g.fillStyle = "rgba(30, 10, 40, " + alpha + ")";
        g.beginPath();
        g.arc(cx, cy, rCore, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(251, 113, 133, " + (0.95 * alpha) + ")";
        g.lineWidth = 2.4;
        g.stroke();

        for (let sp = 0; sp < 6; sp++) {
          const aSp = rot * 1.5 + sp * (Math.PI * 2 / 6);
          const dSp = rCore + 4 + t * 38;
          const sx = cx + Math.cos(aSp) * dSp;
          const sy = cy + Math.sin(aSp) * dSp - t * 10;
          const sR = Math.max(1.5, 4.5 * (1 - t * 0.6));
          g.fillStyle = sp % 2 === 0 ? "rgba(244, 63, 94, " + alpha + ")" : "rgba(192, 132, 252, " + alpha + ")";
          g.beginPath();
          g.arc(sx, sy, sR, 0, Math.PI * 2);
          g.fill();
        }

        g.strokeStyle = "rgba(244, 63, 94, " + (0.75 * (1 - t)) + ")";
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(cx, cy, 10 + t * 48, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "volt_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rDistort = 10 + t * 32;

        g.strokeStyle = "rgba(192, 132, 252, " + (0.85 * alpha) + ")";
        g.lineWidth = 2.0;
        g.beginPath();
        g.arc(cx, cy, rDistort, 0, Math.PI * 2);
        g.stroke();

        for (let z = 0; z < 6; z++) {
          const aZ = z * (Math.PI * 2 / 6) + t * 3.2;
          const lenZ = rDistort * 0.95;
          const zx = cx + Math.cos(aZ) * lenZ;
          const zy = cy + Math.sin(aZ) * lenZ;
          g.strokeStyle = z % 2 === 0 ? "rgba(255, 255, 255, " + alpha + ")" : "rgba(250, 204, 21, " + alpha + ")";
          g.lineWidth = 1.8;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo((cx + zx) / 2 + (z % 2 === 0 ? 6 : -6), (cy + zy) / 2 + (z % 2 === 0 ? -6 : 6));
          g.lineTo(zx, zy);
          g.stroke();

          const blkSz = Math.max(2, 4.5 * (1 - t * 0.5));
          g.fillStyle = z % 2 === 0 ? "rgba(192, 132, 252, " + alpha + ")" : "rgba(254, 240, 138, " + alpha + ")";
          g.fillRect(zx - blkSz / 2, zy - blkSz / 2, blkSz, blkSz);
        }

      } else if (kJenis === "frost_corrosion") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rIce = 12 + Math.sin(t * Math.PI) * 28;

        for (let s = 0; s < 6; s++) {
          const aS = s * (Math.PI / 3);
          g.save();
          g.translate(cx, cy);
          g.rotate(aS);
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(4.5, rIce * 0.4);
          g.lineTo(0, rIce);
          g.lineTo(-4.5, rIce * 0.4);
          g.closePath();
          g.fillStyle = "rgba(88, 28, 135, " + (0.95 * alpha) + ")";
          g.fill();
          g.strokeStyle = "rgba(56, 189, 248, " + (0.95 * alpha) + ")";
          g.lineWidth = 1.6;
          g.stroke();

          g.beginPath();
          g.moveTo(0, rIce * 0.5);
          g.lineTo(6, rIce * 0.7);
          g.moveTo(0, rIce * 0.5);
          g.lineTo(-6, rIce * 0.7);
          g.stroke();
          g.restore();
        }

        g.fillStyle = "rgba(192, 132, 252, " + alpha + ")";
        g.beginPath();
        g.arc(cx, cy, Math.max(2, 6 * (1 - t)), 0, Math.PI * 2);
        g.fill();

      } else if (kJenis === "crystallize") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rHex = 10 + Math.sin(t * Math.PI * 0.8) * 26;
        const rInner = rHex * 0.55;

        g.save();
        g.translate(cx, cy);
        g.rotate(t * 1.5);

        g.beginPath();
        for (let h = 0; h < 6; h++) {
          const aH = h * (Math.PI / 3);
          const hx = Math.cos(aH) * rHex;
          const hy = Math.sin(aH) * rHex;
          if (h === 0) g.moveTo(hx, hy); else g.lineTo(hx, hy);
        }
        g.closePath();
        g.strokeStyle = "rgba(245, 158, 11, " + (0.95 * alpha) + ")";
        g.lineWidth = 2.6;
        g.stroke();
        g.fillStyle = "rgba(251, 191, 36, " + (0.35 * alpha) + ")";
        g.fill();

        g.beginPath();
        for (let h = 0; h < 6; h++) {
          const aH = h * (Math.PI / 3);
          const hx = Math.cos(aH) * rInner;
          const hy = Math.sin(aH) * rInner;
          if (h === 0) g.moveTo(hx, hy); else g.lineTo(hx, hy);
        }
        g.closePath();
        g.strokeStyle = "rgba(254, 240, 138, " + (0.95 * alpha) + ")";
        g.lineWidth = 1.6;
        g.stroke();
        g.fillStyle = "rgba(245, 158, 11, " + (0.5 * alpha) + ")";
        g.fill();

        g.strokeStyle = "rgba(255, 255, 255, " + (0.85 * alpha) + ")";
        g.lineWidth = 1.4;
        g.beginPath();
        for (let h = 0; h < 6; h++) {
          const aH = h * (Math.PI / 3);
          g.moveTo(Math.cos(aH) * rInner, Math.sin(aH) * rInner);
          g.lineTo(Math.cos(aH) * rHex, Math.sin(aH) * rHex);
        }
        g.stroke();

        for (let gIdx = 0; gIdx < 6; gIdx++) {
          const aG = gIdx * (Math.PI / 3);
          const gx = Math.cos(aG) * rHex;
          const gy = Math.sin(aG) * rHex;
          const glintSz = Math.max(1.5, 3.8 * (1 - t * 0.5));
          g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
          g.beginPath();
          g.moveTo(gx, gy - glintSz);
          g.lineTo(gx + glintSz * 0.4, gy);
          g.lineTo(gx, gy + glintSz);
          g.lineTo(gx - glintSz * 0.4, gy);
          g.closePath();
          g.fill();
        }
        g.restore();

        g.strokeStyle = "rgba(245, 158, 11, " + (0.75 * (1 - t)) + ")";
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(cx, cy, 8 + t * 44, 0, Math.PI * 2);
        g.stroke();

      } else if (kJenis === "assault") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const slashL = 22 + Math.sin(Math.min(1, t * 1.4) * Math.PI) * 44;

        g.save();
        g.translate(cx, cy);
        g.strokeStyle = "rgba(255, 87, 34, " + alpha + ")";
        g.lineWidth = 5.5;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(-slashL * 0.72, -slashL * 0.72);
        g.lineTo(slashL * 0.72, slashL * 0.72);
        g.stroke();
        g.beginPath();
        g.moveTo(slashL * 0.72, -slashL * 0.72);
        g.lineTo(-slashL * 0.72, slashL * 0.72);
        g.stroke();

        g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * alpha) + ")";
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(-slashL * 0.65, -slashL * 0.65);
        g.lineTo(slashL * 0.65, slashL * 0.65);
        g.moveTo(slashL * 0.65, -slashL * 0.65);
        g.lineTo(-slashL * 0.65, slashL * 0.65);
        g.stroke();
        g.restore();

        const rBoom = 8 + Math.sin(Math.min(1, t * 1.5) * Math.PI * 0.5) * 36;
        const gBoom = g.createRadialGradient(cx, cy, 2, cx, cy, rBoom);
        gBoom.addColorStop(0, "rgba(255, 255, 255, " + (0.95 * alpha) + ")");
        gBoom.addColorStop(0.35, "rgba(255, 87, 34, " + (0.85 * alpha) + ")");
        gBoom.addColorStop(0.7, "rgba(220, 38, 38, " + (0.45 * alpha) + ")");
        gBoom.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.fillStyle = gBoom;
        g.beginPath();
        g.arc(cx, cy, rBoom, 0, Math.PI * 2);
        g.fill();

        for (let em = 0; em < 8; em++) {
          const aEm = (em % 4) * (Math.PI / 2) + Math.PI / 4 + (Math.floor(em / 4) === 0 ? 0.15 : -0.15);
          const dEm = 12 + t * 44;
          const ex = cx + Math.cos(aEm) * dEm;
          const ey = cy + Math.sin(aEm) * dEm - t * 8;
          const eSz = Math.max(1.5, 3.5 * (1 - t));
          g.fillStyle = "rgba(254, 240, 138, " + alpha + ")";
          g.fillRect(ex - eSz, ey - eSz, eSz * 2, eSz * 2);
        }

      } else if (kJenis === "discharge") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const coreR = Math.max(3, (1 - t) * 16);

        g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        g.beginPath();
        g.arc(cx, cy, coreR, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "rgba(250, 204, 21, " + (0.85 * alpha) + ")";
        g.beginPath();
        g.arc(cx, cy, coreR * 1.5, 0, Math.PI * 2);
        g.fill();

        const numBolts = 8;
        for (let b = 0; b < numBolts; b++) {
          const ang = b * (Math.PI * 2 / numBolts) + 0.2;
          const lenB = 12 + t * 46;
          const p1x = cx + Math.cos(ang - 0.2) * (lenB * 0.35);
          const p1y = cy + Math.sin(ang - 0.2) * (lenB * 0.35);
          const p2x = cx + Math.cos(ang + 0.2) * (lenB * 0.7);
          const p2y = cy + Math.sin(ang + 0.2) * (lenB * 0.7);
          const ex = cx + Math.cos(ang) * lenB;
          const ey = cy + Math.sin(ang) * lenB;

          g.strokeStyle = "rgba(250, 204, 21, " + alpha + ")";
          g.lineWidth = Math.max(1.5, 3.0 * (1 - t * 0.6));
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(p1x, p1y);
          g.lineTo(p2x, p2y);
          g.lineTo(ex, ey);
          g.stroke();

          g.strokeStyle = "rgba(255, 255, 255, " + (0.95 * alpha) + ")";
          g.lineWidth = Math.max(1, 1.6 * (1 - t * 0.6));
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(p1x, p1y);
          g.lineTo(p2x, p2y);
          g.lineTo(ex, ey);
          g.stroke();
        }

        const rRing = 10 + Math.sin(t * Math.PI * 0.8) * 44;
        g.save();
        g.translate(cx, cy);
        g.rotate(t * 2);
        g.strokeStyle = "rgba(250, 204, 21, " + (0.8 * alpha) + ")";
        g.lineWidth = 2.0;
        g.beginPath();
        for (let h = 0; h < 6; h++) {
          const aH = h * (Math.PI / 3);
          const hx = Math.cos(aH) * rRing;
          const hy = Math.sin(aH) * rRing;
          if (h === 0) g.moveTo(hx, hy); else g.lineTo(hx, hy);
        }
        g.closePath();
        g.stroke();
        g.restore();

      } else if (kJenis === "thorn") {
        const alpha = Math.max(0, 1 - Math.pow(t, 2.0));
        const rot = t * Math.PI * 2.2;

        for (let v = 0; v < 4; v++) {
          const aV = rot + v * (Math.PI / 2);
          const rMax = 12 + Math.sin(t * Math.PI) * 42;
          const mx = cx + Math.cos(aV + 0.4) * (rMax * 0.6);
          const my = cy + Math.sin(aV + 0.4) * (rMax * 0.6);
          const ex = cx + Math.cos(aV) * rMax;
          const ey = cy + Math.sin(aV) * rMax;

          g.strokeStyle = "rgba(22, 163, 74, " + (0.95 * alpha) + ")";
          g.lineWidth = 3.2;
          g.beginPath();
          g.moveTo(cx, cy);
          g.quadraticCurveTo(mx, my, ex, ey);
          g.stroke();

          g.strokeStyle = "rgba(134, 239, 172, " + (0.9 * alpha) + ")";
          g.lineWidth = 1.4;
          g.stroke();

          const tx = cx + Math.cos(aV + 0.2) * (rMax * 0.5);
          const ty = cy + Math.sin(aV + 0.2) * (rMax * 0.5);
          const thAng = aV + Math.PI / 2;
          const thLen = 6 * (1 - t * 0.4);
          g.fillStyle = "rgba(34, 197, 94, " + alpha + ")";
          g.beginPath();
          g.moveTo(tx, ty);
          g.lineTo(tx + Math.cos(thAng) * thLen, ty + Math.sin(thAng) * thLen);
          g.lineTo(tx + Math.cos(aV) * (thLen * 0.8), ty + Math.sin(aV) * (thLen * 0.8));
          g.closePath();
          g.fill();
          g.strokeStyle = "rgba(220, 252, 231, " + alpha + ")";
          g.lineWidth = 1.0;
          g.stroke();
        }

        for (let sp = 0; sp < 10; sp++) {
          const aSp = sp * (Math.PI * 2 / 10) + t * 2.0;
          const dSp = 8 + t * 40;
          const sx = cx + Math.cos(aSp) * dSp;
          const sy = cy + Math.sin(aSp) * dSp - t * 8;
          const sR = Math.max(1.5, 3.5 * (1 - t * 0.5));
          g.fillStyle = sp % 2 === 0 ? "rgba(134, 239, 172, " + alpha + ")" : "rgba(255, 255, 255, " + alpha + ")";
          g.beginPath();
          g.arc(sx, sy, sR, 0, Math.PI * 2);
          g.fill();
        }

        g.strokeStyle = "rgba(34, 197, 94, " + (0.75 * (1 - t)) + ")";
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(cx, cy, 8 + t * 46, 0, Math.PI * 2);
        g.stroke();
      }

      frames.push(cs);
    }

    return frames;
  }

  function getReactionSpriteFrames(jenis) {
    let k = String(jenis || "vortex").toLowerCase();
    if (k === "flame_corrosion") k = "ignis";
    if (k === "shatter") k = "shatters";
    if (!LOBBY_SPRITE_CACHE[k]) {
      LOBBY_SPRITE_CACHE[k] = bakeReactionSpriteFrames(k, 128, 128);
    }
    return LOBBY_SPRITE_CACHE[k];
  }

  function updateSpritePreview(jenis) {
    currentAnimReaction = String(jenis || "vortex").toLowerCase();
    spriteAnimProgress = 0;
  }

  function loopSpritePreview(now) {
    requestAnimationFrame(loopSpritePreview);
    if (!inspAnimCanvas) return;
    const ctxPreview = inspAnimCanvas.getContext("2d");
    if (!ctxPreview) return;

    const dt = Math.min(0.1, (now - lastAnimTime) / 1000);
    lastAnimTime = now;

    const frames = getReactionSpriteFrames(currentAnimReaction);
    if (!frames || !frames.length) return;

    spriteAnimProgress = (spriteAnimProgress + dt * 1.5) % 1;
    const idx = Math.min(frames.length - 1, Math.floor(spriteAnimProgress * frames.length));
    const curFrame = frames[idx];

    ctxPreview.clearRect(0, 0, inspAnimCanvas.width, inspAnimCanvas.height);
    ctxPreview.drawImage(curFrame, 0, 0, inspAnimCanvas.width, inspAnimCanvas.height);
  }
  requestAnimationFrame(loopSpritePreview);

  renderCircleNetworkChart();
  renderGrid();
  initFilters();

  if (REACTIONS.length > 0) {
    selectReaction(REACTIONS[0]);
  }
})();
