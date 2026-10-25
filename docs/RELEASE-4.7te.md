# SiPantip 4.7te

Tanggal: 25 Oktober 2026 (WIB).

Pop-up pengenalan muncul dua detik setelah halaman siap pada kunjungan pertama di browser. Penanda `sipantip.demo.seen` disimpan saat pop-up tampil dan tetap digunakan pada rilis berikutnya. Browser yang pernah melihat demo tidak mendapat pop-up otomatis lagi; tombol Lihat Demo tetap tersedia.

Video final berdurasi 2:55, H.264/AAC, dengan narasi dan teks Indonesia, disalin dari `artifacts/video-sipantip/SiPantip-Demonstrasi-1080p.mp4`. Video adalah rekaman versi 4.6te pada 25 Oktober 2026, bukan data langsung. Penjelasan ini ditampilkan di pop-up. Berkas video tidak diminta sebelum Putar Demo diklik. Pemutaran memakai kontrol browser, playsinline, dan berhenti ketika dialog ditutup.

Dialog native mendukung Escape, fokus keyboard di dalam dialog, tombol tutup dan Lewati, pemulihan fokus, serta konten yang dapat digulir pada layar kecil/landscape. Tidak ada suara otomatis. Jika pemuatan gagal, tampil pesan dan tombol mencoba lagi.

Penanda berlaku per browser dan origin. Incognito, penghapusan data browser, dan perangkat lain dianggap kunjungan baru. Jika localStorage tidak tersedia, gunakan sessionStorage; jika keduanya diblokir, penanda hanya berlaku selama halaman terbuka. Penanda ini terpisah dari analitik pengunjung.

## Backup dan pemulihan

Backup lengkap sebelum perubahan: `backups/sipantip-before-4.7te-20261025-214041.zip` di workspace induk. ZIP terverifikasi memiliki 167 entri, termasuk index 4.6te tanpa pop-up demo. Salinan root dan dist telah disinkronkan. VERSION tetap 3.5 sesuai versi admin; versi publik tercantum 4.7te pada footer dan parameter cache halaman utama.

Untuk pemulihan, ekstrak ZIP ke folder sementara, lalu pulihkan folder sipantip sesuai isi backup. Hapus hanya berkas tambahan rilis ini: demo-video.js, demo-video.css dan assets/demo pada root serta dist. Jangan menimpa backup atau data baru tanpa memeriksanya.

## Validasi

`node qa-release-47te.cjs` memeriksa kunjungan pertama/ulang, tidak mengunduh video sebelum klik, pemutaran video nyata, pause saat ditutup, Escape/pemulihan fokus, penyimpanan diblokir, ukuran 1440/390/360 dan landscape 740 piksel, serta kesamaan root/dist. Pemeriksaan ini mengisolasi API lingkungan, sehingga tidak memvalidasi data langsung atau koneksi produksi. `node --test sipantip/tests/dashboard.test.cjs`: 3 lulus. Screenshot desktop dan HP diperiksa secara visual.

Penerbitan melalui branch main pada GitHub Pages: https://ekokominfo.github.io/sipantip/ . Video dan poster dibundel pada assets/demo di root serta dist.
