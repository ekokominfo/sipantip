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

Admin versi **3.5**: lihat [ADMIN-V3.md](ADMIN-V3.md) untuk backup v2,
migrasi `supabase/report-v3.sql`, arti metrik, pelacakan fitur peta, validasi,
dan pemulihan. Versi halaman publik tetap 4.0. Deploy SQL sebelum file `dist/`.

Halaman admin: https://ekokominfo.github.io/sipantip/admin.html. Login Supabase memakai email/password. Hak baca laporan diperiksa oleh fungsi database terhadap tabel privat admins, bukan hanya menyembunyikan halaman. Token akses hanya berada dalam memori tab; muat ulang meminta login kembali. Tidak ada service-role key atau password di kode. analytics-config.js hanya berisi publishable key.

Migrasi ada di supabase/analytics.sql; pemeriksaan transaksi ada di supabase/analytics-test.sql. RLS aktif di seluruh tabel privat, tanpa akses tabel langsung untuk anon/authenticated. API publik hanya menerima metadata yang dibatasi dan mengeluarkan total agregat. Tambahkan UID admin melalui SQL Editor hanya setelah memverifikasi pemilik akun.

Pengunjung unik adalah perkiraan ID browser acak, tersimpan lokal. Sesi baru setelah jeda 30 menit atau pergantian hari WIB. Request berulang dalam 10 detik tidak menambah pageview. Maksimal 200 pageview per sesi dan 48 sesi per ID per 24 jam. Tidak memakai fingerprint/IP/GPS. Browser dengan DNT/GPC tidak dicatat. Referrer hanya hostname tanpa path/query. Fitur dihitung satu kali per sesi saat masuk area pandang. Pelacakan berjalan hanya di hostname produksi, bukan localhost.

Batasan: counter publik tidak dapat membuktikan pengunjung adalah manusia; penyerang yang mengganti ID masih dapat menaikkan hitungan. Jika trafik tidak wajar muncul, tambahkan gateway dengan rate limit server/anti-bot. Tidak ada data kunjungan sebelum fitur aktif; tanggal sebelumnya ditampilkan belum tercatat. Distribusi perangkat/browser/referrer berdasarkan sesi, bukan pengunjung unik. Pantau kuota Free Supabase dan atur retensi bila trafik bertambah.

## SIPANTIP dan grafik udara
Nama antarmuka: SIPANTIP — Sistem Informasi Pantau Titik Panas. Grafik udara menggabungkan PM 2.5 (biru, µg/m³, sumbu kiri) dan US AQI (ungu putus-putus, sumbu kanan), memakai timestamp yang sama dan mempertahankan celah data hilang.

Sumber pengambilan titik panas aktif beralih ke NASA FIRMS sejak revisi 25 Oktober 2026. Tiga CSV resmi regional Asia Tenggara 48 jam diunduh dari firms2.modaps.eosdis.nasa.gov untuk MODIS Terra/Aqua, VIIRS Suomi-NPP, dan VIIRS NOAA-20. SiPongi tetap menjadi rujukan tambahan dan sumber arsip lama, tanpa dicampur ke feed aktif.

Admin dashboard v2: default 7 days, charts with accessible single tooltips, paginated daily table (7 rows), and color-coded metric cards. supabase/report-v2.sql extends the existing admin-only report with new/returning browser counts and prior-period totals. Comparison remains unavailable until the prior period has sufficient recorded history; the current day is incomplete. New means first_seen in the selected period, returning means first_seen before it. Frontend hotspot labels distinguish retrieval time from the latest detection time; SiPongi does not supply a feed generation timestamp.

## Version 2.0

Azure frontend theme and admin palette, selected 1C pin-and-flame logo, favicon, and visible version footer. Previous production code is preserved at Git tag v1.0 (5baceec63ea3d009a307277d4c110e495a3cef8c); design work is retained on branch desain-biru. Restore v1.0 by reverting the v2 change through a new commit and publishing main. Never erase the shared commit history to roll back.

## Shared environmental data

The public dashboard reads a manifest and immutable JSON objects from Supabase Storage bucket sipantip-environment. Automatic page loads use only the shared cache. An explicit click on Refresh data contacts the public hotspot and Open-Meteo endpoints directly from the visitor browser, with a one-minute per-tab cooldown. Valid manual results remain in that tab; they do not write to the shared cache. OSM base-map tiles and static font/library assets are still loaded from their providers. Boundaries stay bundled locally. Visitor tracking remains in Supabase and is not copied into public cache files.

Supabase pg_cron runs at minutes 17 and 47 each hour. Hotspots refresh every 30 minutes; air and weather refresh hourly. The collector recomputes yesterday and elapsed today from the full 48-hour FIRMS query and retains earlier daily snapshots without inventing missing days. Closed months are historical and keep their original timestamps. The air collector performs approximately 100 location lookups per hourly cycle (reference plus 99 villages), rather than per visitor. GitHub workflow_dispatch remains an emergency snapshot tool; its automatic schedule is removed.

Invalid responses and HTTP 429/5xx never overwrite a valid payload. Error type, last attempt, last successful collection, and source timestamp are recorded separately. On 429, remaining calls to the same provider stop for the cycle with a cooldown. Immutable object paths prevent mixing manifest versions. Unreferenced cache objects remain for 48 hours before cleanup; Git history remains available. No cached observation is replaced with zero or labeled with a new source time after a failure.

For manual collection: node scripts/refresh-data.cjs --output <cache-directory>. The --force flag bypasses normal collection intervals but does not bypass an active quota cooldown. Test offline/quota behavior using node --test tests/*.test.cjs. Automatic refresh rereads the shared cache (one manifest request per minute at most). The Refresh data button explicitly collects the latest public source feeds, archives, air, weather and village forecasts. Source failures retain the latest valid payload and show a visible warning; HTTP 429 stops further requests to that provider in the manual cycle. Hotspot retrieval time is explicitly labeled and latest detection retains its actual UTC instant. All three FIRMS CSVs must validate before feeds are replaced. Header-only fresh files mean valid zero; stale/malformed files preserve previous data.

## Perkiraan hujan lokal

Versi 3 memakai desain versi 2 pada index.html sebagai halaman utama tunggal. v3.html mengarahkan ke index.html dengan mempertahankan query dan bagian halaman. Grafik menampilkan 24 jam terakhir: titik panas berupa garis utuh pada sumbu kiri, peluang hujan model (%) berupa garis titik-titik pada sumbu kanan. Ringkasan prakiraan tetap tersedia di kartu cuaca dan desa. Waktu pembaruan dikumpulkan di Status data & sumber pembaruan. Area abu-abu menandai jam deteksi yang belum tercakup feed. Browser lokal membaca dist/cache; jalankan node scripts/refresh-data.cjs --output dist/cache untuk memperbarui data tersimpan, lalu node preview.cjs dist. Browser hosting membaca cache publik.

## Collection reliability and public layout (3.5)

The legacy Palangkaraya proxy timed out from GitHub and Supabase. The official SiPongi map endpoint succeeded from Supabase Tokyo; a full collection on 25 October 2026 at 06:15 WIB published all 13 retained/current resource groups without errors. The frontend now reads Supabase Storage. A server-only Vault secret protects the Edge Function; anonymous collection requests return 401. Collection state is private with RLS and service-role-only RPCs. Visitor recording and admin reports remain active; public visitor totals stay hidden.

Weather validation compares parsed instants, accepts valid seconds, and rejects future observations. Cards use compact responsive columns. Daily chart padding balances the visible left/right whitespace.

See supabase/ENVIRONMENT-BACKEND.md for deployment, verification and rollback. Regenerate portable modules and the dashboard bundle after collector changes.

## Village cards, release 3.5

Village cards hide both the Open-Meteo rain summaries and BMKG condition descriptions. Existing BMKG backend snapshots remain available. The combined 24-hour chart shows precipitation probability (0–100%) against observed hotspot counts; tooltips do not show rain amounts in mm. The Pulang Pisau regency highlight is red again.

## FIRMS source and administrative joins

FIRMS does not supply village/regency names. The app intersects coordinates with BNPB reference polygons (14 Kalimantan Tengah regencies and existing Pulang Pisau districts/villages). Unmatched villages remain Tidak diketahui; they are never assigned to the nearest village. See firms-geography-source.json for the regency query. Duplicate suppression uses sensor, satellite, coordinates and acquisition time, retaining separate overpasses. FIRMS acquisition dates/times are UTC and displayed in WIB. VIIRS confidence follows low/nominal/high; MODIS confidence uses low <30, medium 30–<80, high >=80. Only detections within the last 48 hours are retained. Each CSV Last-Modified must be within six hours, and all three feeds must succeed.

Live refresh uses the same FIRMS mirror and shared validation as the backend. Current/yesterday daily rows are now labeled NASA FIRMS; older SiPongi archive snapshots retain their data and timestamps. The source change may alter totals. Reference: https://firms2.modaps.eosdis.nasa.gov/content/active_fire/ .

FIRMS deployment verification on 25 October 2026: the shared cache completed successfully at 12:48 WIB with no resource errors; browser Refresh fetched all three official CSVs with CORS and no SiPongi request. All 48 unit tests passed. Browser regression checks used a deliberate 80% probability / 1.5 mm fixture to prove that the plotted blue series uses probability, with no mm text in tooltips. Desktop and 390/360-pixel layouts were checked.


## Release 4.0: nearby locations and satellite clouds

The stable 3.5c release is retained at `codex/backup-versi-3.5c`; earlier backups are `versi-3.5` (SiPongi collector) and `versi-3.5b` (rain summaries still visible).

`nearby.js` requests a one-time device position only after clicking Lokasi saya. Coordinates stay in browser memory and are cleared by Hapus lokasi or page reload. Opening a route explicitly sends origin/destination to Google Maps. Results use haversine straight-line distance, not driving distance. Hotspots come only from High detections in the selected period across Pulang Pisau; village, search and confidence filters do not restrict the nearby search. Repeated coordinates are suppressed. Facilities are restricted to 12 puskesmas and RSUD Pulang Pisau in `health-facilities.json`. Each facility records its official source; map reference coordinates come from embedded maps on Dinkes/RSUD sites. Pangkoh's exact Google Maps marker coordinates were supplied by the maintainer. Facility navigation uses its name and regency so the map provider can resolve the entrance/place instead of navigating blindly to a map viewport center. Other clinics and pustu are excluded.

`cloud-satellite.js` reads NASA GIBS DescribeDomains for Himawari_AHI_Band13_Clean_Infrared. Only published timestamps from the last six hours are eligible. Up to seven images at 20-minute intervals span the latest available two hours; gaps are not fabricated. WMS images use EPSG:3857 so their raster aligns with Leaflet. NASA's DescribeDomains CGI rejects encoded ISO separators in TIME, so that parameter keeps literal colons and slash. The cloud chip replaces the previous model cloud rectangles, while wind and rain overlays retain their model sources. Attribution and actual image times remain visible; infrared clouds are not smoke. Animation pauses when hidden/offscreen or during map motion, respects reduced-motion preferences by default, and offers pause, timeline and transparency controls. Failed updates preserve available frames and expose retry; disabling the layer aborts loading and releases images. No backend secrets or new collector deployment are needed.

Validation: `node --test tests/*.test.cjs`; browser QA covers permitted and denied geolocation, High-only search, facility ranking, route targets, real NASA image loading and 1440/390/360-pixel layouts. Rain card/chart remain hidden from 3.5c.

Village card revision (asset 4.0.1): detection totals use 24px type and AQI numbers 26px. The hourly hotspot chart is visible again with a single red series and no rain axis, legend, values or tooltips. The rain summary card remains hidden. Validation: all 58 tests and desktop/390/360px browser checks passed.

## Release 4.1te

Backup: versi-4.0 preserves the release before these changes. The header visibility now selects forecast-villages entry kahayanhilir|pulangpisau, validated against requested reference (-2.751345, 114.2608442894562), instead of weather-main. This uses the existing scheduled/manual village requests and does not change the air-main or wind references. The returned Open-Meteo grid was verified at (-2.7768013, 114.289154), whose center lies in Anjir Pulang Pisau in the BNPB reference polygons; it is a model grid for the requested location, not an observation at the kelurahan. The UI explicitly labels the value as an estimate with a local -3 km adjustment. Correction is display-only; cached raw values remain unchanged. Raw values <=3000 m produce an undetermined result, never an invented zero. Health-source names remain visible without clickable Dinkes/RSUD links. Validation: 62 tests passed; browser QA checked exact village selection, returned grid, raw-value retention, threshold cases, unchanged PM/AQI, removed links, and desktop/390/360px layouts.
