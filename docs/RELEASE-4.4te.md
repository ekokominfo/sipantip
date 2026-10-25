# SiPantip 4.4te — kartu desa

Tanggal: 25 Oktober 2026 (WIB).

- Nama desa dan jumlah titik panas tetap di bagian atas dengan angka besar.
- PM2.5 dan US AQI berdampingan, masing-masing dengan label dan satuannya. Angka sumber tidak berubah.
- Kategori udara menjadi badge tersendiri.
- Periode titik panas mengikuti filter. Waktu data udara ditampilkan terpisah dalam WIB karena waktunya dapat berbeda dari periode deteksi.
- Petunjuk Tampilkan di peta menegaskan aksi kartu; kartu terpilih menampilkan Ditampilkan di peta. Seluruh kartu tetap satu tombol dengan status aria-pressed.
- Tinggi kartu mengikuti isi, dengan empat kolom pada desktop lebar dan satu kolom pada ponsel. Tema pastel tetap digunakan.
- Data udara yang tidak tersedia ditandai dengan tanda pisah dan keterangan waktu belum tersedia, tanpa membuat nilai nol.

Grafik gabungan PM2.5/AQI, grafik titik panas, sumber data, koreksi jarak pandang dan pengaturan data tersembunyi tetap mengikuti rilis sebelumnya. Prakiraan cuaca, kondisi BMKG dan jarak pandang desa tetap disembunyikan.

## Validasi

`node --test tests/village-filter.test.cjs`: dua pengujian lulus, mencakup filter wilayah FIRMS serta label periode dan konversi waktu WIB. Pemeriksaan sintaks JavaScript dan whitespace lulus.

Pemeriksaan browser pada lebar 1440, 390 dan 360 piksel memastikan tidak ada luapan horizontal, dua nilai udara berdampingan, label sesuai nilai sumber, filter periode bekerja, pemilihan desa sesuai jumlah penanda peta, status pilihan berubah, grafik tetap tampil dan data udara kosong tidak diubah menjadi nol.

Daftar backup historis tetap tersedia di [BACKUPS.md](BACKUPS.md). Rilis ini tidak membuat atau menimpa branch backup.

## Revisi kartu 4.4te.1

Atas permintaan pengguna, dua garis pembagi pada blok PM2.5/AQI, label periode pada kartu, dan waktu data udara pada kartu dihapus. Filter periode dan waktu sumber tetap digunakan oleh aplikasi; nilai dan fungsi pemilihan peta tidak berubah. Nomor tampilan tetap 4.4te.

## Revisi kartu header PM2.5 — aset 4.4te.2

Warna latar dan label kategori Partikel Halus mengikuti estimasi NowCast yang dihitung dari konsentrasi model CAMS. Angka utama tetap PM2.5 per jam asli, dengan label eksplisit; kategori memakai dasar waktu berbeda. Keterangan Kategori berdasarkan estimasi NowCast selalu terlihat. Ini bukan hasil sensor atau pelaporan resmi AirNow. Kartu AQI, kartu desa, dan seluruh grafik tidak diubah.

Metode memakai hingga 12 jam sebelum dan termasuk jam sumber yang ditampilkan. Minimal dua dari tiga jam terakhir harus valid. Bobot adalah minimum/maksimum konsentrasi, dibatasi minimum 0,5; semua nol memakai bobot 1. Nilai yang hilang tidak diisi dan usia jam sebenarnya dipertahankan dalam eksponen bobot. Konsentrasi hasil dipotong ke satu desimal sebelum kategori EPA 2024 diterapkan: batas atas 9,0; 35,4; 55,4; 125,4; 225,4 µg/m³. Di atasnya termasuk Berbahaya. Jika data tidak cukup atau gagal dimuat, kategori belum tersedia dengan warna netral. Data sumber tersimpan tidak diubah.

Referensi: [EPA Technical Assistance Document, Mei 2026, bagian IV](https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf), [tabel ambang EPA](https://aqs.epa.gov/aqsweb/documents/codetables/aqi_breakpoints.html).

Validasi: 67 pengujian otomatis lulus, termasuk batas kategori, perubahan konsentrasi, jam hilang, konversi waktu, batas 12 jam, data masa depan dan nilai sumber tetap. Pengujian browser mencakup keenam warna, kondisi data kosong, angka per jam dan isi grafik tidak berubah ketika kategori diperbarui, serta tata letak 1440/390/360 piksel.
