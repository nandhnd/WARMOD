# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Nothing yet.

---

## [2025-11-14] - Add YAML, Changelog, Send Email (`96862d0`)

### Added

- Menambahkan file **OpenAPI YAML** sebagai dokumentasi API.
- Menambahkan file **CHANGELOG.md** lengkap untuk tracking perubahan.
- Menambahkan fitur **sendAddonEmail** untuk mengirim email notifikasi addon.

### Changed

- Penyesuaian struktur dokumentasi backend.
- Penyempurnaan konfigurasi email (Nodemailer).

---

## [2025-11-07] - Update All Endpoints & Responses (`d0efd9f`)

### Added / Changed

- Updated seluruh endpoint API agar konsisten dengan standar terbaru.
- Menyesuaikan format response (success & error) agar uniform.
- Penyempurnaan struktur data yang dikembalikan (payload lebih rapih, lebih informatif).
- Refactor beberapa controller untuk performa & maintainability.

---

## [2025-11-07] - Add Migration, Transaction, Cart, Seller Balance, Withdrawal, Ngrok (`cd30ebb`)

### Added

- Menambahkan seluruh migration baru untuk modul:

  - **Transaction**
  - **Cart**
  - **SellerBalance**
  - **Withdrawal**

- Menambahkan model & relasi untuk modul di atas.
- Integrasi awal dengan **ngrok** untuk kebutuhan pengujian webhook.
- Penambahan endpoint terkait transaksi, keranjang, dan penarikan saldo.

### Changed

- Penyesuaian struktur database untuk mendukung fitur finansial.
- Peningkatan struktur folder agar lebih modular.

---

## [2025-11-01] - Update .gitignore (`54cb89a`)

### Changed

- Menambahkan aturan ignore untuk file dan folder development.
- Membersihkan file-file yang tidak perlu dari repository.

---

## [2025-11-01] - First Project Commit (`7bea3c9`)

### Added

- Inisialisasi project backend WARMOD.
- Setup dasar Express.js, Sequelize, struktur MVC.
- Konfigurasi environment & database.
- Commit dasar struktur folder dan dependensi utama.

---

## Format Penulisan

Changelog ini mengikuti pola standar berdasarkan [Keep a Changelog](https://keepachangelog.com/) (tanpa link di file produksi).
