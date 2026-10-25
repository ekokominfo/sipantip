# Backup SiPantip — versi-4.2te

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **4.2te**.
- Commit snapshot asli: `9bd154a60aaef8942fcba024a0d00762c00097e0`.
- Tree snapshot asli: `b72877a200ed5d9c37916a632ab5dee5fb5efe3c`.
- Waktu commit asli: 2026-10-25T16:47:32+07:00.
- Ringkasan commit asli: Release 4.2te with compact card notes and four-kilometer visibility correction.
- Sumber titik panas/data: **NASA FIRMS**.

## Isi dan perbedaan

Backup tepat sebelum 4.3te. Jarak pandang meminta titik Kelurahan Pulang Pisau dan tampilan dikurangi 4 km, tanpa mengubah nilai sumber. Nilai sumber <=4 km tidak dapat ditentukan. Catatan kartu dipadatkan; tautan Dinkes/RSUD dihapus. Grafik PM2.5/AQI masih digabung.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/versi-4.2te; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
