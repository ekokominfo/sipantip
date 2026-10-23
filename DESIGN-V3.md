# SIPANTIP — versi 1.5 (desain pembanding)

Buka `/v3.html` untuk desain versi 1.5 dan `/index.html` untuk versi 2. Nama berkas eksplorasi `v3.html` dipertahankan agar tautan pratinjau yang ada tetap berfungsi. Tautan **Lihat V2** tersedia di header. Tidak ada perubahan pada entry utama, versi rilis utama, konfigurasi hosting, atau alur data.

Arah desain memakai skill UI/UX Pro Max, dengan hasil pencarian `operational dashboard`: Data-Dense Dashboard. Rekomendasi landing page Enterprise Gateway dari pencarian awal tidak diterapkan karena tidak sesuai dashboard publik.

- Sidebar desktop dan navigasi horizontal ponsel, dengan indikator bagian aktif.
- Palet putih/abu dengan aksen biru merek, merah untuk deteksi, serta warna pembeda metrik.
- Kartu metrik lebih tegas, ikon SVG, teks sekunder lebih terbaca, fokus keyboard, dan dukungan reduced motion.
- Data, filter, grafik, sumber, dan penjelasan keterbatasan tetap memakai aplikasi yang sama.

Jalankan `node preview.cjs .`, lalu buka `http://127.0.0.1:8765/v3.html`.
Untuk menyusun ulang HTML V3 setelah perubahan sumber: `node create-v3.cjs`. Perintah ini juga menyinkronkan tiga berkas V3 ke `dist/`.

Desain ini disimpan pada branch `codex/desain-v1.5` sebagai pembanding. Tidak digabung ke `main`. GitHub Pages utama tetap memakai branch `main`; mengunggah branch pembanding tidak menerbitkan desain ini ke situs utama.
