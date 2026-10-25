# Backup SiPantip — versi-3.5b

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **3.5b; footer 3.5**.
- Commit snapshot asli: `82dd803fa1a58fe2550cc5cfb5cad670801fad97`.
- Tree snapshot asli: `12383ce9445c4c4ac0567df0f7c23570dac92505`.
- Waktu commit asli: 2026-10-25T13:19:06+07:00.
- Ringkasan commit asli: Fix village map filtering and clarify rain forecast periods.
- Sumber titik panas/data: **NASA FIRMS**.

## Isi dan perbedaan

Masih menampilkan kartu peluang hujan dan grafik gabungan hujan/titik panas. Filter nama kecamatan desa dan perpindahan peta sudah diperbaiki.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/versi-3.5b; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
