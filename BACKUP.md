# Backup SiPantip — codex/backup-v2-2026-10-24

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **2.0**.
- Commit snapshot asli: `bc4565c82262f6d11a518a13b5ac6e55658caa50`.
- Tree snapshot asli: `a5669ed650364e71333a5939e58b19fb34a859f8`.
- Waktu commit asli: 2026-10-24T05:31:04+07:00.
- Ringkasan commit asli: Serve environmental dashboard from shared scheduled cache.
- Sumber titik panas/data: **Proxy Palangka / SiPongi lama**.

## Isi dan perbedaan

Dashboard versi 2 dengan pembacaan salinan cache bersama. Belum memiliki fitur Lokasi saya dan animasi Himawari versi 4.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/codex/backup-v2-2026-10-24; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
