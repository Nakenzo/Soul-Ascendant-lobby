# Soul Ascendant — Official Web Lobby & Download Portal

Landing page resmi untuk game **Soul Ascendant (2D Top-Down Action Roguelike)**. Website ini menampilkan showcase game, preview karakter, musik latar lobby, serta **3 tombol instalasi/bermain**:

1. 📱 **Download Android APK** (Langsung unduh berkas `.apk` tanpa ZIP)
2. 💻 **Download PC Windows** (Pemasang native `.exe` bertenaga Tauri 2.0 & opsi paket `.msi`)
3. 🌐 **Mainkan Versi Web** (Akses instan di browser web via GitHub Pages PWA)

---

## Struktur Folder Lobby

```text
lobby/
├── index.html          # Halaman portal utama
├── style.css           # Styling modern bertema dark fantasy & glowing souls
├── lobby.js            # Efek partikel jiwa interaktif, pemutar musik, & sync versi GitHub
├── favicon.ico         # Ikon tab browser
├── README.md           # Panduan repo baru
└── assets/
    ├── hero-bg.jpg     # Key art banner beresolusi tinggi
    ├── icon.png        # Logo game
    ├── icon-512.png    # Ikon HD
    ├── logo-aura.png   # Logo aura berefek kilau
    └── lobby.mp3       # Musik latar lobby
```

---

## Cara Menghubungkan ke Repositori GitHub Baru

Karena website lobby ini direncanakan berdiri di repositori terpisah dari kode sumber game, ikuti 3 langkah mudah berikut:

### 1. Buat Repositori Baru di GitHub
1. Buka [GitHub New Repository](https://github.com/new).
2. Beri nama repositori, contoh: `soul-ascendant-lobby` atau `soul-ascendant-portal`.
3. Pilih opsi **Public** lalu klik **Create repository**.

### 2. Unggah Isi Folder Lobby ke Repositori Baru
Buka terminal PowerShell pada folder `lobby`:

```powershell
cd "c:\Users\MyBook Hype AMD\OneDrive\Documents\bljr\lobby"
git init
git add .
git commit -m "feat: inisialisasi web lobby Soul Ascendant dengan 3 tombol platform"
git branch -M main
git remote add origin https://github.com/Nakenzo/NAMA-REPO-BARU.git
git push -u origin main
```
*(Ganti `NAMA-REPO-BARU` dengan nama repositori yang telah kamu buat di GitHub)*

### 3. Aktifkan GitHub Pages
1. Masuk ke halaman repositori barumu di GitHub.
2. Klik menu **Settings** > **Pages**.
3. Pada bagian **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`
   - **Branch**: Pilih `main` dan folder `/ (root)`
   - Klik **Save**.
4. Dalam 1-2 menit, website lobby akan aktif dan dapat diakses publik oleh seluruh pemain di dunia.
