# Backup SiPantip — codex/backup-versi-3.5c

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **3.5c**.
- Commit snapshot asli: `32ebb441c6e731a6abc861bdd877df9259980de0`.
- Tree snapshot asli: `4942d7977e9e7daf6342dad0dd66413fa065575a`.
- Waktu commit asli: 2026-10-25T13:54:56+07:00.
- Ringkasan commit asli: Release 3.5c with delayed hotspot warning and hidden rain panels.
- Sumber titik panas/data: **NASA FIRMS**.

## Isi dan perbedaan

Kartu dan grafik hujan disembunyikan. Waktu deteksi terakhir dan peringatan setelah 6 jam tersedia. Belum ada fitur Lokasi saya versi 4.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/codex/backup-versi-3.5c; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
