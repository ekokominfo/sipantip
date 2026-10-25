# Admin / BE 3.5

Versi admin: 3.5 (`ADMIN_VERSION`). Versi halaman publik tetap 4.0.

## Backup sebelum perubahan

Kode v2 disimpan pada tag lokal `be-v2.0-backup-20261025`, commit
`b74821d369300d5e864ab60e0d55876afb85c059`.
Arsip lengkap dan SHA256 berada di `../backups/be-v2-20261025/`.
Arsip diperiksa dengan ZIP integrity check dan memuat footer admin Versi 2.0.
Ini backup kode dan definisi SQL, bukan salinan data produksi.

## Penerapan

1. Jalankan `supabase/report-v3.sql` melalui SQL Editor proyek Supabase yang
   sama dengan `analytics-config.js`. Ini migrasi tambahan setelah
   `analytics.sql` / `report-v2.sql`; tidak menghapus data lama atau admin.
2. Terbitkan isi `dist/` setelah migrasi berhasil. Jangan menyertakan data uji,
   arsip backup, atau runtime pengujian dari direktori induk.
3. Masuk sebagai admin. Pastikan tidak ada pemberitahuan laporan masih v2.
   Uji satu perubahan filter dan satu aktivasi lapisan, lalu Perbarui laporan.

Migrasi aman dijalankan ulang: waktu awal pelacakan v3 tetap dipertahankan.
Tanpa migrasi, admin tetap menampilkan metrik lama, dengan pemberitahuan bahwa
laporan interaksi dan jam ramai v3 belum tersedia. Frontend tidak menampilkan
data jam lama sebagai data 24 jam terakhir.

## Arti metrik

- Total pengunjung: perkiraan ID browser unik sepanjang riwayat.
- Pengunjung unik: ID berbeda dengan sesi yang dimulai dalam periode pilihan.
- Kunjungan: sesi yang dimulai dalam periode. Sesi baru setelah jeda lebih
  dari 30 menit atau pergantian hari WIB.
- Halaman dibuka: hitungan pageview tersimpan, dengan batas pencatatan lama.
- Baru / kembali: first_seen berada dalam / sebelum periode pilihan.
- Jam ramai: 24 interval satu jam yang tepat menutupi 24 jam sebelum laporan
  dibuat. Label dan tooltip memuat waktu WIB; interval bisa mulai di tengah
  jam, misalnya 14.27–15.27. Tidak mengikuti filter utama 7/30/90 hari.
- Bagian dilihat: sekali per sesi ketika bagian masuk area pandang.
  Cakupan v4 termasuk ringkasan lingkungan, grafik titik panas 24 jam,
  PM 2.5 & AQI, serta sumber data. Bukan bukti klik atau membaca sampai selesai.
- Sumber kunjungan: hostname perujuk, dikelompokkan menjadi mesin pencari,
  media sosial/pesan, situs lain, internal, dan langsung/tidak diketahui.
  Seluruh domain disertakan agar persentase berdasarkan seluruh sesi.
- Perangkat/browser/OS: jumlah dan persentase sesi dalam periode yang dipilih.
- Periode sebelumnya: rentang sebelum periode pilihan dengan jumlah hari
  sama. Hari ini belum selesai. Persentase tidak dihitung dari pembanding nol
  atau riwayat yang belum cukup. Awal riwayat memakai kunjungan pertama
  tercatat sehingga penilaian kecukupan bersifat konservatif.

## Pelacakan fitur peta

Tabel privat `map_events` menyimpan UUID event, sesi, kode tindakan terbatas,
dan waktu server. Laporan mengembalikan penggunaan dan jumlah sesi berbeda
per tindakan. Sesi antarbaris dapat tumpang tindih dan tidak dijumlahkan
sebagai jumlah pengunjung unik.

Dicatat: perubahan filter kecamatan/periode/kepercayaan, pilihan desa,
pencarian wilayah yang dikirim, aktivasi lapisan, permintaan/hapus lokasi,
pilihan pencarian terdekat, lihat hasil di peta, buka rute, fokus wilayah,
layar penuh yang berhasil dibuka, hapus pilihan dan reset filter.

Pengaturan bawaan, pemuatan ulang data, klik sintetis, dan penonaktifan
lapisan tidak dihitung sebagai aktivasi. Pencarian dihitung sebagai permintaan,
bukan jumlah hasil. Lokasi saya dihitung sebagai permintaan, bukan izin berhasil.
Tidak mengirim teks pencarian, nama desa/kecamatan terpilih, koordinat, URL rute,
IP, atau identitas pengguna. DNT/GPC dan pembatasan hostname produksi tetap aktif.

Pengulangan tindakan yang sama dalam 500 ms dibatasi di klien dan server.
UUID event mencegah request yang sama dihitung ulang. Batas 600 interaksi per
sesi; batas lama 48 sesi per ID per 24 jam dan maksimal 200 pageview tetap ada.
Ini penghitung publik dengan pembatasan sederhana, bukan verifikasi manusia.
Request gagal tidak dimasukkan sebagai penggunaan berhasil tersimpan dan
tidak disimpan untuk pengiriman ulang lintas halaman.

Riwayat interaksi sebelum migrasi tidak tersedia. Penanda waktu awal yang
ditampilkan adalah waktu migrasi, bukan jaminan frontend sudah diterbitkan
pada saat yang sama.

## Validasi lokal

- `node --test tests/*.test.cjs` (di direktori sipantip).
- `../qa-admin-v3-db.cjs`: menjalankan migrasi v2→v3 pada PostgreSQL WASM
  sementara, termasuk validasi anon/non-admin/admin, deduplikasi event,
  batas klik cepat, kepemilikan sesi, cutoff 24 jam, dan regresi fungsi lama.
- `../qa-admin-v3.cjs`: fixture browser dengan semua request statistik dicegat;
  tidak login atau menambah statistik ke produksi. Menguji desktop/ponsel,
  input keyboard, lapisan, filter, desa, lokasi simulasi, rute, kondisi kosong,
  kegagalan layanan, serta kompatibilitas database v2.

Runtime PGlite dan gambar QA tersimpan di `../artifacts/`, di luar situs.
Screenshot memakai data simulasi.

## Pemulihan

Tinjau file pada tag backup dengan `git show be-v2.0-backup-20261025:admin.html`
atau ekstrak ZIP ke direktori terpisah. Pulihkan file admin yang diperlukan
melalui commit baru; jangan reset riwayat bersama. Untuk laporan database v2,
terapkan kembali `supabase/report-v2.sql`. Tabel interaksi tambahan dapat
dipertahankan agar riwayat v3 tidak hilang. Pelacakan frontend v3 harus ikut
dipulihkan bila hendak menghentikan pencatatan interaksi baru.

## Revisi desain admin 3.5

Palet mengikuti interface-v2.css halaman publik: biru, peach, lavender, mint,
dan krem diterapkan pada seluruh permukaan kartu. Kartu metrik memiliki tinggi
seimbang; metrik terakhir melebar pada ponsel. Grafik tren dan jam ramai
berdampingan di desktop, lalu menjadi satu kolom di layar kecil. ViewBox grafik
mengikuti lebar wadah melalui ResizeObserver agar label tetap terbaca.
Perangkat, pengunjung baru/kembali, dan perbandingan memakai baris ringkasan
tersendiri. Tidak ada perubahan rumus metrik atau migrasi database tambahan.
Skema laporan tetap versi 3; versi tampilan admin 3.5, halaman publik 4.0.

Validasi desain: tes admin-charts serta QA browser warna kartu, tinggi metrik,
ukuran plot, tooltip keyboard, 7/30/90 hari, kondisi kosong/gagal, dan lebar
360, 375, 390, 768, 1440 piksel. Screenshot admin-v35 memakai data simulasi.
