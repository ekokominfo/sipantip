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

Sumber titik panas tetap SiPongi Kementerian Kehutanan. Sejak 25 Oktober 2026 kolektor memakai endpoint publik yang digunakan peta resmi SiPongi: https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot . Parameter provinsi 13 adalah ID internal SiPongi untuk Kalimantan Tengah, bukan kode BPS 62. Cakupan 48 jam mencakup NASA-SNPP, NASA-NOAA20, dan NASA-MODIS dengan semua confidence.

Admin dashboard v2: default 7 days, charts with accessible single tooltips, paginated daily table (7 rows), and color-coded metric cards. supabase/report-v2.sql extends the existing admin-only report with new/returning browser counts and prior-period totals. Comparison remains unavailable until the prior period has sufficient recorded history; the current day is incomplete. New means first_seen in the selected period, returning means first_seen before it. Frontend hotspot labels distinguish retrieval time from the latest detection time; SiPongi does not supply a feed generation timestamp.

## Version 2.0

Azure frontend theme and admin palette, selected 1C pin-and-flame logo, favicon, and visible version footer. Previous production code is preserved at Git tag v1.0 (5baceec63ea3d009a307277d4c110e495a3cef8c); design work is retained on branch desain-biru. Restore v1.0 by reverting the v2 change through a new commit and publishing main. Never erase the shared commit history to roll back.

## Shared environmental data

The public dashboard reads a manifest and immutable JSON objects from Supabase Storage bucket sipantip-environment. Automatic page loads use only the shared cache. An explicit click on Refresh data contacts the public hotspot and Open-Meteo endpoints directly from the visitor browser, with a one-minute per-tab cooldown. Valid manual results remain in that tab; they do not write to the shared cache. OSM base-map tiles and static font/library assets are still loaded from their providers. Boundaries stay bundled locally. Visitor tracking remains in Supabase and is not copied into public cache files.

Supabase pg_cron runs at minutes 17 and 47 each hour. Hotspots refresh every 30 minutes; air and weather refresh hourly. The collector recomputes yesterday and elapsed today from the full 48-hour SiPongi query and retains earlier daily snapshots without inventing missing days. Closed months are historical and keep their original timestamps. The air collector performs approximately 100 location lookups per hourly cycle (reference plus 99 villages), rather than per visitor. GitHub workflow_dispatch remains an emergency snapshot tool; its automatic schedule is removed.

Invalid responses and HTTP 429/5xx never overwrite a valid payload. Error type, last attempt, last successful collection, and source timestamp are recorded separately. On 429, remaining calls to the same provider stop for the cycle with a cooldown. Immutable object paths prevent mixing manifest versions. Unreferenced cache objects remain for 48 hours before cleanup; Git history remains available. No cached observation is replaced with zero or labeled with a new source time after a failure.

For manual collection: node scripts/refresh-data.cjs --output <cache-directory>. The --force flag bypasses normal collection intervals but does not bypass an active quota cooldown. Test offline/quota behavior using node --test tests/*.test.cjs. Automatic refresh rereads the shared cache (one manifest request per minute at most). The Refresh data button explicitly collects the latest public source feeds, archives, air, weather and village forecasts. Source failures retain the latest valid payload and show a visible warning; HTTP 429 stops further requests to that provider in the manual cycle. Hotspot retrieval time is explicitly labeled and latest detection retains its actual UTC instant.

## Perkiraan hujan lokal

Versi 3 memakai desain versi 2 pada index.html sebagai halaman utama tunggal. v3.html mengarahkan ke index.html dengan mempertahankan query dan bagian halaman. Grafik menampilkan 24 jam terakhir: titik panas berupa garis utuh pada sumbu kiri, hujan model berupa garis titik-titik pada sumbu kanan. Ringkasan prakiraan tetap tersedia di kartu cuaca dan desa. Waktu pembaruan dikumpulkan di Status data & sumber pembaruan. Area abu-abu menandai jam deteksi yang belum tercakup feed. Browser lokal membaca dist/cache; jalankan node scripts/refresh-data.cjs --output dist/cache untuk memperbarui data tersimpan, lalu node preview.cjs dist. Browser hosting membaca cache publik.

## Collection reliability and public layout (3.5)

The legacy Palangkaraya proxy timed out from GitHub and Supabase. The official SiPongi map endpoint succeeded from Supabase Tokyo; a full collection on 25 October 2026 at 06:15 WIB published all 13 retained/current resource groups without errors. The frontend now reads Supabase Storage. A server-only Vault secret protects the Edge Function; anonymous collection requests return 401. Collection state is private with RLS and service-role-only RPCs. Visitor recording and admin reports remain active; public visitor totals stay hidden.

Weather validation compares parsed instants, accepts valid seconds, and rejects future observations. Cards use compact responsive columns. Daily chart padding balances the visible left/right whitespace.

See supabase/ENVIRONMENT-BACKEND.md for deployment, verification and rollback. Regenerate portable modules and the dashboard bundle after collector changes.
