# SiPantip 4.6te

Tanggal: 25 Oktober 2026 (WIB).

## Titik panas dan sumber

- Tambahkan NOAA-21 VIIRS Collection 2 melalui CSV resmi Asia Tenggara 48 jam J2_VIIRS_C2. Empat CSV sekarang mencakup lima satelit: Terra, Aqua, Suomi-NPP, NOAA-20 dan NOAA-21.
- Pengambilan terjadwal Supabase dan Refresh manual memakai parser/validasi yang sama. Seluruh empat file harus tersedia, valid dan segar sebelum data diganti. Kegagalan satu file mempertahankan data valid sebelumnya.
- NOAA-21 memakai keyakinan VIIRS low/nominal/high. Identitasnya NASA-NOAA21; rekaman lintasan/satelit berbeda tetap dipertahankan. Ini jumlah deteksi, bukan jumlah kebakaran unik.
- Keterangan sumber titik panas dan laporan harian menyebut NOAA-21. SiPongi tetap menjadi referensi tambahan dan sumber arsip lama, bukan dicampur ke feed aktif.
- Rekap kemarin dan hari ini dihitung ulang dari feed FIRMS; arsip hari lebih lama tetap. Penambahan satelit dapat menambah total deteksi, termasuk pada grafik yang tampil.

## Keterangan kartu titik panas

- Lebih dari enam jam tanpa deteksi baru: **Belum ada deteksi titik panas terbaru dari satelit.**
- Kegagalan penarikan yang tercatat pada status sumber: **Penarikan data dari sumber sedang mengalami masalah.** Pesan ini juga muncul jika deteksi sebelumnya masih baru.
- Gangguan koneksi ke cache: **Koneksi ke data titik panas terganggu; menampilkan data terakhir.**
- Bayangan penekanan tetap dipertahankan. Waktu kartu tetap waktu deteksi terbaru Pulpis, bukan waktu penarikan. Tidak ada deteksi terbaru bukan bukti sumber gagal atau tidak ada kebakaran.

## Tampilan yang dipertahankan

Nomor publik menjadi 4.6te. Grafik tidak mendapat revisi tampilan atau perhitungan; angka grafik titik panas mengikuti sumber yang bertambah. PM2.5/AQI, NowCast kartu, koreksi jarak pandang, kartu desa, fitur peta dan data hujan tersembunyi tetap.

## Validasi dan penerbitan

72 pengujian otomatis lulus, meliputi NOAA-21, validasi identitas/keyakinan, duplikasi, arsip, kegagalan file keempat, pemulihan timeout melalui mirror resmi, penarikan manual/terjadwal, dan perbedaan status deteksi lama dengan penarikan gagal. Modul Edge dihasilkan ulang dari sumber yang diuji.

Kolektor Supabase diperbarui melalui editor fungsi environment-refresh dengan konfigurasi autentikasi dan jadwal yang sama. Penarikan pertama mengalami timeout; pembacaan sekarang mencoba server resmi firms.modaps.eosdis.nasa.gov jika firms2 mengalami kegagalan koneksi atau HTTP 5xx. HTTP 429/4xx tidak memicu percobaan ke mirror dan data tidak valid tetap ditolak. Salinan kode sebelumnya disimpan sebelum penerbitan. Frontend root dan dist disinkronkan.

## Pemulihan

Commit sebelum rilis: 2929f4a. Untuk mengembalikan seluruh perilaku, pulihkan frontend dan sumber kolektor dari commit itu melalui commit baru, hasilkan ulang bundle dengan scripts/build-edge-collector.cjs, lalu terbitkan kembali fungsi Supabase dan main. Rollback frontend saja tidak menghapus NOAA-21 yang sudah masuk cache. Jadwal, Vault dan database tidak diubah oleh rilis ini. Backup historis tetap tercatat di [BACKUPS.md](BACKUPS.md).

Verifikasi produksi Supabase: penarikan mulai 25 Oktober 2026 pukul 19.54.53 WIB mengembalikan HTTP 200, ok:true dan errors kosong. Cache publik memuat NOAA-21 Pulpis: 10 deteksi Tinggi dan 221 Sedang dalam 48 jam pada waktu pemeriksaan; 46 deteksi tanggal 25 Oktober semuanya Sedang. Jumlah bergerak mengikuti waktu dan bukan jumlah kebakaran unik. Waktu deteksi terbaru Pulpis tetap 02.45 WIB, sehingga penambahan NOAA-21 tidak membuat timestamp palsu lebih baru.
