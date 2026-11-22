# Panduan Casebook Zahro

Waktu yang dibutuhkan sekitar 15 menit. Kamu hanya perlu melakukannya satu kali.

Isi paket:
- `Code.gs` : kode untuk Google Sheets (Apps Script)
- `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` : file aplikasi untuk GitHub

---

## Bagian 1. Pasang kode di Google Sheets

1. Buka Google Sheets Casebook-mu di laptop.
2. Klik menu **Ekstensi > Apps Script**. Tab baru akan terbuka.
3. Hapus semua kode yang ada di editor, lalu buka `Code.gs` dan **tempel seluruh isinya**.
4. Cari baris ini di bagian paling atas:
   `const KODE_RAHASIA = 'GANTI-DENGAN-KODE-RAHASIA-KAMU';`
   Ganti tulisan di dalam tanda kutip dengan kode buatanmu sendiri. Bebas, tapi pakai minimal 12 karakter campuran huruf dan angka. Catat kodenya, nanti dipakai di HP.
5. Klik ikon disket (**Simpan**).
6. Klik **Terapkan (Deploy) > Deployment baru**.
7. Klik ikon roda gigi di samping "Pilih jenis" lalu pilih **Aplikasi web**.
8. Isi:
   - **Jalankan sebagai**: Saya (emailmu)
   - **Yang memiliki akses**: **Siapa saja**
   (Tenang, datamu tetap terkunci oleh kode rahasia tadi.)
9. Klik **Terapkan**. Google akan minta izin: klik **Beri akses**, pilih akunmu, lalu klik **Lanjutan > Buka ... (tidak aman) > Izinkan**. Ini normal karena skripnya buatanmu sendiri.
10. **Salin "URL aplikasi web"** (berakhiran `/exec`). Simpan, nanti ditempel di HP.

Tes cepat: buka URL itu di browser. Kalau muncul tulisan "Casebook API aktif", berarti berhasil.

> Kalau suatu hari kamu mengubah `Code.gs`: simpan, lalu **Terapkan > Kelola deployment > ikon pensil > Versi: Versi baru > Terapkan**. Alamat URL tetap sama.

---

## Bagian 2. Taruh aplikasi di GitHub Pages

1. Buat akun di github.com kalau belum punya.
2. Klik **New repository**. Beri nama, misalnya `casebook`. Pilih **Public**, lalu **Create repository**.
3. Klik **uploading an existing file**, lalu seret keenam file aplikasi ini sekaligus:
   `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
   (Jangan upload `Code.gs` dan panduan ini.) Klik **Commit changes**.
4. Buka **Settings > Pages**. Di bagian **Branch**, pilih `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu 1 sampai 2 menit, lalu refresh halaman itu. Alamat aplikasimu akan muncul:
   `https://NAMAKAMU.github.io/casebook/`

Repo ini publik, tetapi **tidak berisi datamu** sama sekali. Data tetap di Google Sheets, dan hanya bisa dibuka dengan URL Apps Script ditambah kode rahasiamu.

---

## Bagian 3. Pasang di HP

1. Buka alamat GitHub Pages tadi di HP (Chrome untuk Android, Safari untuk iPhone).
2. Muncul kartu kuning "Langkah pertama". Ketuk, lalu isi:
   - **Alamat Web App**: URL `/exec` dari Bagian 1
   - **Kode rahasia**: kode yang kamu buat
3. Ketuk **Simpan dan tes**. Kalau berhasil, data dari Sheets langsung muncul.
4. Pasang ke layar utama:
   - **Android (Chrome)**: menu titik tiga > **Instal aplikasi** atau **Tambahkan ke layar utama**
   - **iPhone (Safari)**: tombol Bagikan > **Tambah ke Layar Utama**

Selesai. Aplikasi sekarang punya ikon sendiri dan terbuka layar penuh.

---

## Cara kerja sehari-hari

- **Edit di laptop (Sheets)**: buka aplikasi di HP, lalu ketuk ikon muat ulang di pojok kartu sapaan. Aplikasi juga memuat ulang otomatis saat dibuka kembali setelah lebih dari 1 menit.
- **Edit di HP**: tombol **+** untuk tambah (case, FAQ, atau sesi pelatihan), **Edit** untuk mengubah, dan **Hapus** di dalam form edit. Perubahan langsung masuk ke Sheets.
- **Tanpa sinyal**: data terakhir tetap bisa dibaca. Menambah atau mengedit butuh koneksi internet.
- **Tambah case baru**: aplikasi mengisi baris kosong pertama di sheet dan memberi ID otomatis (misalnya `PMB-C005`) serta tanggal hari ini.
- **Hapus**: yang dikosongkan hanya kolom isi (Jenis, Pertanyaan, Kondisi, Solusi, dst.). Barisnya tetap ada, jadi urutan data tidak bergeser.

---

## Catatan penting

**Sheet Akademik (KRS, OP, Proposal dan TA, Yudisium dan Wisuda, SKPI)**
Sheet ini masih berisi sisa teks template di baris 2 ke bawah yang posisinya tidak sejajar dengan kolom. Sebelum dipakai, hapus seluruh teks di baris 2 ke bawah (judul kolom di baris 1 biarkan). Kalau tidak dibersihkan, teks sisa itu bisa tertimpa atau membingungkan saat kamu menambah case.

**Sheet yang benar-benar kosong (Profeeder, OBE, Kepegawaian, SPMI, KarirLink)**
Saat kamu menambah case pertama dari aplikasi, judul kolom dibuat otomatis di baris 1. Kamu tidak perlu menyiapkan apa pun.

**Judul kolom jangan diganti**
Aplikasi mencari kolom berdasarkan namanya (`Pertanyaan / Case`, `Solusi / Alternatif / Step`, `Pertanyaan Peserta`, dan seterusnya). Boleh menambah kolom baru atau menggeser urutan kolom, tapi jangan mengubah nama kolom-kolom itu.

**Riwayat pelatihan**
Sheet `Histori Log Pelatihan` tampil di menu **Riwayat pelatihan** (kartu merah muda di halaman utama), bukan sebagai modul case/FAQ. Isinya:
- Ringkasan: total sesi, sesi bulan ini, total jam, dan grafik batang per area.
- Daftar sesi dikelompokkan per bulan, terbaru di atas. Sesi yang tanggalnya belum lewat diberi label **Akan datang**.
- Filter per area (Akademik, PMB, EdLink, dst.) dan pencarian nama pelatihan atau institusi.
- Tombol **+** untuk menambah sesi, dan **Edit** di halaman detail. Tanggal dan jam diisi lewat pemilih tanggal dan jam, lalu disimpan ke kolom Tanggal dengan format yang sama seperti barismu sekarang (contoh: `23 Okt 2026` lalu jam di baris bawahnya).
- Jam dihitung dari rentang jam di kolom Tanggal. Sesi tanpa jam tetap tampil, hanya tidak ikut dihitung di total jam.
- Judul kolom yang dibaca: `Tanggal`, `Area`, `Pelatihan`, `Institusi / Proyek`, `Audiens`, `TL / Co-Trainer`, `Tujuan / Agenda`, `Catatan`. Jangan ganti nama kolom-kolom itu. Kalau nama tab sheet-nya kamu ubah, sesuaikan `LOG_SHEET` di bagian atas `Code.gs`.

**Menyembunyikan sheet dari aplikasi**
Untuk menyembunyikan sheet modul tertentu, tambahkan namanya di daftar `ABAIKAN` di bagian atas `Code.gs`. Sheet yang di-hide di Sheets juga otomatis tidak tampil.

**Bentrok edit**
Kalau kamu mengubah baris yang sama di laptop dan HP secara bersamaan, aplikasi akan menolak simpan dan meminta muat ulang dulu. Datamu tidak akan tertimpa diam-diam.

**Keamanan**
- Jangan bagikan URL `/exec` bersama kode rahasiamu. Siapa pun yang punya keduanya bisa membaca dan mengubah data.
- Kode rahasia hanya disimpan di HP-mu, tidak di GitHub.
- Kalau kode bocor: ganti `KODE_RAHASIA` di `Code.gs`, deploy versi baru (lihat Bagian 1), lalu isi kode baru di Pengaturan aplikasi.

---

## Kalau ada masalah

| Gejala | Yang dicek |
|---|---|
| "Kode rahasia salah" | Kode di Pengaturan harus sama persis dengan `KODE_RAHASIA` di `Code.gs`. Pastikan sudah deploy versi baru setelah mengganti kode. |
| "Gagal terhubung" | Pastikan URL berakhiran `/exec` dan akses deployment diatur **Siapa saja**. |
| Data baru dari Sheets belum muncul | Ketuk ikon muat ulang. Kalau tetap tidak muncul, pastikan judul kolom di sheet tidak berubah. |
| Tampilan aplikasi tidak berubah setelah update file di GitHub | Tutup aplikasi sepenuhnya lalu buka lagi (kadang perlu dua kali). |
| Modul tidak muncul | Cek apakah sheet-nya disembunyikan atau namanya ada di daftar `ABAIKAN`. |
| Riwayat kosong padahal sheet ada isinya | Pastikan nama tab sama dengan `LOG_SHEET` dan judul kolom `Tanggal` dan `Pelatihan` ada di baris 1 sampai 3. |
| Setelah update `Code.gs`, fitur Riwayat belum jalan | Deploy versi baru (lihat catatan di Bagian 1), lalu muat ulang aplikasi. |
