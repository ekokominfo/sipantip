# SiPantip 4.3te — revisi grafik gabungan

Tanggal: 25 Oktober 2026 (WIB).

## Tampilan terbaru

- Grafik PM2.5 dan US AQI kembali digabung seperti tampilan sebelum 4.3te: garis biru utuh untuk PM2.5 dan garis jingga putus-putus untuk AQI.
- Sumbu kiri memakai µg/m³, sumbu kanan memakai US AQI. Keduanya memiliki skala berbeda dan legenda tetap terlihat.
- Grafik memakai nilai per jam sumber asli. Titik terakhir PM2.5 dan AQI menggunakan nilai dan waktu sumber yang sama dengan kartu header.
- Rerata bergerak 24 jam, badge rerata dan zona warna dihapus atas permintaan pengguna. Tidak ada angka PM2.5 atau AQI yang ditambah/dikurangi.
- Tooltip menampilkan waktu, PM2.5 dan US AQI bersama. Data yang tidak tersedia tetap kosong; garis tidak dihubungkan melewati celah.
- Grafik titik panas tetap tersendiri dan data hujan tetap disembunyikan. Koreksi jarak pandang -4 km dari 4.2te tetap.

## Riwayat revisi

Rilis awal 4.3te (commit c736a4847a7c30dd93c81035c791eb372e95e2dc) sempat memisahkan grafik serta memakai rerata 24 jam untuk kategori PM2.5. Pengguna meminta tampilan tersebut dihapus karena membingungkan. Versi terbaru mengembalikan grafik sederhana dan nilai per jam; nomor tampilan tetap 4.3te, versi aset menjadi 4.3te.2.

## Backup

Backup sebelum rilis tetap versi-4.2te. Semua branch backup/desain/arsip sudah memiliki BACKUP.md. Lihat [daftar backup](BACKUPS.md) dan [registry commit](BACKUP-REGISTRY.json). Dokumentasi tidak mengubah kode/data snapshot.

## Validasi

Pengujian grafik memeriksa nilai terbaru tanpa perataan, dua garis dan dua satuan, tooltip berisi kedua nilai, serta celah data. Browser desktop dan ponsel memeriksa bahwa tooltip terakhir cocok persis dengan kartu pada waktu sumber sama, serta tidak ada badge rerata, grafik terpisah, atau zona warna.
