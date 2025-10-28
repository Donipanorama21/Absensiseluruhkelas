const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 🔑 Konfigurasi & Database
// ===============================
const secret = "RAHASIA123"; // ⚠️ Ganti ini dengan kunci rahasia yang lebih aman di lingkungan produksi!

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pa20236645ma*&',
    database: 'absensi_db',
    port: 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Daftar Mata Pelajaran Lengkap yang sudah dikoreksi (UNIQUE)
const MATA_PELAJARAN_LENGKAP = [
    "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Pendidikan Agama Islam",
    "Penjaskes", "Pipas", "PKK", "DPTM", "PDTM", "Informatika", "PKn",
    "Teknik Mekanik Mesin Industri", "Dasar desain grafis", "Pemodelan perangkat lunak",
    "Konten kreator", "Sistem komputer", "Komputer dan Jaringan dasar",
    "Pemograman dasar", "Pemograman berorientasi objek",
    "Pemeliharaan sasis dan Pemindah tenaga kendaraan ringan",
    "Pemeliharaan mesin kendaraan ringan", "Pneumatik dan hydrolik", "Seni budaya",
    "Gambar teknik", "Safety dojo dan fundamental skill", "PDTO", "Sejarah",
    "Sistem kelistrikan mesin industri", "Pemeliharaan kelistrikan kendaraan ringan",
    "Teknologi dasar otomotif", "Basis data", "Pemograman web dan perangkat bergerak"
];

// ===============================
// 🚀 Inisialisasi Database & Data Awal
// ===============================
(async () => {
    try {
        const conn = await db.getConnection();

        // Table creations (Cleaned and aligned)
        await conn.query(`
CREATE TABLE IF NOT EXISTS admin (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50),
password VARCHAR(255),
nama VARCHAR(100)
);
`);

        await conn.query(`
CREATE TABLE IF NOT EXISTS siswa (
id INT AUTO_INCREMENT PRIMARY KEY,
nama VARCHAR(100),
kelas VARCHAR(50)
);
`);

        await conn.query(`
CREATE TABLE IF NOT EXISTS mapel (
id INT AUTO_INCREMENT PRIMARY KEY,
nama_mapel VARCHAR(100) UNIQUE
);
`);

        // PERBAIKAN: Mengubah VARCHAR(5INGR0) menjadi VARCHAR(50)
        await conn.query(`
CREATE TABLE IF NOT EXISTS absensi (
id INT AUTO_INCREMENT PRIMARY KEY,
id_siswa INT,
id_mapel INT,
kelas VARCHAR(50), 
tanggal DATE,
semester VARCHAR(20),
keterangan VARCHAR(20),
FOREIGN KEY (id_siswa) REFERENCES siswa(id),
FOREIGN KEY (id_mapel) REFERENCES mapel(id)
);
`);

        // PERBAIKAN: Mengubah VARCHAR(5INGR0) menjadi VARCHAR(50)
        await conn.query(`
CREATE TABLE IF NOT EXISTS nilai (
id INT AUTO_INCREMENT PRIMARY KEY,
id_siswa INT,
id_mapel INT,
kelas VARCHAR(50),
semester VARCHAR(20),
harian INT,
tugas INT,
uts INT,
uas INT,
rata_rata DECIMAL(5,2) AS ((harian + tugas + uts + uas) / 4) STORED,
FOREIGN KEY (id_siswa) REFERENCES siswa(id),
FOREIGN KEY (id_mapel) REFERENCES mapel(id)
);
`);


        // Admin default
        const [adminRows] = await conn.query("SELECT * FROM admin");
        if (adminRows.length === 0) {
            const hash = await bcrypt.hash("admin123", 10);
            await conn.query("INSERT INTO admin (username, password, nama) VALUES ('admin', ?, 'Administrator')", [hash]);
            console.log("✅ Admin default dibuat: username=admin, password=admin123");
        }

        // Data contoh siswa (Memastikan data inisialisasi hanya berjalan sekali)
        const [siswaRows] = await conn.query("SELECT * FROM siswa");
        if (siswaRows.length === 0) {
            const dataSiswa = [
                ["ADE SOLIHIN", "X TMI"], ["ADITYA PERMANA", "X TMI"], ["AHMAD MAULANA", "X TMI"],
                ["ARMAN MAULANA", "X TMI"], ["ASEP SUTRISNO", "X TMI"], ["FABYO CAFFELO SURACHMAN", "X TMI"],
                ["LUTFAN NAVURA", "X TMI"], ["M. AZHAR MIZWARI", "X TMI"], ["MARLUDIYAN GERARD INDRATNO", "X TMI"],
                ["MOCHAMAD RIO AGUSTIN", "X TMI"], ["MUHAMAD ALFIAN", "X TMI"], ["MUHAMAD BIAGY RIDWAN FAUZY", "X TMI"],
                ["MUHAMAD REZA SUDRAJAT", "X TMI"], ["MUHAMAD RIPA'I", "X TMI"], ["MUHAMAD RIZKY", "X TMI"],
                ["MUHAMAD TEGUH", "X TMI"], ["MUHAMMAD AREIJZ ABDILAH", "X TMI"], ["MUHAMMAD IRGI JUNIAR", "X TMI"],
                ["MUHAMMAD PRADITYA PUTRA", "X TMI"], ["MUHAMMAD RAFQI ADITYA", "X TMI"], ["MUHAMMAD RIZKY FEBRIYANTO", "X TMI"],
                ["PATIH BIMO ALPARIZI", "X TMI"], ["R. NANDI PUTRA PRIONATA", "X TMI"], ["RAFI ISLAMI FASHA", "X TMI"],
                ["RAMA ANDIKA FIRDAUS", "X TMI"], ["RANO", "X TMI"], ["RHEZA PUTRA PRATAMA", "X TMI"],
                ["RIO WIJAYA", "X TMI"], ["SIGIT TRI ANDIKA", "X TMI"], ["WAHYU SHAPUTRA", "X TMI"],
                ["WISNU YOGIYANTO", "X TMI"], ["ZIDAN FIRMANSYAH", "X TMI"],

                ["ALIF SEFTIANA PUTRA", "X TKR 1"], ["ARBI", "X TKR 1"], ["ARFI REDIANSYAH", "X TKR 1"],
                ["DIKY ZULKARNAEN", "X TKR 1"], ["ELVAN ALDIAN", "X TKR 1"], ["ERVAN GUNAWAN", "X TKR 1"],
                ["FADLAN MUHAMAD AZAM", "X TKR 1"], ["JACKQUINT ZAKHARIA YOSEP", "X TKR 1"], ["MARISSA ANGELINA", "X TKR 1"],
                ["MUHAMAD RAIHAN FAHREZI", "X TKR 1"], ["MUHAMAD RAMDANI", "X TKR 1"], ["MUHAMMAD RISYAD YUZWARSAH", "X TKR 1"],
                ["MUHAMMAD ABDUL AZIS", "X TKR 1"], ["MUHAMMAD FATTAN ABDILLAH", "X TKR 1"], ["PANJI PRATAMA MUSTOPA", "X TKR 1"],
                ["PUTRI LUSIANA", "X TKR 1"], ["RISKI SYAHPUTRA", "X TKR 1"], ["SALMAN ALFARIZI", "X TKR 1"],
                ["WARDANY FIRMANSYAH", "X TKR 1"],

                ["ARYA BIMA EKA S", "X TKR 2"], ["ARZUNA DAPA MAULID", "X TKR 2"], ["ASIH", "X TKR 2"],
                ["DEDE CASMITA", "X TKR 2"], ["DIRLY YUSPRIATNA", "X TKR 2"], ["EBIET REFAEL AL KHALIFI", "X TKR 2"],
                ["FIANSYAH", "X TKR 2"], ["ILMAN", "X TKR 2"], ["JEFRI FEBRIAN", "X TKR 2"],
                ["LUTFI BAGUS MINARSO", "X TKR 2"], ["M ISMA MAULANA", "X TKR 2"], ["M. REYHAN HASIM", "X TKR 2"],
                ["MAHESA SETIAWAN", "X TKR 2"], ["MUHAMAD AGNI P", "X TKR 2"], ["MUHAMAD FAHMI", "X TKR 2"],
                ["MUHAMAD GUNTUR MAULANA", "X TKR 2"], ["MUHAMAD IRSYAD", "X TKR 2"], ["RAMDHAN PUTRA FIRDAUS", "X TKR 2"],
                ["MUHAMMAD RIVQHI MUCHTIAR", "X TKR 2"], ["PRANA BUDI SENTOSA", "X TKR 2"], ["RAIHAN MAULANA", "X TKR 2"],
                ["RIKO AHMAD ARIFIN", "X TKR 2"], ["SENDI HAMDANI", "X TKR 2"], ["SEPTIAN REVA RAMADHAN", "X TKR 2"],
                ["VIONA PUTRI SOLIHAT", "X TKR 2"], ["ZHAELANI ALDI", "X TKR 2"],

                ["ALIZA SAFIRA", "X RPL"], ["APRIEL MELODYA GHYNA", "X RPL"], ["CACA APRILYANTI", "X RPL"],
                ["FRISCA AURELLANI", "X RPL"], ["M IHSAN ANUGRAH", "X RPL"], ["MARISSA LUTFIANA ULFA", "X RPL"],
                ["MARSYA DWI SAFITRI", "X RPL"], ["MEYSA CEMPAKA FIRNANDA", "X RPL"], ["MUHAMMAD RIFQI MAULANA M", "X RPL"],
                ["NANDITA SUKMAWATI", "X RPL"], ["PUTRI ANISA", "X RPL"], ["RAHMA NATRIA", "X RPL"],
                ["RIZMA PRANATASYA", "X RPL"], ["SAKIRA QURRATU'AINI", "X RPL"], ["TIARA MAULIDA RAHMAWATI", "X RPL"],
                ["WILDAN SIFATUNNAZAH", "X RPL"],

                ["ARDIKA SUGIARTO", "XI TMI"], ["ARIL OKTA PIANSYAH", "XI TMI"], ["ASBY ARIF RAMADHAN", "XI TMI"],
                ["AZRIEL AZHAR RACHMAN", "XI TMI"], ["BAYU MAULANA IBRAHIM", "XI TMI"], ["CRISTIAN TRI MULYANA", "XI TMI"],
                ["DEWA BRAJA", "XI TMI"], ["FAZRI MAULANA ROHMAN", "XI TMI"], ["GLENREYDOAN SARAGIH", "XI TMI"],
                ["IKRAM IRWANSYAH", "XI TMI"], ["KEFIN FAIZIN", "XI TMI"], ["MUHAMAD FATHANMUBINA KALIMUSADA", "XI TMI"],
                ["MUHAMMAD ALI FAQIH", "XI TMI"], ["MUHAMMAD ILYAS MAULANA", "XI TMI"], ["RAKIDI", "XI TMI"],
                ["RIZIQ MAULANA", "XI TMI"], ["RIZKY FASYA IRAWAN", "XI TMI"], ["SYAHRU NABHAN", "XI TMI"],
                ["TRISNA RAHMAT HAPSARI", "XI TMI"], ["VINO RAMADAN", "XI TMI"], ["ZALFA RAPID", "XI TMI"],
                ["MUHAMMAD RHAGIEL ISKANDAR", "XI TMI"],

                ["ADRIAN KRISPATI", "XI TKR 1"], ["AFGHAN SURYA GEMILANG", "XI TKR 1"], ["AHMAD ERWIN", "XI TKR 1"],
                ["BAYU SATRIO", "XI TKR 1"], ["DARWIN REVALDI", "XI TKR 1"], ["DENDI PRASETIO", "XI TKR 1"],
                ["DENY SUPRIADI", "XI TKR 1"], ["DIVA PUSPITA", "XI TKR 1"], ["FARIDZ PUTRA ANANDA", "XI TKR 1"],
                ["M. DAVI RAMADANI", "XI TKR 1"], ["MARSEL RAFLI", "XI TKR 1"], ["MUHAMMAD ANWAR RHAJUDIN", "XI TKR 1"],
                ["MUHAMMAD FAJAR HARDIANSYAH", "XI TKR 1"], ["MUHAMMAD KHOLIK", "XI TKR 1"], ["PANDU ESA CAKRA DARA", "XI TKR 1"],
                ["PRAMUDYA ISMAIL", "XI TKR 1"], ["RAHMAT HIDAYAT", "XI TKR 1"], ["RANDY CHRISYANA", "XI TKR 1"],
                ["REYHAN ZIBAN", "XI TKR 1"], ["RIFAN MAULANA", "XI TKR 1"], ["RITA HERAWATI", "XI TKR 1"],
                ["RIZKI RAMADHAN", "XI TKR 1"], ["ROBI RAHMAT", "XI TKR 1"], ["SAKINAH", "XI TKR 1"],
                ["SEPBRIINA LAILATUL HIKMAH", "XI TKR 1"], ["SEPTIANI", "XI TKR 1"], ["SURYA AHMAD", "XI TKR 1"],
                ["YUNIAR PUTRI PRATAMA", "XI TKR 1"], ["ZEZEN JAELANI", "XI TKR 1"],

                ["ABDULLAH RIVA PUTRA PERMANA", "XI TKR 2"], ["ADRI SOPIANA", "XI TKR 2"], ["ANANDA RIFKI JUNIANSYAH", "XI TKR 2"],
                ["ARIS", "XI TKR 2"], ["DELA TOPISA", "XI TKR 2"], ["DERIL AL FAIZ", "XI TKR 2"],
                ["DIMAS RIZKY PRADITYA PUTRA", "XI TKR 2"], ["EKA PERMADI", "XI TKR 2"], ["ENJANG PERMANA", "XI TKR 2"],
                ["FAHRI BAYU ARDIANSYAH", "XI TKR 2"], ["GALANG RAMBU HANAFI", "XI TKR 2"], ["HAZELI ABDUL AZIS", "XI TKR 2"],
                ["IIN MARTINI", "XI TKR 2"], ["JEPA PUTRA SATRIA R", "XI TKR 2"], ["JUMANDIANA", "XI TKR 2"],
                ["KEMAL", "XI TKR 2"], ["LUCKY ARDIAN NUARI", "XI TKR 2"], ["MUHAMAD AZHARI", "XI TKR 2"],
                ["MUHAMAD UMAR FIRDAUS", "XI TKR 2"], ["MUHAMMAD FATHIR RAMDHANI", "XI TKR 2"], ["MUHAMMAD NURLUTFI MUSTOPA", "XI TKR 2"],
                ["RADIT RIZKY ADITYA", "XI TKR 2"], ["RIKO PADILAH", "XI TKR 2"], ["RIZKY SASMITA HIDAYAT", "XI TKR 2"],
                ["SADEWO HADI PRASETYO", "XI TKR 2"], ["SITI AL-ASHARI NING AGUNG", "XI TKR 2"], ["SURATMAN", "XI TKR 2"],

                ["AISHA NUR PUTRI RAMDANI", "XI RPL"], ["ANISA FIRDAUS", "XI RPL"], ["ELSYA AMELIA PUTRI", "XI RPL"],
                ["IVANA AUREL TALIA BR SURBAKTI", "XI RPL"], ["PUTRI AULIA", "XI RPL"], ["RASYA NUR ANJANI", "XI RPL"],
                ["SELLY SEPTIA NURANDINI", "XI RPL"], ["SINTA FEBRIANI", "XI RPL"],

                ["ADHI ALIEF RACHMAN", "XII TMI"], ["ANDRYANA", "XII TMI"], ["ANGGA SAPUTRA", "XII TMI"],
                ["ASDIYANTO", "XII TMI"], ["CHOKY ADRIANO", "XII TMI"], ["DALVIN MUHAMMAD ALRIZKI", "XII TMI"],
                ["DEDE HERMAWAN", "XII TMI"], ["DEDE KURNIAWAN", "XII TMI"], ["DIKY BAYU WICAKSONO", "XII TMI"],
                ["DYNA FADILLAH BADAWI", "XII TMI"], ["FAISAL DWI MUTHAHHAIRI", "XII TMI"], ["FARHAN RAMADANI", "XII TMI"],
                ["FHAREL NUGRAHA", "XII TMI"], ["GISTY NOVIANTI", "XII TMI"], ["INSAN KAMIL", "XII TMI"],
                ["IRFAN ABDUL HAKIM", "XII TMI"], ["NENI NURAENI", "XII TMI"], ["OCHA APRIANSAH", "XII TMI"],
                ["PUTRA KURNIAWAN", "XII TMI"], ["RIDWAN PRATAMA", "XII TMI"], ["RIO", "XII TMI"],
                ["RIO ARDETA", "XII TMI"], ["RIZWAN ADIT", "XII TMI"], ["SALMAN ALFARISI", "XII TMI"],
                ["TEDI SETIAWAN", "XII TMI"], ["TWO BAGUS RAMADHAN", "XII TMI"], ["YADHI PEBRIANSYAH", "XII TMI"],
                ["YOPI ADITYA WINATA", "XII TMI"],

                ["AHMAD USAY SAYCU", "XII TKR 1"], ["BIMA SETTIAWAN", "XII TKR 1"], ["CANDRA ZATMIKA", "XII TKR 1"],
                ["DAFFA MUJAKI ROSIDIN", "XII TKR 1"], ["EGGI RAMADANI", "XII TKR 1"], ["FIRMANSYAH", "XII TKR 1"],
                ["GILANG ADITYA", "XII TKR 1"], ["GUNTUR MAULANA", "XII TKR 1"], ["GUSTIAWAN", "XII TKR 1"],
                ["ILHAM RAMDHANI", "XII TKR 1"], ["M NIZAR FADILLAH", "XII TKR 1"], ["MOHAMAD FADILAH AKBAR", "XII TKR 1"],
                ["MUHAMAD BAYU", "XII TKR 1"], ["MUHAMAD KHOLID MAHZUMI", "XII TKR 1"], ["RAYHAN RAFFY JULIAN", "XII TKR 1"],
                ["REZA PEBRYAN", "XII TKR 1"], ["ROBBI PANGESTU", "XII TKR 1"], ["SABRIAN", "XII TKR 1"],
                ["SURYA MAULANA", "XII TKR 1"], ["WISNU ISKANDAR", "XII TKR 1"], ["YOBY PRASETYA", "XII TKR 1"],

                ["ANDRE MAHENDRA", "XII TKR 2"], ["ARMAN MAULANA", "XII TKR 2"], ["BAGAS PRASETIO", "XII TKR 2"],
                ["HANDIKA", "XII TKR 2"], ["LUKI TRI WIBOWO", "XII TKR 2"], ["MUHAMAD GUNTUR PUTRA AMIN", "XII TKR 2"],
                ["MUHAMAD NIZAR", "XII TKR 2"], ["MUHAMAD RIDHO", "XII TKR 2"], ["MUHAMMAD TOHARI", "XII TKR 2"],
                ["MUHAMMAD RIFKI", "XII TKR 2"], ["NADIN NURDIANSYAH", "XII TKR 2"], ["RAIHAN RAHMADAN WIJAYA", "XII TKR 2"],
                ["RAMA MIFTAH HUZAEINI", "XII TKR 2"], ["REYHAN NAZBUDIN", "XII TKR 2"], ["RIAN NUROHMANSYAH", "XII TKR 2"],
                ["ROBI", "XII TKR 2"],

                ["ARIYANTI ROHMAWATI", "XII RPL"], ["ASTI NURMEISYA", "XII RPL"], ["CHIKA KIRANA ISMAYANTI", "XII RPL"],
                ["DELLA PUTRI PRATIWI", "XII RPL"], ["DEPI KOMALASARI", "XII RPL"], ["DIANA PERMANA SARI", "XII RPL"],
                ["DINA NURMALA", "XII RPL"], ["KAYLA FEBRIANTI", "XII RPL"], ["MARSATI", "XII RPL"],
                ["RANI PUSPITA", "XII RPL"], ["SYARA MAULIDA", "XII RPL"], ["TERY ADITYA BASKORO", "XII RPL"]
            ];
            await conn.query("INSERT INTO siswa (nama, kelas) VALUES ?", [dataSiswa]);
            console.log("✅ Data siswa contoh dimasukkan dengan daftar siswa Kelas X, XI, dan XII yang akurat.");
        }

        // Data contoh mapel (Diperbarui dan memastikan tidak ada duplikat)
        const [mapelRows] = await conn.query("SELECT nama_mapel FROM mapel");
        const existingMapelNames = new Set(mapelRows.map(r => r.nama_mapel));

        const mapelToInsert = MATA_PELAJARAN_LENGKAP.filter(name => !existingMapelNames.has(name));

        if (mapelToInsert.length > 0) {
            const dataMapel = mapelToInsert.map(nama => [nama]);
            try {
                await conn.query("INSERT INTO mapel (nama_mapel) VALUES ?", [dataMapel]);
                console.log(`✅ ${mapelToInsert.length} mata pelajaran baru dimasukkan.`);
            } catch (e) {
                // Handle case if UNIQUE constraint fails during parallel execution
                console.log("⚠️ Gagal memasukkan mapel, mungkin sudah ada (Unique constraint error).");
            }
        } else if (mapelRows.length < MATA_PELAJARAN_LENGKAP.length) {
            console.log("✅ Data mapel sudah lengkap/tidak ada mapel baru yang ditambahkan.");
        }

        conn.release();
    } catch (error) {
        console.error("❌ Gagal terhubung ke database atau inisialisasi gagal:", error.message);
    }
})();

// ===============================
// 🔐 Login (JWT + bcrypt)
// ===============================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query("SELECT * FROM admin WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(401).json({ error: "User tidak ditemukan" });

        const admin = rows[0];
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return res.status(401).json({ error: "Password salah" });

        const token = jwt.sign({ id: admin.id }, secret, { expiresIn: "8h" });
        res.json({ token, user: { nama: admin.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===============================
// 🛡️ Middleware Auth
// ===============================
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token dibutuhkan' });
    }
    try {
        req.user = jwt.verify(token, secret);
        next();
    } catch {
        return res.status(401).json({ error: 'Sesi habis atau tidak terotorisasi. Silakan login kembali.' });
    }
}

// ===============================
// 🧑‍🏫 API Kelas, Siswa & Mapel
// ===============================
app.get('/api/kelas', auth, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT DISTINCT kelas FROM siswa ORDER BY kelas");
        res.json({ kelas: rows.map(r => r.kelas) });
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data kelas." });
    }
});

app.get('/api/siswa', auth, async (req, res) => {
    const kelas = req.query.kelas || '';
    try {
        const [rows] = await db.query("SELECT id, nama, kelas FROM siswa WHERE kelas=?", [kelas]);
        res.json({ siswa: rows });
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data siswa." });
    }
});

app.get('/api/mapel', auth, async (req, res) => {
    try {
        // Mengambil Mapel yang unik dan sudah dikoreksi
        const [rows] = await db.query("SELECT id, nama_mapel FROM mapel ORDER BY nama_mapel");
        res.json({ mapel: rows });
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data mata pelajaran." });
    }
});

// ===============================
// 🗓️ API Absensi
// ===============================
app.post('/api/absensi', auth, async (req, res) => {
    const { data, id_mapel } = req.body;
    if (!Array.isArray(data) || data.length === 0 || !id_mapel) return res.status(400).json({ error: "Data absensi atau ID Mata Pelajaran kosong!" });

    try {
        const conn = await db.getConnection();

        const absensiPromises = data.map(async (item) => {
            const [rows] = await conn.query("SELECT id FROM siswa WHERE nama=? AND kelas=? LIMIT 1", [item.nama, item.kelas]);
            if (rows.length === 0) return;
            const id_siswa = rows[0].id;

            const [dupeCheck] = await conn.query("SELECT id FROM absensi WHERE id_siswa=? AND id_mapel=? AND tanggal=? LIMIT 1",
                [id_siswa, id_mapel, item.tanggal]);

            if (dupeCheck.length === 0) {
                return conn.query("INSERT INTO absensi (id_siswa, id_mapel, kelas, tanggal, semester, keterangan) VALUES (?,?,?,?,?,?)",
                    [id_siswa, id_mapel, item.kelas, item.tanggal, item.semester, item.keterangan]);
            }
        });

        await Promise.all(absensiPromises);
        conn.release();
        res.json({ message: "✅ Absensi berhasil disimpan per mata pelajaran!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menyimpan absensi: " + err.message });
    }
});

// ===============================
// 🧾 API Nilai
// ===============================
app.post('/api/nilai', auth, async (req, res) => {
    const { kelas, siswa, id_mapel, semester, harian, tugas, uts, uas } = req.body;
    if (!kelas || !siswa || !id_mapel) return res.status(400).json({ error: "Data nilai atau Mata Pelajaran tidak lengkap!" });

    try {
        const [rows] = await db.query("SELECT id FROM siswa WHERE nama=? AND kelas=? LIMIT 1", [siswa, kelas]);
        if (rows.length === 0) return res.status(404).json({ error: "Siswa tidak ditemukan" });

        const id_siswa = rows[0].id;

        const [existing] = await db.query(
            "SELECT id FROM nilai WHERE id_siswa=? AND id_mapel=? AND kelas=? AND semester=?",
            [id_siswa, id_mapel, kelas, semester || "Ganjil"]
        );

        if (existing.length > 0) {
            await db.query(
                "UPDATE nilai SET harian=?, tugas=?, uts=?, uas=? WHERE id=?",
                [harian, tugas, uts, uas, existing[0].id]
            );
            return res.json({ message: "✅ Nilai berhasil diupdate!" });
        } else {
            await db.query("INSERT INTO nilai (id_siswa, id_mapel, kelas, semester, harian, tugas, uts, uas) VALUES (?,?,?,?,?,?,?,?)",
                [id_siswa, id_mapel, kelas, semester || "Ganjil", harian, tugas, uts, uas]);
            return res.json({ message: "✅ Nilai berhasil disimpan!" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "❌ Gagal simpan/update nilai: " + err.message });
    }
});

// ===============================
// 📊 Rekap Dashboard (Chart Data Re-enabled)
// ===============================
app.get('/api/rekap/dashboard', auth, async (req, res) => {
    try {
        const [siswa] = await db.query("SELECT COUNT(*) as total_siswa FROM siswa");
        const [nilai] = await db.query("SELECT AVG(rata_rata) as rata_nilai FROM nilai");

        const rataNilai = parseFloat(nilai[0].rata_rata || 0).toFixed(2);

        const [totalHadir] = await db.query("SELECT COUNT(*) as total FROM absensi WHERE keterangan = 'Hadir'");
        const [totalAbsensi] = await db.query("SELECT COUNT(*) as total FROM absensi");

        let persenHadir = 0;
        if (totalAbsensi[0].total > 0) {
            persenHadir = ((totalHadir[0].total / totalAbsensi[0].total) * 100).toFixed(2);
        }

        // Data untuk Chart (Nilai Rata-rata per Kelas)
        const [nilaiPerKelas] = await db.query(`
SELECT s.kelas, AVG(n.rata_rata) as avg_nilai 
FROM siswa s
JOIN nilai n ON n.id_siswa = s.id
GROUP BY s.kelas
ORDER BY s.kelas
`);

        const labels = nilaiPerKelas.map(r => r.kelas);
        const nilaiData = nilaiPerKelas.map(r => parseFloat(r.avg_nilai).toFixed(2));

        // Data untuk Chart (Persentase Hadir per Kelas)
        const [hadirPerKelas] = await db.query(`
SELECT 
s.kelas, 
(SUM(CASE WHEN a.keterangan = 'Hadir' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100 as persen_hadir
FROM siswa s
JOIN absensi a ON a.id_siswa = s.id
GROUP BY s.kelas
ORDER BY s.kelas
`);
        const hadirData = labels.map(kelas => {
            const row = hadirPerKelas.find(r => r.kelas === kelas);
            return row ? parseFloat(row.persen_hadir).toFixed(2) : 0;
        });


        res.json({
            total_siswa: siswa[0].total_siswa,
            rata_nilai: rataNilai,
            persen_hadir: parseFloat(persenHadir),
            labels,
            nilai: nilaiData,
            hadir: hadirData
        });
    } catch (err) {
        console.error("Error di API /api/rekap/dashboard:", err);
        // Mengirimkan nilai 0 jika ada error database saat mengambil data dashboard
        res.status(500).json({
            total_siswa: 0,
            rata_nilai: 0,
            persen_hadir: 0,
            labels: ['X', 'XI', 'XII'],
            nilai: [0, 0, 0],
            hadir: [0, 0, 0]
        });
    }
});

// ===============================
// 📘 Rekap Tabel
// ===============================
app.get('/api/rekap', auth, async (req, res) => {
    const kelas = req.query.kelas || '';
    const semester = req.query.semester || '';
    const id_mapel = req.query.id_mapel;
    const tahun_ajaran = req.query.tahun;
    const bulan = req.query.bulan;

    if (!kelas) {
        return res.json({
            rekap: [],
            mapel_name: 'Pilih Kelas',
            hari_efektif: 0,
            total_siswa: 0,
            persen_hadir: 0
        });
    }

    try {
        let mapelName = 'Semua Mata Pelajaran';
        // 1. Ambil Nama Mapel, ini akan digunakan jika mapel difilter
        if (id_mapel) {
            const [mapelRows] = await db.query("SELECT nama_mapel FROM mapel WHERE id=?", [id_mapel]);
            if (mapelRows.length > 0) mapelName = mapelRows[0].nama_mapel;
        }

        // 2. Logika Filter Dinamis Absensi
        let absensiFilters = ` AND a.kelas = '${kelas}' `;

        if (semester) {
            absensiFilters += ` AND a.semester = '${semester}' `;
        }
        if (id_mapel) {
            // Jika Mapel dipilih, filter absensi BERDASARKAN Mapel tersebut
            absensiFilters += ` AND a.id_mapel = ${id_mapel} `;
        }

        if (tahun_ajaran) {
            const startYear = tahun_ajaran.split('/')[0];
            const endYear = tahun_ajaran.split('/')[1];
            absensiFilters += ` AND a.tanggal BETWEEN '${startYear}-08-01' AND '${endYear}-07-31' `;
        }

        if (bulan) {
            absensiFilters += ` AND MONTH(a.tanggal) = ${bulan} `;
        }

        // 3. Filter untuk LEFT JOIN Nilai
        // Jika id_mapel ada, filter nilai hanya untuk mapel tersebut
        const nilaiFilter = id_mapel ? ' AND n.id_mapel = ? ' : '';

        const finalParams = [
            // Parameter untuk LEFT JOIN nilai
            semester,
            ...(id_mapel ? [id_mapel] : []),

            // Parameter untuk WHERE s.kelas
            kelas
        ];


        // 4. Ambil Hari Efektif
        const [hariEfektifRows] = await db.query(`
SELECT COUNT(DISTINCT a.tanggal) as total_hari
FROM absensi a 
WHERE 1=1 ${absensiFilters}
`);
        const hariEfektif = hariEfektifRows[0].total_hari || 0;


        // 5. Query Utama Rekap
        const [rows] = await db.query(`
SELECT 
s.id as id_siswa, 
s.nama, 
s.kelas,
IFNULL(m.nama_mapel, 'Semua Mapel') as nama_mapel_db,
-- Jika id_mapel dipilih, hanya rata-rata nilai mapel tersebut yang dihitung (melalui LEFT JOIN di bawah).
-- Jika id_mapel tidak dipilih, AVG(n.rata_rata) akan menghitung rata-rata dari SEMUA mapel siswa di semester tersebut.
AVG(n.rata_rata) as rata_rata,

-- Subquery Absensi menggunakan filter dinamis yang sama (absensiFilters)
(
SELECT COUNT(DISTINCT a.tanggal)
FROM absensi a
WHERE a.id_siswa = s.id AND a.keterangan = 'Hadir' ${absensiFilters}
) AS total_hadir,

(
SELECT COUNT(DISTINCT a.tanggal)
FROM absensi a
WHERE a.id_siswa = s.id AND a.keterangan = 'Sakit' ${absensiFilters}
) AS total_sakit,

(
SELECT COUNT(DISTINCT a.tanggal)
FROM absensi a
WHERE a.id_siswa = s.id AND a.keterangan = 'Izin' ${absensiFilters}
) AS total_izin,

(
SELECT COUNT(DISTINCT a.tanggal)
FROM absensi a
WHERE a.id_siswa = s.id AND a.keterangan = 'Alpha' ${absensiFilters}
) AS total_alpha

FROM siswa s
-- LEFT JOIN nilai dan mapel untuk mengambil rata-rata nilai (tergantung filter id_mapel)
LEFT JOIN nilai n ON n.id_siswa = s.id AND n.semester = ? ${nilaiFilter}
LEFT JOIN mapel m ON m.id = n.id_mapel
WHERE s.kelas = ?
GROUP BY s.id, s.nama, s.kelas, nama_mapel_db
ORDER BY s.nama
`, finalParams);

        // Post-processing di JavaScript: Mengganti nama mapel agar konsisten dengan filter
        const rekap = rows.map(r => ({
            ...r,
            // Jika id_mapel dipilih, ganti nama_mapel menjadi nama mapel yang difilter
            nama_mapel: id_mapel ? mapelName : r.nama_mapel_db
        }));


        // Menghitung persentase Hadir/Alpha/Siswa untuk ditampilkan di atas tabel
        const totalSiswaFilter = rekap.length;
        const totalHadirGlobal = rekap.reduce((sum, r) => sum + r.total_hadir, 0);
        const totalSakitGlobal = rekap.reduce((sum, r) => sum + r.total_sakit, 0);
        const totalIzinGlobal = rekap.reduce((sum, r) => sum + r.total_izin, 0);
        const totalAlphaGlobal = rekap.reduce((sum, r) => sum + r.total_alpha, 0);

        let persentaseHadir = 0;
        const totalAbsensiHari = totalHadirGlobal + totalSakitGlobal + totalIzinGlobal + totalAlphaGlobal;
        if (totalAbsensiHari > 0) {
            persentaseHadir = (totalHadirGlobal / totalAbsensiHari) * 100;
        }

        res.json({
            rekap: rekap,
            mapel_name: mapelName,
            hari_efektif: hariEfektif,
            total_siswa: totalSiswaFilter,
            persen_hadir: parseFloat(persentaseHadir.toFixed(2))
        });
    } catch (err) {
        console.error("Error di API /api/rekap:", err);
        // Mengatasi Error saat memuat data di frontend
        res.status(500).json({ error: "Error saat memuat data: " + err.message });
    }
});


// ===============================
// 🚀 Jalankan Server
// ===============================
app.listen(5001, () => console.log("✅ Server berjalan di http://localhost:5001"));