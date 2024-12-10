# Web Cari Barang
<img align="center" src="https://raw.githubusercontent.com/Leo42night/Leo42night/main/img/cari-barang.png" />

Apliaksi untuk meng-scan QR-Code dan mendapatkan kode produk yang kemudian kalian bisa cari data lokasi toko yang menjual produk. kalian dapatmelihat produk yang terdekat dan termurah. 

Kalian juga dapat berkontirubusi menambahkan data Produk, data Toko, dan data Lokasi. Login menggunakan google dan daftarkan diri segera.

### Stack
- [Vite React Typescript](https://vite.dev/guide/)
- UI: 
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Font Awesome](https://fontawesome.com/) (download svg, bukan CDN)
- API:
  - [mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode)
  - [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- Database: [Firestore](https://firebase.google.com/docs/firestore) 
- Auth: [Firebase Auth](https://firebase.google.com/docs/auth)

Dengan tujuan memenuhi tugas mata kuliah Sistem Informasi Geografi Lanjut

### Implementasi Bagi yang ingin mencoba mengembangkan sendiri
0. ganti package npm jadi pnpm dengan cara `npm install pnpm`, lalu jalankan `pnpm install`
1. Buat project firebase anda (Auth & Firestore)
2. Download file `gis-product-search-firebase-adminsdk.json` dari firestore database dan jalankan `migrate.py` untuk migrasi data.
3. install package node `pnpm -g install firebase-tools`. jalankan `firebase login`.
4. Jalankan `firebase init`, konfigurasi nya adalah:
- hanya pilih layanan `hosting` untuk hosting.
<br/> <i>-- kondisi 1 : integrasi dengan github  --</i>
- jika ingin integrasi dengan database silahkan terlebih dulu publish project ke repo github anda, lalu pilih `Y` untuk integrasi, setelah itu masukkan semua data environment ke setingan repo, bagian `secrets & variabels -> actions -> new repository secret`, tambahkan semua data berikut:
  - VITE_GMAPS_API 
  - VITE_GMAPS_ID
  - VITE_CENTER
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_DATABASE_URL
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_APP_ID
- gunakan folder `dist/`, karena disitu tempat build vite.
- sesuaikan setingan github action dengan file `firebase-hosting-merge.yml` dan `firebase-hosting-pull-request.yml`. 
- setelah init selesai lakukan commit perubahan dan push ke repo. lalu ketika push setelahnya github action akan dijalankan untuk build dan depoy otomatis
<br/> <i>-- kondisi 2 : Langsung Deploy ke firesbase hosting  --</i>
- setelah langkah 4, pilih juga layanan `hosting`, lalu jangan pilih integrasi dengan github.
- gunakan folder `dist/`
- setelah selesai konfirgurasi jalankan `pnpm run build` untuk build ke distro, kemudia jalankan `firebase deploy` untuk publish ke hosting firebase. 
5. (opsional) : jika ingin mencoba development di local servel menggunakan hp yang terkoneksi ke network localhost di server komputer. anda perlu mengenerate file `certificate (.crt)` dan `private key (.key)`, bisa gunakan layanan di internet seperti [regery.com](https://regery.com/en/security/ssl-tools/self-signed-certificate-generator), kemudian sesuaikan dengan `vite.config.ts`, buat file .env dan masukkan variabel VITE_NODE_ENV untuk condition supaya tidak tertimpa saat deploy.
