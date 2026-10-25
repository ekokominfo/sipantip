# Backup SiPantip — versi-3.5

Dokumentasi ditambahkan 25 Oktober 2026 (WIB). Perubahan dokumentasi ini tidak mengubah kode, data, atau konfigurasi snapshot.

- Versi/jenis: **3.5**.
- Commit snapshot asli: `9a59bdcab9bd9553be9c37fbe996fa71f9b27020`.
- Tree snapshot asli: `8a8efd468f591c09a79e11c31ad2f0150afcc456`.
- Waktu commit asli: 2026-10-25T12:11:04+07:00.
- Ringkasan commit asli: Show BMKG village conditions and refine release 3.5 cards.
- Sumber titik panas/data: **SiPongi langsung**.

## Isi dan perbedaan

Versi terakhir sebelum sumber aktif diganti ke FIRMS. Kolektor Supabase menggunakan SiPongi. Kartu desa memuat kondisi BMKG pada snapshot ini.

## Batas backup

Branch ini membekukan isi Git pada commit asli. Tambahan BACKUP.md adalah satu-satunya perubahan setelah snapshot. Backup ini tidak otomatis membekukan database, isi bucket Supabase, Vault, jadwal cron, kredensial, atau data eksternal. Koneksi sumber pada versi lama belum tentu berfungsi sekarang. Berkas rahasia tidak boleh dimasukkan ke Git.

## Pemeriksaan dan pemulihan

1. Lihat kode snapshot asli melalui commit di atas; dokumentasi tambahan memiliki commit terpisah.
2. Ambil branch dari origin, lalu buat branch kerja pemulihan baru dari origin/versi-3.5; jangan menghapus perubahan kerja yang belum disimpan.
3. Bandingkan kode dan konfigurasi sumber dengan versi produksi. Jalankan pengujian yang tersedia dan periksa frontend pada desktop/ponsel.
4. Untuk cabang aplikasi, publikasi produksi dilakukan dengan membawa perubahan yang sudah diperiksa ke main, yang menerbitkan folder dist. Pengaturan backend dan data Supabase dipulihkan secara terpisah bila diperlukan.
5. Untuk data-cache, ambil hanya objek data yang dibutuhkan setelah memeriksa timestamp; jangan gunakan branch ini sebagai pengganti kode aplikasi main.

Daftar seluruh backup dan perbandingannya tersedia di docs/BACKUPS.md pada main.
