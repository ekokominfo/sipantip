# Backup SiPantip — codex/desain-v1.5

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **Desain 1.5; footer 2.0**.
- Commit snapshot asli: `96e6daa3e5181b4a9924ee61999ef353ffea3871`.
- Tree snapshot asli: `918d9503a40d2e4c2996c32dc0f033aafda0858f`.
- Waktu commit asli: 2026-10-24T05:56:20+07:00.
- Ringkasan commit asli: Add version 1.5 frontend design comparison.
- Sumber titik panas/data: **Proxy Palangka / SiPongi lama**.

## Isi dan perbedaan

Cabang pembanding desain 1.5. Nomor footer pada snapshot masih 2.0; nama cabang tidak berarti footer berubah.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/codex/desain-v1.5; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
