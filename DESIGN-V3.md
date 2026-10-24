# SIPANTIP — versi 3.0

Versi 3 menggunakan desain biru versi 2 sebagai dasar dan seluruh fitur terbaru pada index.html. Tidak menggunakan sidebar atau tata letak desain pembanding versi 1.5. Alamat v3.html mengarah ke index.html sambil mempertahankan query dan bagian halaman.

- Enam kartu lingkungan, prakiraan hujan dan estimasi jarak pandang per desa, serta grafik hujan dan titik panas 24 jam.
- Pembaruan umum tiga baris di bawah Refresh data; rincian waktu sumber berada pada Status data.
- Data lingkungan dibaca dari cache bersama; collector terjadwal menjaga salinan valid terakhir saat sumber gagal dan mencoba ulang kegagalan koneksi sementara.
- Sumber frontend di root dan salinan dist disinkronkan. GitHub Pages menerbitkan main dari root.

Cadangan versi 2 sebelum rilis: branch codex/backup-v2-2026-10-24, commit bc4565c82262f6d11a518a13b5ac6e55658caa50. Tag v2.0 yang sudah ada tetap dipertahankan.

Jalankan node scripts/refresh-data.cjs --output dist/cache untuk mengisi cache lokal, lalu node preview.cjs dist. Uji dengan node --test tests/*.test.cjs.
