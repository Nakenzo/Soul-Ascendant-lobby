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
    { id: "nature", name: "Nature", color: "#22c55e", icon: "assets/element-nature.svg", x: 440, y: 120, labelX: 0, labelY: -46 },
    { id: "tanah", name: "Tanah", color: "#d97706", icon: "assets/element-tanah.svg", x: 690, y: 240, labelX: 44, labelY: -22 },
    { id: "nihil", name: "Nihil", color: "#a855f7", icon: "assets/element-nihil.svg", x: 752, y: 511, labelX: 48, labelY: 6 },
    { id: "es", name: "Es", color: "#38bdf8", icon: "assets/element-es.svg", x: 579, y: 728, labelX: 36, labelY: 38 },
    { id: "api", name: "Api", color: "#f97316", icon: "assets/element-api.svg", x: 301, y: 728, labelX: -36, labelY: 38 },
    { id: "petir", name: "Petir", color: "#facc15", icon: "assets/element-petir.svg", x: 128, y: 511, labelX: -48, labelY: 6 },
    { id: "angin", name: "Angin", color: "#34d399", icon: "assets/element-angin.svg", x: 190, y: 240, labelX: -44, labelY: -22 },
    { id: "fisik", name: "Fisik", color: "#cbd5e1", icon: "assets/element-fisik.svg", x: 440, y: 440, labelX: 0, labelY: 48 }
  ];

  const REACTIONS = [
    {
      id: "shatter",
      e1: "fisik",
      e2: "es",
      name: "SHATTER",
      label: "SHATTER x2.5",
      badgeT: 0.52,
      cat: "fisik",
      desc: "Memecahkan kristal es musuh dengan damage kritis instan x2.5 lipat dan menyebarkan serpihan es.",
      tip: "Taktik: Bekukan musuh terlebih dahulu lalu hantam dengan serangan fisik keras."
    },
    {
      id: "spark",
      e1: "fisik",
      e2: "api",
      name: "SPARK",
      label: "SPARK",
      badgeT: 0.52,
      cat: "fisik",
      desc: "Letupan percikan gesekan bara (+25% Crit Damage + Micro Knockback mundur).",
      tip: "Taktik: Beri jarak aman bagi pemain jarak dekat saat menyerang musuh membara."
    },
    {
      id: "discharge",
      e1: "fisik",
      e2: "petir",
      name: "DISCHARGE",
      label: "DISCHARGE",
      badgeT: 0.50,
      cat: "fisik",
      desc: "Pelepasan arus mendadak yang memicu micro-stun 0.4 detik dan membatalkan serangan musuh.",
      tip: "Taktik: Gunakan untuk menghentikan serangan mendadak monster agresif."
    },
    {
      id: "splinter",
      e1: "fisik",
      e2: "nature",
      name: "SPLINTER",
      label: "SPLINTER",
      badgeT: 0.50,
      cat: "fisik",
      desc: "Pecahan duri tajam berhamburan ke segala arah dan menimbulkan pendarahan ringan.",
      tip: "Taktik: Mengubah serangan fisik satu target menjadi kerusakan area mini."
    },
    {
      id: "crush",
      e1: "tanah",
      e2: "fisik",
      name: "CRUSH",
      label: "CRUSH",
      badgeT: 0.50,
      cat: "tanah",
      desc: "Hantaman remuk yang meremukkan ketahanan monster armor tebal dan memberi efek stun singkat.",
      tip: "Taktik: Hancurkan pelindung musuh yang memiliki bar armor keras."
    },
    {
      id: "enchant_corrosion",
      e1: "nihil",
      e2: "fisik",
      name: "ENCHANT CORROSION",
      label: "VOID ENCHANT",
      badgeT: 0.50,
      cat: "nihil",
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
      desc: "Peleburan panas ekstrem yang melipatgandakan damage serangan menjadi 2.0x lipat instan.",
      tip: "Taktik: Dinginkan musuh dengan panah es Kenzro lalu sambut dengan sabit api Vender untuk damage puncak."
    },
    {
      id: "overload",
      e1: "api",
      e2: "petir",
      name: "OVERLOAD",
      label: "OVERLOAD",
      badgeT: 0.50,
      cat: "energi",
      desc: "Ledakan plasma dahsyat berskala AoE yang mementalkan musuh di dekatnya.",
      tip: "Taktik: Efektif membubarkan formasi kerumunan monster kecil yang mengepung karakter."
    },
    {
      id: "combustion",
      e1: "api",
      e2: "nature",
      name: "COMBUSTION",
      label: "COMBUSTION",
      badgeT: 0.32,
      cat: "energi",
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
      desc: "Medan bio-listrik yang memicu sengatan listrik rantai tambahan pada setiap serangan berikutnya.",
      tip: "Taktik: Cocok untuk karakter dengan attack speed tinggi agar memicu proc listrik beruntun."
    },
    {
      id: "frostbite_spore",
      e1: "es",
      e2: "nature",
      name: "FROSTBITE SPORE",
      label: "FROSTBITE",
      badgeT: 0.68,
      cat: "energi",
      desc: "Spora es meletus, membekukan musuh di sekitar target selama 1.5 detik.",
      tip: "Taktik: Hentikan laju monster cepat agar posisinya terkunci di arena."
    },

    {
      id: "flame_corrosion",
      e1: "nihil",
      e2: "api",
      name: "FLAME CORROSION",
      label: "FLAME CORR",
      badgeT: 0.30,
      cat: "nihil",
      desc: "Korosi api hitam yang menggerogoti HP musuh dan menular ke monster lain yang bersentuhan.",
      tip: "Taktik: Api hitam akan terus menyebar selama musuh bergerombol rapat."
    },
    {
      id: "frost_corrosion",
      e1: "nihil",
      e2: "es",
      name: "FROST CORROSION",
      label: "FROST CORR",
      badgeT: 0.50,
      cat: "nihil",
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
      desc: "Korosi statis yang memancarkan sengatan mini setiap detik, menginterupsi animasi serangan musuh.",
      tip: "Taktik: Gagalkan jurus bos yang memiliki waktu ancang-ancang panjang."
    },

    {
      id: "swirl_api",
      e1: "angin",
      e2: "api",
      name: "FIRE SWIRL",
      label: "FIRE SWIRL",
      badgeT: 0.30,
      cat: "angin",
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
      desc: "Pusaran daun berputar menyebarkan benih flora ke seluruh target di sekitarnya.",
      tip: "Taktik: Mempersiapkan banyak musuh sekaligus untuk kombo reaksi lanjutan."
    },

    {
      id: "cryst_api",
      e1: "tanah",
      e2: "api",
      name: "FIRE CRYSTALLIZE",
      label: "FIRE CRYST",
      badgeT: 0.28,
      cat: "tanah",
      desc: "Menjatuhkan kristal perisai api di lantai; memberikan perisai penyerap damage api.",
      tip: "Taktik: Ambil pecahan kristal agar kebal terhadap serangan bara musuh."
    },
    {
      id: "cryst_es",
      e1: "tanah",
      e2: "es",
      name: "FROST CRYSTALLIZE",
      label: "FROST CRYST",
      badgeT: 0.30,
      cat: "tanah",
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

  let selectedElementId = "fisik";
  let selectedReactionId = "shatter";
  let activeFilter = "all";

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

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "cable-conduit" + (r.id === selectedReactionId ? " selected active" : ""));
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

  renderCircleNetworkChart();
  renderGrid();
  initFilters();

  if (REACTIONS.length > 0) {
    selectReaction(REACTIONS[0]);
  }
})();
