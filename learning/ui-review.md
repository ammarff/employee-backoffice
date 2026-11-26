# UI review — 26 November 2026

## Design contract
- Backoffice ringan dengan tema biru Material yang sudah terpasang, permukaan putih, dan latar netral.
- Hierarki: identitas aplikasi → judul halaman → aksi utama → form/tabel/detail.
- Spacing memakai kelipatan 4/8 px; form dan teks memiliki batas lebar.
- Mobile: form/detail satu kolom; tabel menggunakan scroll lokal tanpa menyembunyikan data.
- Pesan error dan kondisi kosong harus menjelaskan keadaan serta langkah berikutnya.
- Tidak menambah library, ilustrasi, animasi, atau dashboard statistik.

## Evidence
- 79 tes lulus; tes baru mencakup isi kolom, kondisi pencarian kosong, dan form login berlabel.
- Build produksi berhasil; peringatan bundle 738 kB terhadap budget 500 kB masih terbuka.
- Keempat halaman diperiksa dalam frame browser pada viewport 320/768/1024/1440 px.
- Lebar dokumen sama dengan viewport pada seluruh kasus; hanya area tabel yang menggulir horizontal.
- Pada 320 px, form Add dan detail menjadi satu kolom. Pada 768 px ke atas keduanya dua kolom.
- Lighthouse: accessibility 100 dan best practices 100 untuk login, list, add, dan detail.
- Lighthouse SEO 75 karena meta description belum tersedia; tidak diprioritaskan untuk backoffice demo.
- Tab mencapai username lalu password; area tabel menerima fokus dan merespons ArrowRight.
- Console browser tidak menunjukkan error pada pemeriksaan terakhir.

## Wondelai review
- Visual: 9/10 (7 dari 8 diagnostic terpenuhi). Hierarki, spacing, lebar konten, label,
  kontras, dan bayangan ditinjau; evaluasi grayscale formal masih belum dilakukan.
- Kerapihan kode UI: 8/10. Template mengikuti struktur halaman yang sama, warna/spacing
  memakai token bersama, dan pengujian memeriksa hasil. Formatting lama serta beberapa
  method panjang di luar perubahan tampilan belum direfaktor.

## Not checked
- Screen reader manual, zoom teks 200%, dan perangkat mobile fisik.
- Lighthouse otomatis tidak membuktikan seluruh persyaratan WCAG.
