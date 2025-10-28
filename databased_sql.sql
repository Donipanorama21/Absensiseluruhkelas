-- ============================================================
-- DATABASE: absensi_db
-- Sistem Absensi & Nilai Siswa — versi final siap pakai
-- ============================================================

CREATE DATABASE IF NOT EXISTS absensi_db;
USE absensi_db;

-- ===========================
-- 1️⃣ Tabel USER (Admin/Login)
-- ===========================
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guru', 'siswa') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahkan akun admin default (username: admin, password: 12345)
INSERT INTO user (username, password, role)
VALUES ('admin', SHA2('12345', 256), 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- ===========================
-- 2️⃣ Tabel SISWA
-- ===========================
CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data siswa
INSERT INTO siswa (nis, nama, kelas, jurusan)
VALUES 
('1001', 'Andi Saputra', 'X-A', 'RPL'),
('1002', 'Budi Santoso', 'X-A', 'RPL'),
('1003', 'Citra Lestari', 'XI-B', 'TKJ');

-- ===========================
-- 3️⃣ Tabel MAPEL
-- ===========================
CREATE TABLE IF NOT EXISTS mapel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_mapel VARCHAR(100) NOT NULL,
    kode_mapel VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data mapel
INSERT INTO mapel (nama_mapel, kode_mapel, jurusan, keterangan)
VALUES
('Matematika', 'MTK', 'RPL', 'Pelajaran umum wajib'),
('Bahasa Inggris', 'ENG', 'RPL', 'Pelajaran umum wajib'),
('Pemrograman Dasar', 'PD', 'RPL', 'Pelajaran kejuruan dasar');

-- ===========================
-- 4️⃣ Tabel ABSENSI
-- ===========================
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_siswa INT NOT NULL,
    tanggal DATE NOT NULL,
    keterangan ENUM('Hadir', 'Izin', 'Sakit', 'Alpha') DEFAULT 'Hadir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id) ON DELETE CASCADE
);

-- ===========================
-- 5️⃣ Tabel NILAI
-- ===========================
CREATE TABLE IF NOT EXISTS nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_siswa INT NOT NULL,
    id_mapel INT NOT NULL,
    nilai_tugas DECIMAL(5,2),
    nilai_uts DECIMAL(5,2),
    nilai_uas DECIMAL(5,2),
    semester VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE CASCADE
);

-- ============================================================
-- ✅ Semua tabel siap dipakai
-- Admin login: username=admin | password=12345
-- ============================================================

ALTER TABLE user ADD COLUMN nama VARCHAR(100) AFTER id;

INSERT INTO absensi (siswa_id, mapel_id, tanggal, keterangan, semester)
VALUES (1, 1, '2025-10-24', 'Hadir', 1);

