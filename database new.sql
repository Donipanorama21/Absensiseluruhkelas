-- 1. Buat database baru
CREATE DATABASE IF NOT EXISTS sekolah_db;
USE sekolah_db;

-- 2. Tabel admin (login)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100)
);

-- 3. Tabel siswa
CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    wali_kelas VARCHAR(100)
);

-- 4. Tabel mata pelajaran
CREATE TABLE IF NOT EXISTS mapel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_mapel VARCHAR(100) NOT NULL
);

-- 5. Tabel absensi
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_siswa INT NOT NULL,
    id_mapel INT NOT NULL,
    tanggal DATE NOT NULL,
    semester TINYINT NOT NULL,
    keterangan ENUM('Hadir','Izin','Sakit','Alpa') NOT NULL,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE CASCADE
);

-- 6. Tabel nilai
CREATE TABLE IF NOT EXISTS nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_siswa INT NOT NULL,
    id_mapel INT NOT NULL,
    semester TINYINT NOT NULL,
    harian FLOAT DEFAULT 0,
    tugas FLOAT DEFAULT 0,
    uts FLOAT DEFAULT 0,
    uas FLOAT DEFAULT 0,
    rata_rata FLOAT AS ((harian + tugas + uts + uas)/4) STORED,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE CASCADE
);

-- 7. Insert admin default
INSERT INTO admin (username, password, nama) VALUES ('admin', 'admin123', 'Doni Panorama');

-- 8. Insert contoh siswa
INSERT INTO siswa (nama, kelas, wali_kelas) VALUES
('Ahmad', 'X RPL', 'Budi Santoso'),
('Siti', 'X RPL', 'Budi Santoso'),
('Rina', 'XI RPL', 'Ani Lestari');

-- 9. Insert contoh mata pelajaran
INSERT INTO mapel (nama_mapel) VALUES
('Matematika'), ('Bahasa Indonesia'), ('Bahasa Inggris'), ('Fisika');
sekolah_db