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
