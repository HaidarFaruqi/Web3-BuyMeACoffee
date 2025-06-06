# ☕ Buy Me a Coffee DApp ☕

Sebuah Aplikasi Web3 interaktif yang memungkinkan pengguna mengirim donasi (membeli kopi) menggunakan kripto (ETH) dengan konversi dinamis dari Rupiah (IDR), sekaligus menampilkan notifikasi real-time dan dashboard admin.

---

## 🚀 Live Demo

Aplikasi ini sudah di-deploy dan dapat diakses publik melalui Vercel:
[https://web3-buy-me-a-coffee.vercel.app/](https://web3-buy-me-a-coffee.vercel.app/)

---

## ✨ Fitur Utama

* **Donasi Kripto Interaktif:** Pengguna dapat mengirimkan donasi (membeli kopi) dengan memasukkan nama, pesan, dan jumlah dalam IDR.
* **Konversi Mata Uang Dinamis:** Donasi dalam IDR dikonversi secara real-time menjadi ETH menggunakan data harga dari Chainlink Oracle.
* **Notifikasi Real-time:** Setiap donasi baru akan memicu notifikasi pop-up di layar semua pengguna yang sedang melihat aplikasi.
* **Integrasi Wallet:** Koneksi mulus dengan MetaMask untuk otorisasi dan transaksi blockchain.
* **Transparansi On-chain:** Semua donasi dan aksi admin terekam secara permanen di blockchain.

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan kombinasi teknologi Web3 dan Web2 modern:

**Smart Contract (On-chain):**
* **Solidity:** Bahasa pemrograman untuk smart contract.
* **Hardhat:** Lingkungan pengembangan untuk mengkompilasi, menguji, dan mendeploy smart contract.
* **Ethers.js:** Library untuk berinteraksi dengan smart contract dari JavaScript.
* **Chainlink Price Feeds:** Oracle terdesentralisasi untuk mendapatkan data harga ETH/USD.
* **Ethereum Sepolia Testnet:** Jaringan blockchain tempat kontrak di-deploy.

**Frontend (Off-chain):**
* **Next.js:** Framework React untuk membangun aplikasi web.
* **React:** Library JavaScript untuk membangun antarmuka pengguna.
* **Tailwind CSS:** Framework CSS untuk styling yang cepat dan responsif.
* **Ethers.js:** (Digunakan juga di frontend) Untuk berinteraksi dengan blockchain dan smart contract.
* **Vercel:** Platform hosting untuk deployment aplikasi frontend.
* **MetaMask:** Ekstensi browser wallet yang digunakan oleh pengguna.
* **Supabase:** Backend-as-a-Service untuk database off-chain dan layanan lainnya.

---

## 🚀 Setup & Instalasi (Untuk Pengembangan Lokal)

Ikuti langkah-langkah ini untuk menjalankan proyek di lingkungan pengembangan lokal Anda:
1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/HaidarFaruqi/Web3-BuyMeACoffee.git](https://github.com/HaidarFaruqi/Web3-BuyMeACoffee.git)
    cd BlockChain_TestV2
    ```

2.  **Instal Dependensi:**
    * Instal dependensi untuk proyek secara keseluruhan (Hardhat):
        ```bash
        npm install
        ```
    * Masuk ke folder `frontend` dan instal dependensi untuk aplikasi Next.js:
        ```bash
        cd frontend
        npm install
        cd .. # Kembali ke root proyek
        ```

3.  **Konfigurasi Variabel Lingkungan (`.env`):**
    * Buat file bernama `.env` di **root folder proyek Anda** (`BlockChain_TestV2`).
    * Isi file tersebut dengan variabel-variabel berikut, ganti `YOUR_..._KEY` dengan nilai yang sebenarnya:
        ```
        # Untuk Hardhat (sisi server/deployment)
        SEPOLIA_URL="[https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY](https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY)"
        # ATAU: SEPOLIA_URL="[https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY](https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY)"
        PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY" # Dapatkan dari detail akun MetaMask Anda (Jangan dibagi!)

        # Untuk Frontend (sisi klien) - untuk notifikasi real-time
        NEXT_PUBLIC_INFURA_WSS_URL="wss://sepolia.infura.io/ws/v3/YOUR_INFURA_API_KEY"
        # ATAU: NEXT_PUBLIC_ALCHEMY_WSS_URL="wss://[eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY](https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY)"

        # (Opsional) Jika Anda menggunakan Supabase
        NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
        ```

4.  **Dapatkan ETH Sepolia (Testnet Faucet):**
    * Untuk membayar biaya gas transaksi, Anda memerlukan ETH Sepolia di akun MetaMask yang terhubung dengan `PRIVATE_KEY` di `.env` Anda.
    * Kunjungi [https://sepoliafaucet.com/](https://sepoliafaucet.com/) dan ikuti instruksi untuk mendapatkan ETH testnet.

5.  **Kompilasi Smart Contract:**
    ```bash
    npx hardhat compile
    ```
    * Ini akan membuat folder `artifacts/` yang berisi ABI kontrak.

6.  **Salin ABI ke Frontend:**
    * **PENTING:** Setelah kompilasi, salin file ABI yang baru dibuat:
        ```bash
        cp artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json frontend/src/utils/BuyMeACoffee.json
        ```

7.  **Deploy Smart Contract ke Sepolia:**
    ```bash
    npx hardhat run scripts/deploy.js --network sepolia
    ```
    * Perhatikan outputnya, Anda akan melihat alamat kontrak yang dideploy. **SALIN ALAMAT INI!**

8.  **Perbarui Alamat Kontrak di Frontend:**
    * Buka file `frontend/src/utils/contract.ts`.
    * Ganti `contractAddress` dengan alamat kontrak baru yang Anda dapatkan di langkah sebelumnya.

9.  **Jalankan Aplikasi Frontend:**
    * Masuk ke folder `frontend`:
        ```bash
        cd frontend
        ```
    * Jalankan aplikasi Next.js:
        ```bash
        npm run dev
        ```
    * Buka browser Anda dan akses `http://localhost:3000`.

---

## 💡 Panduan Penggunaan Aplikasi

### Halaman Utama (`/`)

1.  Buka aplikasi di browser Anda.
2.  Klik **"Connect Wallet"** dan hubungkan MetaMask Anda (pastikan terhubung ke Sepolia).
3.  Isi **"Your name"**, **"Say something nice..."**, dan **"Amount in IDR"**.
4.  Klik **"Send Coffee ☕"**.
5.  Konfirmasi transaksi di MetaMask Anda.
6.  Setelah transaksi dikonfirmasi, Anda akan melihat **notifikasi pop-up real-time** di pojok kanan bawah layar.

---

## 💡 Panduan Penggunaan Aplikasi

### Halaman Utama (`/`)

1.  Buka aplikasi di browser Anda.
2.  Klik **"Connect Wallet"** dan hubungkan MetaMask Anda (pastikan terhubung ke Sepolia).
3.  Isi **"Your name"**, **"Say something nice..."**, dan **"Amount in IDR"**.
4.  Klik **"Send Coffee ☕"**.
5.  Konfirmasi transaksi di MetaMask Anda.
6.  Setelah transaksi dikonfirmasi, Anda akan melihat **notifikasi pop-up real-time** di pojok kanan bawah layar.

---

## 🐛 Tantangan yang Dihadapi & Solusi

Selama pengembangan, beberapa tantangan signifikan muncul, yang seringkali menjadi hal umum dalam proyek Web3:

* **Kesalahan Kompilasi Solidity & Deployment:** Masalah seperti library Chainlink tidak ditemukan, versi Solidity tidak cocok, atau kesalahan deklarasi.
* **Masalah Sinkronisasi Git & ABI:** Riwayat Git yang kompleks atau file ABI yang tidak sinkron antara smart contract yang di-deploy dan aplikasi frontend.
* **Kesalahan Build Frontend (ESLint & TypeScript):**
    * `no-unused-vars`, `no-explicit-any`, `no-unescaped-entities` (memerlukan penyesuaian kode ketat dan penggunaan entitas HTML seperti `&apos;`).
    * Masalah tipe `window.ethereum` (memerlukan file deklarasi `.d.ts`).
    * Masalah tipe `bigint` (memerlukan penyesuaian `tsconfig.json` `target` dan `lib` ke `ES2020`).
    * Error `could not decode result data (value="0x")`: Seringkali karena kontrak `revert` diam-diam (misalnya, karena `usdtoidrPrice` atau data oracle `0`) atau masalah stabilitas RPC.
* **Stabilitas Notifikasi Real-time (WebSocket):** Notifikasi tidak muncul di Vercel karena koneksi WebSocket `BrowserProvider` yang tidak stabil.
    * **Solusi:** Implementasi `ethers.WebSocketProvider` khusus untuk mendengarkan event agar lebih stabil.

Kami menggunakan **GenAI Tools** (seperti Google Gemini/ChatGPT) secara ekstensif dalam proses ini untuk:
* Menganalisis dan memecahkan error yang kompleks dan tidak jelas.
* Menyediakan panduan langkah demi langkah untuk konfigurasi dan implementasi.
* Menjelaskan konsep Web3 yang rumit.
* Mempercepat proses debugging dan pengembangan.

---

## 🚀 Peningkatan di Masa Depan

* **Daftar Memo Lebih Lanjut:** Menambahkan pagination atau filter untuk daftar memo.
* **Integrasi Konten Multimedia:** Memungkinkan pengirim untuk menyertakan URL gambar atau video IPFS/Arweave di memo.
* **NFT/Badge Donatur:** Memberikan NFT unik kepada donatur berdasarkan kriteria tertentu.
* **Pilihan Donasi Multi-Token:** Mendukung donasi dalam token ERC-20 lainnya (misalnya, DAI, USDC).
* **Optimasi Gas:** Memperhalus kontrak untuk penggunaan gas yang lebih efisien di Mainnet.

---