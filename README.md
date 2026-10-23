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

## SIPANTIP dan grafik udara
Nama antarmuka: SIPANTIP — Sistem Informasi Pantau Titik Panas. Grafik udara menggabungkan PM 2.5 (biru, µg/m³, sumbu kiri) dan US AQI (ungu putus-putus, sumbu kanan), memakai timestamp yang sama dan mempertahankan celah data hilang.

Atribusi hulu SiPongi diverifikasi dari bagian Sumber data halaman referensi pada 23 Oktober 2026; nama satelit pada feed cocok: NASA-SNPP, NASA-NOAA20, NASA-MODIS. Jalur pengambilan data aplikasi tetap feed perantara dan arsip publik appscript.palangkaraya.go.id, bukan koneksi langsung ke API SiPongi. Label publik menampilkan sumber hulu sesuai permintaan.

Admin dashboard v2: default 7 days, charts with accessible single tooltips, paginated daily table (7 rows), and color-coded metric cards. supabase/report-v2.sql extends the existing admin-only report with new/returning browser counts and prior-period totals. Comparison remains unavailable until the prior period has sufficient recorded history; the current day is incomplete. New means first_seen in the selected period, returning means first_seen before it. Frontend hotspot update time uses the oldest available source generation timestamp, not the current browser clock.

## Version 2.0

Azure frontend theme and admin palette, selected 1C pin-and-flame logo, favicon, and visible version footer. Previous production code is preserved at Git tag v1.0 (5baceec63ea3d009a307277d4c110e495a3cef8c); design work is retained on branch desain-biru. Restore v1.0 by reverting the v2 change through a new commit and publishing main. Never erase the shared commit history to roll back.

## Shared environmental data

The public dashboard reads a manifest and immutable JSON objects from the data-cache branch via raw.githubusercontent.com. It never calls the hotspot, Open-Meteo weather or air-quality endpoints from a visitor browser. OSM base-map tiles and static font/library assets are still loaded from their providers. Boundaries stay bundled locally. Visitor tracking remains in Supabase and is not copied into public cache files.

The refresh-data workflow runs at minutes 17 and 47 UTC each hour (GitHub schedules may be delayed or disabled after repository inactivity). Hotspot feeds refresh every 30 minutes. Air and weather refresh hourly; the current archive month refreshes hourly, older archive months daily. A multi-coordinate HTTP request is still counted by the provider's usage policy; batching is not a rate-limit bypass. The air collector performs approximately 100 location lookups per hourly cycle (reference plus 99 villages), rather than per visitor.

Invalid responses and HTTP 429/5xx never overwrite a valid payload. Error type, last attempt, last successful collection, and source timestamp are recorded separately. On 429, remaining calls to the same provider stop for the cycle with a cooldown. Immutable object paths prevent mixing manifest versions. Unreferenced cache objects remain for 48 hours before cleanup; Git history remains available. No cached observation is replaced with zero or labeled with a new source time after a failure.

For manual collection: node scripts/refresh-data.cjs --output <cache-directory>. The --force flag bypasses normal collection intervals but does not bypass an active quota cooldown. Test offline/quota behavior using node --test tests/*.test.cjs. The frontend refresh control only rereads the shared cache (one manifest request per minute at most), and never triggers upstream collection.
