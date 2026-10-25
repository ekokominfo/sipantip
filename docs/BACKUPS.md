# Daftar backup SiPantip

Diperbarui 25 Oktober 2026 (WIB), sebelum rilis 4.3te. Backup terbaru: **versi-4.2te**.

Setiap branch berikut memiliki BACKUP.md yang menjelaskan isi, sumber, batasan, dan langkah pemulihan. Commit dokumentasi hanya menambah berkas itu; isi kode/data snapshot tetap sama. Commit asli dan hasil verifikasi tercatat di [BACKUP-REGISTRY.json](BACKUP-REGISTRY.json). Branch desain historis juga didokumentasikan agar tidak tertukar dengan rilis produksi.

| Branch / dokumentasi | Versi atau jenis | Sumber | Commit asli | Perbedaan utama |
|---|---|---|---|---|
| [codex/backup-v2-2026-10-24](https://github.com/ekokominfo/sipantip/blob/codex/backup-v2-2026-10-24/BACKUP.md) | 2.0 | Proxy Palangka / SiPongi lama | `bc4565c` | Dashboard versi 2 dengan pembacaan salinan cache bersama. Belum memiliki fitur Lokasi saya dan animasi Himawari versi 4. |
| [codex/desain-v1.5](https://github.com/ekokominfo/sipantip/blob/codex/desain-v1.5/BACKUP.md) | Desain 1.5; footer 2.0 | Proxy Palangka / SiPongi lama | `96e6daa` | Cabang pembanding desain 1.5. Nomor footer pada snapshot masih 2.0; nama cabang tidak berarti footer berubah. |
| [desain-biru](https://github.com/ekokominfo/sipantip/blob/desain-biru/BACKUP.md) | 2.0 desain biru | Proxy Palangka / SiPongi lama | `ee7ebc7` | Snapshot tampilan biru versi 2 dan identitas pin api. Integrasi sumber lama dapat tidak terjangkau sekarang. |
| [codex/release-v3](https://github.com/ekokominfo/sipantip/blob/codex/release-v3/BACKUP.md) | 3.0 | Proxy Palangka / SiPongi lama | `e6b5ccc` | Rilis versi 3 dengan prakiraan desa dan dashboard yang diperjelas, sebelum pemulihan kolektor Supabase dan pergantian FIRMS. |
| [versi-3.5](https://github.com/ekokominfo/sipantip/blob/versi-3.5/BACKUP.md) | 3.5 | SiPongi langsung | `9a59bdc` | Versi terakhir sebelum sumber aktif diganti ke FIRMS. Kolektor Supabase menggunakan SiPongi. Kartu desa memuat kondisi BMKG pada snapshot ini. |
| [versi-3.5b](https://github.com/ekokominfo/sipantip/blob/versi-3.5b/BACKUP.md) | 3.5b; footer 3.5 | NASA FIRMS | `82dd803` | Masih menampilkan kartu peluang hujan dan grafik gabungan hujan/titik panas. Filter nama kecamatan desa dan perpindahan peta sudah diperbaiki. |
| [codex/backup-versi-3.5c](https://github.com/ekokominfo/sipantip/blob/codex/backup-versi-3.5c/BACKUP.md) | 3.5c | NASA FIRMS | `32ebb44` | Kartu dan grafik hujan disembunyikan. Waktu deteksi terakhir dan peringatan setelah 6 jam tersedia. Belum ada fitur Lokasi saya versi 4. |
| [versi-4.0](https://github.com/ekokominfo/sipantip/blob/versi-4.0/BACKUP.md) | 4.0; admin 3.5 | NASA FIRMS | `13a1b63` | Lokasi saya, pencarian deteksi Tinggi terdekat, 12 puskesmas + RSUD Pulpis, rute Google Maps, dan animasi awan Himawari. Grafik khusus titik panas sudah tampil lagi; angka kartu desa diperbesar. Snapshot turut memuat admin 3.5. Jarak pandang belum dikurangi. |
| [versi-4.2te](https://github.com/ekokominfo/sipantip/blob/versi-4.2te/BACKUP.md) | 4.2te | NASA FIRMS | `9bd154a` | Backup tepat sebelum 4.3te. Jarak pandang meminta titik Kelurahan Pulang Pisau dan tampilan dikurangi 4 km, tanpa mengubah nilai sumber. Nilai sumber <=4 km tidak dapat ditentukan. Catatan kartu dipadatkan; tautan Dinkes/RSUD dihapus. Grafik PM2.5/AQI masih digabung. |
| [data-cache](https://github.com/ekokominfo/sipantip/blob/data-cache/BACKUP.md) | Arsip data GitHub | Snapshot cache GitHub | `dd8c292` | Cabang ini berisi salinan data lingkungan GitHub, bukan backup kode aplikasi. Backend aktif memakai Supabase Storage. Baca timestamp objek/manifest sebelum memakai data ini; snapshot bukan jaminan kondisi sekarang. |

## Cara memulihkan

1. Pilih backup sesuai fitur dan sumber yang dibutuhkan. Baca BACKUP.md pada branch tersebut.
2. Buat branch kerja baru dari origin/branch-backup; jangan menimpa perubahan kerja yang belum disimpan.
3. Jalankan pengujian versi itu, periksa sumber data, dan tinjau perubahan terhadap main.
4. Publikasi kembali dilakukan melalui main dan folder dist. Jangan menggabungkan data-cache sebagai pengganti kode aplikasi.
5. Database, Storage, Vault, jadwal Supabase dan kredensial bukan bagian snapshot Git. Backup frontend tidak otomatis memulihkan backend.

## Versi terkini

4.4te merapikan kartu desa: PM2.5 dan AQI berdampingan, kategori udara terpisah, periode deteksi dan waktu udara jelas, serta aksi tampilkan di peta. Grafik gabungan sederhana dari revisi 4.3te tetap digunakan, dengan nilai per jam asli dan tooltip kedua nilai. PM2.5 dan AQI tidak ditambah/dikurangi. Prakiraan hujan tetap disembunyikan, grafik titik panas tetap tampil, dan koreksi jarak pandang -4 km dari 4.2te dipertahankan. Dokumentasi rilis ada di [RELEASE-4.4te.md](RELEASE-4.4te.md); daftar backup di atas tetap historis.

Rilis aktif berikutnya: **4.6te**, dengan NOAA-21, daftar sumber diperbarui dan pesan deteksi lama dibedakan dari penarikan gagal. Grafik tetap. Lihat [RELEASE-4.6te.md](RELEASE-4.6te.md). Tidak ada branch backup historis yang ditimpa.
