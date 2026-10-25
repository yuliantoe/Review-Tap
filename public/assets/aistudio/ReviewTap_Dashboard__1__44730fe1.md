# ReviewTap

Aktivasi kartu NFC & QR untuk ulasan Google

Data contoh, belum terhubung ke server

## Scan 14 hari terakhir

Jumlah orang yang menempelkan kartu atau memindai QR.

## Sumber scan

### Per bisnis

Dashboard menghitung scan yang melewati link pendek. Google tidak memberi tahu apakah pelanggan akhirnya mengirim ulasan, jadi angka ulasan masuk tetap dibaca dari Google Business Profile.

Status Cari

## Aktifkan kartu

Kartu Bisnis Google Place ID

Place ID bisa dicari di Google Place ID Finder. Pilih bisnis untuk mengisi otomatis.

## Link dan QR

Tulis link pendek sebagai rekaman NDEF tipe URL ke tag NFC (misalnya aplikasi NFC Tools), lalu cetak QR yang sama di kartu.

## Uji sebagai pelanggan

Simulasi apa yang terjadi saat kartu ditempel atau QR dipindai.

Tekan “Simulasikan scan”.

## Dari kartu kosong sampai ulasan masuk

Tiga pihak terlibat: admin, pemilik bisnis, dan pelanggan. Sistem bekerja di tengah.

Admin

Cetak batch kartu. Dashboard membuat kode unik 6 karakter per kartu. Admin menulis link pendek /r/KODE ke tag NFC dan mencetak QR yang sama. Status kartu: Belum aktif.

Admin

Kirim kartu ke bisnis. Kartu dikemas per bisnis. Tidak perlu tahu Place ID pada tahap ini.

Pemilik bisnis

Aktivasi pertama. Pemilik menempelkan kartu ke ponselnya. Karena belum terpasang ke bisnis, link membuka halaman aktivasi. Ia memilih bisnisnya atau menempel Place ID, lalu menekan Aktifkan.

Sistem

Simpan pemasangan. Kode kartu dihubungkan ke Place ID. Status berubah menjadi Aktif dan waktu aktivasi dicatat.

Pelanggan

Tempel kartu atau pindai QR. Tidak perlu aplikasi khusus. Ponsel membuka link pendek.

Sistem

Catat dan alihkan. Server mencatat scan (waktu, sumber NFC atau QR, jenis perangkat), lalu mengalihkan dengan HTTP 302 ke search.google.com/local/writereview?placeid=… dalam kurang dari satu detik.

Pelanggan

Beri bintang dan komentar. Google langsung menampilkan formulir ulasan untuk bisnis tersebut. Pelanggan memilih bintang, menulis komentar, lalu mengirim dengan akun Google-nya.

Pemilik bisnis

Pantau dan balas. Dashboard menunjukkan jumlah scan per kartu dan per hari. Ulasan yang masuk dibalas lewat Google Business Profile.

## Status kartu

Belum aktif→ Aktif⇄ Nonaktif/ Hilang

- Kartu Belum aktif yang discan membuka halaman aktivasi.
- Kartu Nonaktif atau Hilang menampilkan halaman “Kartu tidak berlaku” dan tidak diarahkan ke Google.
- Mengganti bisnis pada kartu cukup mengubah Place ID. Tag NFC dan QR tidak perlu ditulis ulang.

**Aturan Google yang perlu dipatuhi.** Arahkan semua pelanggan ke formulir ulasan, jangan menyaring hanya yang puas. Jangan menawarkan hadiah atau diskon untuk ulasan. Pelanggan harus punya akun Google untuk mengirim ulasan.

## Tabel data

```
businesses
  id, nama, place_id, pemilik_email, dibuat

cards
  code (PK, 6 char), business_id (null),
  tipe (nfc | qr | nfc_qr), status,
  diaktifkan_pada, dibuat

scans
  id, code, waktu, sumber (nfc | qr),
  perangkat (ios | android | lain),
  hasil (redirect | aktivasi | ditolak)
```

## Rute server

```
GET  /r/:code
  ?s=n  (NFC)  atau  ?s=q  (QR)
  aktif    → catat scan, 302 ke Google
  belum    → halaman aktivasi
  nonaktif → halaman "tidak berlaku"

POST /api/cards/batch     buat N kode
POST /api/cards/:code/activate
POST /api/cards/:code/status
GET  /api/stats?range=14d
```

## Logika pengalihan

```
app.get('/r/:code', async (req, res) => {
  const card = await db.card(req.params.code);
  if (!card)                    return res.status(404).render('tidak-berlaku');
  if (card.status === 'baru')   return res.render('aktivasi', { card });
  if (card.status !== 'aktif')  return res.render('tidak-berlaku');

  const sumber = req.query.s === 'n' ? 'nfc' : 'qr';
  db.logScan(card.code, sumber, req.get('user-agent'));   // jangan ditunggu

  const url = 'https://search.google.com/local/writereview?placeid='
            + encodeURIComponent(card.business.place_id);
  res.redirect(302, url);   // 302, bukan 301, supaya bisa diganti kapan saja
});
```

### Perangkat keras

- Tag NFC NTAG213 atau NTAG215 sudah cukup untuk satu link pendek.
- Tulis rekaman NDEF tipe URL, lalu kunci tag (read-only) agar tidak ditimpa.
- iPhone XS ke atas dan hampir semua Android membaca NFC tanpa aplikasi. QR menjadi cadangan untuk ponsel lain.
- Cetak QR dengan margin putih minimal 4 modul dan uji pada ukuran akhir kartu.

### Kenapa pakai link pendek sendiri

- Link Google langsung tidak bisa dihitung scan-nya.
- Kartu yang sudah dicetak tetap bisa dialihkan ke bisnis atau Place ID baru.
- Kartu hilang bisa dimatikan tanpa menarik semua kartu lain.
- Alternatif tanpa server: pakai link ulasan resmi dari Google Business Profile, tetapi tanpa statistik.