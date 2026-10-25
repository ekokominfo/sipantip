# Backup SiPantip — data-cache

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **Arsip data GitHub**.
- Commit snapshot asli: `dd8c29209e7858c6be2473762df972a2fc755a04`.
- Tree snapshot asli: `638768047bbd4bac04eda1e827eb6c49b74be77e`.
- Waktu commit asli: 2026-10-24T23:07:09Z.
- Ringkasan commit asli: Update shared environmental data.
- Sumber titik panas/data: **Snapshot cache GitHub**.

## Isi dan perbedaan

Cabang ini berisi salinan data lingkungan GitHub, bukan backup kode aplikasi. Backend aktif memakai Supabase Storage. Baca timestamp objek/manifest sebelum memakai data ini; snapshot bukan jaminan kondisi sekarang.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/data-cache; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
