# Employee Backoffice

Mini aplikasi employee management untuk assessment frontend, menggunakan Angular standalone,
Reactive Forms, Angular Material, dan signals. Tidak membutuhkan backend.

## Environment

- Angular dan Angular Material 22.
- Node.js 24.18.x (versi yang dipakai saat pengembangan).
- npm 11.16.x.
- Browser modern dengan JavaScript dan browser storage aktif.

## Menjalankan aplikasi

Dari folder `employee-backoffice`, jalankan:

```sh
npm ci
npm start
```

Buka `http://localhost:4200/`. Halaman utama mengarah ke login.

## Akun demo

- Username: `admin`
- Password: `admin123`

Login hardcoded dan route guard hanya simulasi frontend, bukan autentikasi produksi.
Password tidak disimpan atau dicetak ke console. Gunakan data employee dummy saja.

## Halaman dan perilaku

- `/login`: validasi input dan akun demo.
- `/employees`: 100 dummy employee awal, sorting username/email/group/status/salary, pagination, pilihan page size,
  serta pencarian username dan group dengan aturan AND. Kolom Action menyediakan Edit
  dan Delete dummy: notifikasi Edit kuning, Delete merah, tanpa mengubah data.
- `/employees/add`: semua field wajib, validasi email, salary angka, birthDate tidak
  melewati hari ini, serta autocomplete untuk mencari salah satu dari 10 group.
  Save menyimpan data lalu kembali ke list; Cancel kembali tanpa menyimpan.
- `/employees/:id`: detail employee, format rupiah dan tanggal Indonesia, pesan jika ID
  tidak ditemukan, serta link OK untuk kembali ke list.

Pencarian berupa substring, tidak membedakan huruf besar/kecil. Kedua filter disimpan
sebagai query params dan dibawa pada navigasi list → detail → OK.
`description` menggunakan datetime mengikuti tipe pada spesifikasi, bukan kolom teks.
Input datetime memakai waktu lokal browser; data baru disimpan sebagai ISO UTC dan
tanggal detail ditampilkan dalam UTC.

## Penyimpanan data

- Employee disimpan pada key `employee-backoffice-employees` di `localStorage`.
- Dummy data dibuat hanya jika key belum ada. Data tersimpan yang valid, termasuk array
  kosong, tidak ditimpa saat refresh.
- Status login demo berada di `sessionStorage`, sehingga bertahan saat refresh tetapi
  tidak dimaksudkan sebagai sesi lintas tab.
- Data storage diperiksa ulang: atribut wajib, tipe salary, format email/tanggal,
  group yang tersedia, birthDate, dan keunikan ID.
- Jika data rusak, aplikasi menampilkan dummy dengan peringatan, mempertahankan isi
  storage asli, dan menolak penambahan sampai masalah dipulihkan atau data direset.
- Tombol reset pada peringatan di list meminta konfirmasi sebelum mengganti data
  tersimpan dengan 100 dummy employee. Reset menghapus perubahan employee sebelumnya.
- Jika penyimpanan gagal atau penuh, Save menampilkan error dan tidak mengubah data
  dalam memori seolah-olah penyimpanan berhasil.

Browser storage dapat diubah atau dibersihkan pengguna. Data tidak terenkripsi, tidak
tersinkron lintas perangkat, dan tidak cocok untuk data employee sungguhan.

## Pengujian dan build

```sh
npm test -- --watch=false
npm run build
```

Tes menggunakan Vitest, Angular TestBed, RouterTestingHarness, dan Material harness.
Build berada di `dist/employee-backoffice/`.
Belum ada runner end-to-end terpisah.

Keempat halaman dimuat dengan `loadComponent` agar kode halaman lain tidak masuk bundle
awal. Pada build produksi terakhir, initial bundle 303,64 kB (sebelumnya 737,55 kB),
di bawah budget warning 500 kB yang tidak diubah. Ukuran ini bukan total seluruh lazy
chunk dan bukan pengukuran waktu muat pengguna.

## Tampilan dan aksesibilitas

Keempat halaman memakai layout dan tema Material yang konsisten. Form/detail menjadi satu
kolom pada layar kecil; tabel tetap mempertahankan seluruh kolom melalui area scroll
horizontal yang dapat difokuskan dengan keyboard. Pencarian tanpa hasil memiliki pesan
yang menjelaskan cara mencoba lagi.

Layout diperiksa dalam viewport frame browser berukuran 320, 768, 1024, dan 1440 px,
tanpa overflow horizontal pada halaman. Audit Lighthouse saat pengembangan memberi
accessibility 100 dan best practices 100 pada keempat halaman. Ini pemeriksaan otomatis,
bukan sertifikasi WCAG; pengujian manual dengan screen reader dan perangkat fisik belum dilakukan.

## Status pengumpulan

Verifikasi terakhir: 95 tes lulus dan build produksi berhasil tanpa peringatan budget.
Repo publik: [ammarff/employee-backoffice](https://github.com/ammarff/employee-backoffice).
Dependencies, build/cache, file environment rahasia, `learning/`, dan `.vscode/`
dikecualikan melalui `.gitignore`. Folder lokal tetap tersedia tanpa dilacak Git.

Menyimpan sorting, page index, dan page size ke URL adalah pengembangan opsional,
bukan syarat PDF. Saat ini filter pencarian yang dipertahankan, sementara paging/sorting
kembali ke nilai awal ketika halaman list dibuat ulang.
