# Pantau Titik Panas

Web publik: https://ekokominfo.github.io/sipantip/

GitHub Pages menerbitkan branch `main` dari root. Berkas situs pada root dan `dist/` harus disinkronkan saat melakukan perubahan.

Dashboard titik panas, kualitas udara, dan cuaca Kabupaten Pulang Pisau. Repositori: `ekokominfo/sipantip`. Nama antarmuka tetap Pantau Pulang Pisau sesuai keputusan pemilik.

## Menjalankan

Website statis tanpa build. Jalankan `node preview.cjs dist`, lalu buka `http://127.0.0.1:8765`. Alternatif: sajikan `dist` dengan server HTTP statis. Internet diperlukan untuk API dan peta.

## Fitur

- Peta dengan batas referensi 99 desa dan 8 kecamatan, fokus awal Kahayan Hilir, layar penuh dan zoom sentuh.
- Per kecamatan/desa, urutan jumlah terbanyak, pemilihan desa, filter periode/keyakinan dan reset.
- Kartu merah muda untuk deteksi; nol dibedakan dari data belum tersedia atau parsial.
- PM 2.5 biru, kategori US AQI model, waktu sumber dan penanda data lama.
- Laporan harian/mingguan/bulanan, tooltip sentuh/keyboard, rekap 13 kabupaten dan 1 kota.
- Tampilan ponsel, penjelasan buka-tutup, indikator memuat dan tombol mencoba kembali.

## Interpretasi data

Feed publik `https://appscript.palangkaraya.go.id/hotspot/api/` disaring menurut atribut kabupaten Pulang Pisau. Default 24 jam berjalan. Satu lokasi bisa terdeteksi berulang; titik panas bukan kebakaran terkonfirmasi. Arsip harian memakai ringkasan sumber dan dapat berbeda dari feed 24 jam. Hari hilang dibedakan dari nol.

Batas BNPB di `dist/villages.geojson` dan `dist/districts.geojson` merupakan referensi, bukan penetapan hukum batas. Data udara Open-Meteo/CAMS adalah model pada titik acuan desa, bukan sensor atau rata-rata wilayah. Kategori memakai US AQI model beberapa polutan, bukan konversi langsung PM 2.5 satu jam. Nilai desa dapat sama karena resolusi model.

Awan/hujan/angin berasal dari model Open-Meteo; area grid bukan citra satelit. Penanda umur data: feed titik panas lebih dari 24 jam, udara/cuaca lebih dari 3 jam. Ambang ini bukan klasifikasi kualitas lingkungan. Waktu pemeriksaan menunjukkan saat aplikasi mengambil data; waktu sumber menunjukkan periode data sebenarnya. Tampilan menggunakan WIB.

## Berkas dan pemeriksaan

`dist/` berisi situs siap terbit. Audit dan halaman bukti menyimpan penelitian awal. `.openai/hosting.json` menghubungkan sumber ke Sites dan bukan kredensial. Jangan simpan token dalam repo.

Jalankan `node --test tests/dashboard.test.cjs`. Pemeriksaan antarmuka meliputi pilihan desa, hapus pilihan, filter/reset, tooltip klik, warna, dan tata letak 390 piksel. Gestur dua jari fisik perlu pemeriksaan perangkat sentuh.

## Statistik pengunjung

Halaman admin: https://ekokominfo.github.io/sipantip/admin.html. Login Supabase memakai email/password. Hak baca laporan diperiksa oleh fungsi database terhadap tabel privat admins, bukan hanya menyembunyikan halaman. Token akses hanya berada dalam memori tab; muat ulang meminta login kembali. Tidak ada service-role key atau password di kode. analytics-config.js hanya berisi publishable key.

Migrasi ada di supabase/analytics.sql; pemeriksaan transaksi ada di supabase/analytics-test.sql. RLS aktif di seluruh tabel privat, tanpa akses tabel langsung untuk anon/authenticated. API publik hanya menerima metadata yang dibatasi dan mengeluarkan total agregat. Tambahkan UID admin melalui SQL Editor hanya setelah memverifikasi pemilik akun.

Pengunjung unik adalah perkiraan ID browser acak, tersimpan lokal. Sesi baru setelah jeda 30 menit atau pergantian hari WIB. Request berulang dalam 10 detik tidak menambah pageview. Maksimal 200 pageview per sesi dan 48 sesi per ID per 24 jam. Tidak memakai fingerprint/IP/GPS. Browser dengan DNT/GPC tidak dicatat. Referrer hanya hostname tanpa path/query. Fitur dihitung satu kali per sesi saat masuk area pandang. Pelacakan berjalan hanya di hostname produksi, bukan localhost.

Batasan: counter publik tidak dapat membuktikan pengunjung adalah manusia; penyerang yang mengganti ID masih dapat menaikkan hitungan. Jika trafik tidak wajar muncul, tambahkan gateway dengan rate limit server/anti-bot. Tidak ada data kunjungan sebelum fitur aktif; tanggal sebelumnya ditampilkan belum tercatat. Distribusi perangkat/browser/referrer berdasarkan sesi, bukan pengunjung unik. Pantau kuota Free Supabase dan atur retensi bila trafik bertambah.
