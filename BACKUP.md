# Backup SiPantip — codex/release-v3

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **3.0**.
- Commit snapshot asli: `e6b5cccfea10219ec33d4b5f35d914a7315b61cf`.
- Tree snapshot asli: `b711a136d222a610d744fa05a3aadf1d780b0648`.
- Waktu commit asli: 2026-10-24T20:34:39+07:00.
- Ringkasan commit asli: Release SIPANTIP v3 with village forecasts and clearer dashboard.
- Sumber titik panas/data: **Proxy Palangka / SiPongi lama**.

## Isi dan perbedaan

Rilis versi 3 dengan prakiraan desa dan dashboard yang diperjelas, sebelum pemulihan kolektor Supabase dan pergantian FIRMS.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/codex/release-v3; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
