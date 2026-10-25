# SiPantip 4.3te

Tanggal: 25 Oktober 2026 (WIB).

## Perubahan

- Angka PM2.5 tetap nilai per jam dari sumber Open-Meteo/CAMS, tanpa penambahan atau pengurangan.
- Warna angka dan badge PM2.5 mengikuti kategori **rerata bergerak 24 jam**, dengan periode tertulis pada badge. Warna ini tidak disalin dari US AQI keseluruhan.
- Grafik PM2.5 dan US AQI dipisahkan, masing-masing satu garis dan satu sumbu vertikal. Zona pastel dan legenda memuat nama kategori serta rentang nilainya.
- Grafik PM2.5 menggambar rerata 24 jam. Tooltip juga memuat nilai PM2.5 per jam aslinya, sehingga perbedaan dengan angka kartu dapat diperiksa.
- Grafik AQI mempertahankan indeks keseluruhan dari sumber, yang dapat dipengaruhi polutan selain PM2.5.
- Data hilang tidak dijadikan nol atau dihubungkan melewati celah. Rerata memerlukan 24 timestamp berurutan dengan nilai lengkap; bagian awal grafik dapat kosong bila riwayat belum cukup.
- Grafik titik panas tetap tampil, kartu/data hujan tetap tersembunyi. Koreksi tampilan jarak pandang −4 km dari 4.2te tetap, dengan nilai asli tersimpan dan hasil tak dapat ditentukan jika sumber ≤4 km.

## Acuan kategori

Ambang PM2.5 rerata 24 jam mengacu pada [EPA AQI Breakpoints, pembaruan 2024](https://aqs.epa.gov/aqsweb/documents/codetables/aqi_breakpoints.html). Konsentrasi ditrunkasi ke satu angka desimal untuk pemilihan kategori:

| Kategori | PM2.5 rerata 24 jam (µg/m³) | US AQI sumber |
|---|---:|---:|
| Baik | 0–9,0 | 0–50 |
| Sedang | 9,1–35,4 | >50–100 |
| Tidak sehat bagi kelompok sensitif | 35,5–55,4 | >100–150 |
| Tidak sehat | 55,5–125,4 | >150–200 |
| Sangat tidak sehat | 125,5–225,4 | >200–300 |
| Berbahaya | ≥225,5 | >300 |

Warna adalah interpretasi estimasi model, bukan laporan pengukuran lapangan, ISPU Indonesia, atau perhitungan NowCast resmi. Tidak dihitung AQI baru dari nilai PM per jam. [Open-Meteo menjelaskan](https://open-meteo.com/en/docs/air-quality-api) bahwa AQI keseluruhan merupakan nilai tertinggi dari beberapa indeks polutan dan dapat melampaui 500.

## Backup dan pemulihan

Backup sebelum rilis: [`versi-4.2te`](https://github.com/ekokominfo/sipantip/tree/versi-4.2te). Semua branch backup/desain historis beserta arsip data mempunyai `BACKUP.md`; daftar lengkap dan commit asli ada di [BACKUPS.md](BACKUPS.md) dan [BACKUP-REGISTRY.json](BACKUP-REGISTRY.json).

Dokumentasi ditambahkan sebagai commit tersendiri. Untuk setiap branch, hasil diff terhadap commit snapshot asli diverifikasi hanya `BACKUP.md`; kode dan data snapshot tidak diubah. Pemulihan frontend tidak otomatis memulihkan database, bucket, Vault, atau jadwal Supabase.

## Validasi

- `node --test tests/*.test.cjs`: 65 pengujian lulus.
- Kasus khusus: PM rendah/AQI tinggi tetap menghasilkan warna PM berdasarkan PM; 24 jam tidak lengkap atau timestamp putus tidak menghasilkan rerata; nilai nol sah; kategori batas EPA dan pemisahan satuan SVG diuji.
- Browser desktop 1440 px serta ponsel 390/360 px: angka sumber tetap, warna angka sama dengan badge, legenda dan tooltip kedua grafik berfungsi, tidak ada luapan horizontal.
- Lapisan data dan backend tetap menggunakan alur cache yang sudah ada; tidak diperlukan deployment kolektor atau perubahan sumber.
