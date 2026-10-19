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
    { id: "api", name: "Api", color: "#f97316", icon: "assets/element-api.svg", angle: 270 },
    { id: "nature", name: "Nature", color: "#22c55e", icon: "assets/element-nature.svg", angle: 315 },
    { id: "angin", name: "Angin", color: "#34d399", icon: "assets/element-angin.svg", angle: 0 },
    { id: "es", name: "Es", color: "#38bdf8", icon: "assets/element-es.svg", angle: 45 },
    { id: "petir", name: "Petir", color: "#facc15", icon: "assets/element-petir.svg", angle: 90 },
    { id: "tanah", name: "Tanah", color: "#d97706", icon: "assets/element-tanah.svg", angle: 135 },
    { id: "nihil", name: "Nihil", color: "#a855f7", icon: "assets/element-nihil.svg", angle: 180 },
    { id: "fisik", name: "Fisik", color: "#cbd5e1", icon: "assets/element-fisik.svg", angle: 225 }
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
      id: "frostbite_spore",
      e1: "es",
      e2: "nature",
      name: "FROSTBITE SPORE",
      cat: "energi",
      desc: "Spora es meletus, membekukan musuh di sekitar target selama 1.5 detik.",
      tip: "Taktik: Hentikan laju monster cepat agar posisinya terkunci di arena."
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
      id: "swirl_tanah",
      e1: "angin",
      e2: "tanah",
      name: "SAND SWIRL",
      cat: "angin",
      desc: "Badai debu pasir yang mengaburkan pandangan musuh dan merusak konsentrasi serangannya.",
      tip: "Taktik: Mengurangi akurasi serangan proyektil monster penembak jarak jauh."
    },
    {
      id: "void_swirl",
      e1: "angin",
      e2: "nihil",
      name: "VOID SWIRL",
      cat: "angin",
      desc: "Pusaran gravitasi kehampaan yang menarik musuh ke pusat pusaran sambil memberi efek korosi.",
      tip: "Taktik: Menyatukan musuh di satu titik untuk dieksekusi dengan jurus Ultimate."
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
      id: "cryst_petir",
      e1: "tanah",
      e2: "petir",
      name: "VOLT CRYSTALLIZE",
      cat: "tanah",
      desc: "Menjatuhkan kristal perisai petir; memberikan perisai penyerap damage listrik.",
      tip: "Taktik: Melindungi diri dari sengatan statis di lantai pertarungan."
    },
    {
      id: "cryst_nature",
      e1: "tanah",
      e2: "nature",
      name: "BIO CRYSTALLIZE",
      cat: "tanah",
      desc: "Menjatuhkan kristal perisai alam; memberikan regenerasi shield ringan.",
      tip: "Taktik: Memperpanjang daya tahan hidup karakter saat menghadapi wave panjang."
    },
    {
      id: "crush",
      e1: "tanah",
      e2: "fisik",
      name: "CRUSH",
      cat: "tanah",
      desc: "Hantaman remuk yang meremukkan ketahanan monster tipe tank/armor tebal dan memberi efek stun singkat.",
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
      id: "flame_corrosion",
      e1: "nihil",
      e2: "api",
      name: "FLAME CORROSION",
      cat: "nihil",
      desc: "Korosi api hitam yang menggerogoti HP musuh dan menular ke monster lain yang bersentuhan.",
      tip: "Taktik: Api hitam akan terus menyebar selama musuh bergerombol rapat."
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
      id: "plague_corrosion",
      e1: "nihil",
      e2: "nature",
      name: "PLAGUE CORROSION",
      cat: "nihil",
      desc: "Korosi asam hayati yang merontokkan 30% armor musuh dan menguras HP secara bertahap.",
      tip: "Taktik: Sangat efektif mengikis musuh dengan darah tebal."
    },
    {
      id: "enchant_corrosion",
      e1: "nihil",
      e2: "fisik",
      name: "ENCHANT CORROSION",
      cat: "nihil",
      desc: "Skill fisik memicu pasif buff pelapisan korosi selama 5 detik untuk seluruh serangan karakter.",
      tip: "Taktik: Aktifkan skill fisik pada musuh void, lalu serang bebas dengan base attack untuk menularkan korosi."
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
      id: "spark",
      e1: "fisik",
      e2: "api",
      name: "SPARK",
      cat: "fisik",
      desc: "Letupan percikan gesekan bara (+25% Crit Damage + Micro Knockback mundur).",
      tip: "Taktik: Beri jarak aman bagi pemain jarak dekat saat menyerang musuh membara."
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
      id: "splinter",
      e1: "fisik",
      e2: "nature",
      name: "SPLINTER",
      cat: "fisik",
      desc: "Pecahan duri tajam berhamburan ke segala arah dan menimbulkan pendarahan ringan.",
      tip: "Taktik: Mengubah serangan fisik satu target menjadi kerusakan area mini."
    }
  ];

  const svg = document.getElementById("reactionChartSvg");
  const linesGroup = document.getElementById("chartLinesGroup");
  const badgesGroup = document.getElementById("chartBadgesGroup");
  const nodesGroup = document.getElementById("chartNodesGroup");
  const pickerBar = document.getElementById("elementPickerBar");
  const centerFormulaText = document.getElementById("centerFormulaText");
  const centerActionText = document.getElementById("centerActionText");
  const grid = document.getElementById("reactionsGrid");

  const inspTitle = document.getElementById("inspectorTitle");
  const inspFormula = document.getElementById("inspectorFormula");
  const inspDesc = document.getElementById("inspectorDesc");
  const inspTip = document.getElementById("inspectorTip");
  const inspIcon1 = document.getElementById("inspIcon1");
  const inspIcon2 = document.getElementById("inspIcon2");
  const inspCatBadge = document.getElementById("inspectorCatBadge");

  const CENTER = 300;
  const RADIUS = 210;

  let selectedElementId = "api";
  let selectedReactionId = "melt";
  let activeFilter = "all";

  function getElementById(id) {
    return ELEMENTS.find(function(e) { return e.id === id; });
  }

  function getElementCoords(elem) {
    const rad = (elem.angle * Math.PI) / 180;
    return {
      x: CENTER + RADIUS * Math.cos(rad),
      y: CENTER + RADIUS * Math.sin(rad)
    };
  }

  function renderPickerBar() {
    if (!pickerBar) return;
    pickerBar.innerHTML = "";

    ELEMENTS.forEach(function(el) {
      const btn = document.createElement("button");
      btn.className = "picker-btn" + (selectedElementId === el.id ? " active" : "");
      btn.setAttribute("type", "button");
      btn.setAttribute("data-id", el.id);
      btn.style.setProperty("--btn-color", el.color);
      btn.style.setProperty("--btn-glow", el.color + "66");

      btn.innerHTML =
        '<img src="' + el.icon + '" alt="' + el.name + '" class="picker-icon">' +
        '<span>' + el.name + '</span>';

      btn.addEventListener("click", function() {
        selectElement(el.id);
      });

      pickerBar.appendChild(btn);
    });
  }

  function renderNodes() {
    if (!nodesGroup) return;
    nodesGroup.innerHTML = "";

    ELEMENTS.forEach(function(el) {
      const coords = getElementCoords(el);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "chart-node" + (selectedElementId === el.id ? " active" : ""));
      g.setAttribute("data-id", el.id);
      g.setAttribute("transform", "translate(" + coords.x.toFixed(1) + "," + coords.y.toFixed(1) + ")");

      const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      halo.setAttribute("class", "node-halo");
      halo.setAttribute("r", "32");
      halo.setAttribute("fill", "none");
      halo.setAttribute("stroke", el.color);
      halo.setAttribute("stroke-width", "2");
      halo.setAttribute("opacity", selectedElementId === el.id ? "0.85" : "0.35");

      const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bg.setAttribute("class", "node-bg");
      bg.setAttribute("r", "25");
      bg.setAttribute("fill", "#090e17");
      bg.setAttribute("stroke", el.color);
      bg.setAttribute("stroke-width", selectedElementId === el.id ? "3" : "2.5");

      const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
      img.setAttribute("href", el.icon);
      img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", el.icon);
      img.setAttribute("x", "-15");
      img.setAttribute("y", "-15");
      img.setAttribute("width", "30");
      img.setAttribute("height", "30");
      img.setAttribute("pointer-events", "none");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "node-label");
      label.setAttribute("x", "0");
      label.setAttribute("y", "42");
      label.textContent = el.name.toUpperCase();

      g.appendChild(halo);
      g.appendChild(bg);
      g.appendChild(img);
      g.appendChild(label);

      g.addEventListener("click", function() {
        selectElement(el.id);
      });

      nodesGroup.appendChild(g);
    });
  }

  function renderLinesAndBadges() {
    if (!linesGroup || !badgesGroup) return;
    linesGroup.innerHTML = "";
    badgesGroup.innerHTML = "";

    REACTIONS.forEach(function(r) {
      const e1 = getElementById(r.e1);
      const e2 = getElementById(r.e2);
      if (!e1 || !e2) return;

      const p1 = getElementCoords(e1);
      const p2 = getElementCoords(e2);

      const isConnected = r.e1 === selectedElementId || r.e2 === selectedElementId;
      const isSelectedReact = r.id === selectedReactionId;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p1.x.toFixed(1));
      line.setAttribute("y1", p1.y.toFixed(1));
      line.setAttribute("x2", p2.x.toFixed(1));
      line.setAttribute("y2", p2.y.toFixed(1));
      line.setAttribute("stroke", e1.color);
      line.setAttribute("class", "chart-line" + (isSelectedReact ? " selected-react" : (isConnected ? " active" : " dimmed")));
      line.setAttribute("data-react-id", r.id);
      line.setAttribute("data-e1", r.e1);
      line.setAttribute("data-e2", r.e2);

      line.addEventListener("click", function() {
        selectReaction(r);
      });

      linesGroup.appendChild(line);

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const gBadge = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gBadge.setAttribute("class", "reaction-badge-group");
      gBadge.setAttribute("data-react-id", r.id);
      gBadge.setAttribute("data-e1", r.e1);
      gBadge.setAttribute("data-e2", r.e2);
      gBadge.setAttribute("transform", "translate(" + midX.toFixed(1) + "," + midY.toFixed(1) + ")");
      if (!isConnected) {
        gBadge.style.display = "none";
      }

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const badgeW = Math.max(56, r.name.length * 6.5 + 16);
      rect.setAttribute("x", (-badgeW / 2).toFixed(1));
      rect.setAttribute("y", "-10");
      rect.setAttribute("width", badgeW.toFixed(1));
      rect.setAttribute("height", "20");
      rect.setAttribute("rx", "10");
      rect.setAttribute("class", "badge-bg");
      rect.setAttribute("fill", "#090e17");
      rect.setAttribute("stroke", e1.color);
      rect.setAttribute("stroke-width", isSelectedReact ? "2" : "1.5");

      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("class", "badge-text");
      txt.setAttribute("x", "0");
      txt.setAttribute("y", "0.5");
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("fill", "#f8fafc");
      txt.textContent = r.name;

      gBadge.appendChild(rect);
      gBadge.appendChild(txt);

      gBadge.addEventListener("click", function() {
        selectReaction(r);
      });

      badgesGroup.appendChild(gBadge);
    });
  }

  function selectElement(id) {
    selectedElementId = id;

    const pickerBtns = document.querySelectorAll(".picker-btn");
    pickerBtns.forEach(function(btn) {
      if (btn.getAttribute("data-id") === id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const nodes = document.querySelectorAll(".chart-node");
    nodes.forEach(function(n) {
      const nid = n.getAttribute("data-id");
      if (nid === id) {
        n.classList.add("active");
        n.classList.remove("dimmed");
      } else {
        const isConnected = REACTIONS.some(function(r) {
          return (r.e1 === id && r.e2 === nid) || (r.e2 === id && r.e1 === nid);
        });
        if (isConnected) {
          n.classList.remove("active", "dimmed");
        } else {
          n.classList.add("dimmed");
          n.classList.remove("active");
        }
      }
    });

    const lines = document.querySelectorAll(".chart-line");
    lines.forEach(function(l) {
      const e1 = l.getAttribute("data-e1");
      const e2 = l.getAttribute("data-e2");
      if (e1 === id || e2 === id) {
        l.classList.add("active");
        l.classList.remove("dimmed");
      } else {
        l.classList.add("dimmed");
        l.classList.remove("active", "selected-react");
      }
    });

    const badges = document.querySelectorAll(".reaction-badge-group");
    badges.forEach(function(b) {
      const e1 = b.getAttribute("data-e1");
      const e2 = b.getAttribute("data-e2");
      if (e1 === id || e2 === id) {
        b.style.display = "block";
      } else {
        b.style.display = "none";
      }
    });

    const activeReact = REACTIONS.find(function(r) {
      return (r.e1 === id && r.e2 === selectedReactionId) ||
             (r.e2 === id && r.e1 === selectedReactionId) ||
             (r.id === selectedReactionId && (r.e1 === id || r.e2 === id));
    }) || REACTIONS.find(function(r) {
      return r.e1 === id || r.e2 === id;
    });

    if (activeReact) {
      selectReaction(activeReact);
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

    if (centerFormulaText) centerFormulaText.textContent = r.name;
    if (centerActionText) centerActionText.textContent = e1.name + " + " + e2.name;

    const lines = document.querySelectorAll(".chart-line");
    lines.forEach(function(l) {
      if (l.getAttribute("data-react-id") === r.id) {
        l.classList.add("selected-react");
      } else {
        l.classList.remove("selected-react");
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

  renderPickerBar();
  renderNodes();
  renderLinesAndBadges();
  renderGrid();
  initFilters();

  if (REACTIONS.length > 0) {
    selectElement("api");
    selectReaction(REACTIONS[0]);
  }
})();
