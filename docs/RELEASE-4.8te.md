# SiPantip 4.8te

Tanggal: 26 Oktober 2026 (WIB).

## Sumber titik panas

NOAA-21 dikeluarkan dari kolektor otomatis Supabase dan tombol Refresh manual. Kembali memakai tiga CSV resmi FIRMS Asia Tenggara 48 jam: MODIS Terra/Aqua, VIIRS Suomi-NPP dan VIIRS NOAA-20. Keterangan sumber titik panas dan laporan harian menyebut empat satelit tersebut; SiPongi tetap sebagai referensi tambahan dan sumber arsip lama.

Validasi waktu, kelas keyakinan, batas administrasi, pencegahan duplikasi identik dan pemulihan koneksi melalui mirror resmi NASA tetap digunakan. Semua tiga file harus valid sebelum mengganti data. Kegagalan pengambilan mempertahankan cache valid sebelumnya dan menampilkan pesan kegagalan, bukan membuat angka nol.

Kolektor Supabase diterbitkan ulang dan dipicu satu kali untuk memperbarui feed aktif serta menghitung ulang rekap kemarin/hari ini tanpa NOAA-21. Verifikasi publik pada 26 Oktober pukul 04.45 WIB: penarikan mulai 04.44.23 WIB, seluruh tingkat tanpa error, nol rekaman NASA-NOAA21 di seluruh wilayah feed aktif. Pulpis memiliki 109 deteksi dalam 24 jam pada saat pemeriksaan. Rekap 25 Oktober 159 dan 26 Oktober 107 cocok dengan jumlah tanggal kalender pada feed; jumlah berubah mengikuti waktu dan bukan jumlah kebakaran unik. Arsip hari lebih lama tetap historis dan tidak dihapus.

## Kartu dan grafik hujan

- Kartu Peluang Hujan ditampilkan kembali; angka merupakan peluang tertinggi pada salah satu jam dalam 24 jam ke depan.
- Grafik peluang hujan per jam ditampilkan dalam persen, skala 0–100%, dengan tooltip sentuh/keyboard dan penanda data hilang. Jumlah hujan dalam mm tidak ditampilkan.
- Kartu dan grafik memakai titik permintaan Kelurahan Pulang Pisau yang sama dengan acuan jarak pandang: key kahayanhilir|pulangpisau, koordinat -2.751345, 114.2608442894562. Data dari forecast-villages (Open-Meteo); koordinat permintaan divalidasi dan tidak diganti dengan titik acuan lama jika lokasi ini tidak tersedia. Hasil tetap prakiraan grid model, bukan observasi langsung.
- Kartu dan grafik memakai periode masa depan yang sama. Nilai puncak grafik harus cocok dengan kartu; bukan dibandingkan dengan hujan jam yang sudah lewat.
- Grafik titik panas dan peluang hujan kini digabung, dengan 24 jam terakhir dan 24 jam ke depan pada satu sumbu waktu. Titik panas tidak diprakirakan. Grafik gabungan PM2.5/AQI tidak diubah.
- Prakiraan desa dan unsur lain yang sebelumnya disembunyikan di kartu desa tetap tersembunyi. Demo kunjungan pertama dari 4.7te tetap tersedia.

## Validasi

73 pengujian otomatis lulus: tiga sumber aktif, penolakan file NOAA-21, parser/arsip, mirror dan kuota, penarikan manual/terjadwal, serta grafik hujan persen, periode, titik acuan, nilai hilang dan kecocokan puncak kartu. Berkas root/dist disinkronkan dan kolektor Edge dihasilkan ulang dari sumber yang diuji.

## Pemulihan

Commit sebelum perubahan: ed85ce3 (4.7te). Salinan kode fungsi Supabase sebelumnya disimpan dalam artifacts/environment-refresh-before-48te.ts di workspace induk sebelum penerbitan. Untuk memulihkan, buat commit baru yang mengembalikan berkas rilis terkait, hasilkan ulang kolektor dengan scripts/build-edge-collector.cjs, terbitkan fungsi Supabase, jalankan kolektor dan publikasikan main. Rollback frontend saja tidak mengubah isi cache backend. Jadwal, autentikasi, Vault, kebijakan akses dan database tidak diubah.

Backup historis tetap tercatat di [BACKUPS.md](BACKUPS.md).

Pengujian browser lokal lulus pada lebar 1440, 390 dan 360 piksel: kartu dan grafik tampil, peluang puncak sesuai, tooltip berfungsi, nilai mm tidak masuk grafik, data hilang tidak menjadi nol, sumber tidak menyebut NOAA-21, dan grafik titik panas/PM2.5/AQI serta pemilihan desa tetap bekerja.

## Revisi grafik gabungan — aset 4.8te.1

Atas permintaan pengguna, grafik titik panas dan peluang hujan digabung menjadi satu panel. Sumbu waktu mencakup 24 jam terakhir dan 24 jam ke depan. Garis merah memakai sumbu kiri deteksi/jam; peluang hujan biru memakai sumbu kanan 0–100%, dengan garis titik-titik untuk periode lalu dan putus-putus untuk prakiraan. Latar biru muda membedakan masa depan. Tidak ada prediksi atau nilai nol buatan untuk titik panas masa depan. Tooltip menyatakan status waktu mendatang dengan jelas. Kartu tetap menunjukkan peluang tertinggi pada 24 jam ke depan yang sama dengan bagian prakiraan grafik. Grafik PM2.5/AQI dan sumber backend tidak berubah. Versi publik tetap 4.8te.

Validasi revisi gabungan: 11 pengujian hujan lulus. Pengujian browser pada 1440/390/360 piksel lulus untuk sumbu waktu, kedua satuan, tooltip, data hilang, puncak kartu yang sama dengan prakiraan, ketiadaan prediksi titik panas, grafik PM2.5/AQI dan pemilihan desa.

## Revisi kartu HP dan pilihan periode — aset 4.8te.2 (tampilan terkini)

- Ringkasan menjadi dua kolom dan tiga baris di HP: titik panas–peluang hujan, kualitas udara–partikel halus, jarak pandang–angin. Tinggi kartu mengikuti isi dengan ruang minimum yang lebih kecil; angka tetap besar, label lebih mudah dibaca dan unit dapat membungkus tanpa meluap.
- Waktu deteksi di HP diringkas menjadi jam WIB dan umur data. Tanggal lengkap tetap ada pada label aksesibel dan tampilan desktop. Peringatan data tetap memakai teks/status yang sama dan bayangan penekanan, pada satu banner di bawah ringkasan.
- Deskripsi tambahan PM2.5/angin dan skala dekoratif tidak ditampilkan pada kartu HP; penjelasan sumber tetap tersedia dalam Status data & sumber pembaruan. Keterangan estimasi jarak pandang -4 km tetap terlihat.
- Grafik berada dalam satu panel dengan tombol native 24 jam terakhir dan 24 jam ke depan. Pilihan aktif menggunakan aria-pressed dan bertahan ketika data/ukuran layar diperbarui.
- Riwayat menampilkan batang merah untuk deteksi/jam (sumbu kiri) dan garis biru peluang hujan model dalam persen (sumbu kanan). Prakiraan menampilkan peluang hujan saja untuk 24 jam ke depan. Tidak ada angka titik panas masa depan yang dibuat.
- Kartu peluang hujan memiliki tombol yang mencakup seluruh kartu dan petunjuk Lihat prakiraan. Klik atau aktivasi keyboard membuka pilihan prakiraan dan menggulir ke panel grafik; gerakan menghormati preferensi reduced motion. Nilai tertinggi grafik prakiraan sama dengan kartu pada periode yang sama.
- Penjelasan grafik dipadatkan, dengan tooltip yang sesuai periode. Data hilang tetap belum tersedia, bukan nol. Grafik PM2.5/AQI, angka sumber, kolektor, sumber aktif dan jadwal tidak berubah. Nomor publik tetap 4.8te.

Validasi: 76 pengujian otomatis lulus. Pemeriksaan browser meliputi susunan 2×3 pada 390/360/320 piksel, waktu ringkas dan label lengkap, kedua periode melalui klik/keyboard, pintasan kartu, tooltip, data hilang dan kecocokan puncak prakiraan. Pada 390 piksel, tinggi ringkasan berkurang sekitar sepertiga dibanding tampilan sebelumnya.

Pemulihan revisi antarmuka ini: kembalikan berkas frontend terkait dari commit 4f04b6e melalui commit baru, sinkronkan root/dist dan publikasikan main. Tidak perlu mengubah backend Supabase.
