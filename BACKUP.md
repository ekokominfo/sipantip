# Backup SiPantip — versi-4.0

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **4.0; admin 3.5**.
- Commit snapshot asli: `13a1b6372f189b438406d48648d6a009c00d51c4`.
- Tree snapshot asli: `a39b9fe9051c7d36492e33f0e0a4058265cbe6b7`.
- Waktu commit asli: 2026-10-25T15:58:35+07:00.
- Ringkasan commit asli: Release admin 3.5 with FE pastel colors and responsive chart sizing.
- Sumber titik panas/data: **NASA FIRMS**.

## Isi dan perbedaan

Lokasi saya, pencarian deteksi Tinggi terdekat, 12 puskesmas + RSUD Pulpis, rute Google Maps, dan animasi awan Himawari. Grafik khusus titik panas sudah tampil lagi; angka kartu desa diperbesar. Snapshot turut memuat admin 3.5. Jarak pandang belum dikurangi.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/versi-4.0; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
