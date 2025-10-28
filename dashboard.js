// ===================================
// 💡 Konfigurasi & Global Constants
// ===================================
const API_URL = "http://localhost:5001/api";

// Daftar Mata Pelajaran DUMMY (Digunakan jika API /mapel gagal)
const MATA_PELAJARAN_DUMMY = [
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

// ===================================
// 📡 API Helper (Memastikan Error Handling dan Token Bekerja)
// ===================================
async function apiFetch(endpoint, options = {}) {
const token = localStorage.getItem("token");

const headers = {
...(token && { "Authorization": `Bearer ${token}` }),
"Content-Type": "application/json",
...(options.headers || {})
};

// FIX: Menambahkan query params ke URL jika ada di options
const url = new URL(`${API_URL}${endpoint}`);
if (options.params) {
url.search = new URLSearchParams(options.params).toString();
}

const res = await fetch(url, { ...options, headers });

if (res.status === 401) {
// PERBAIKAN: Mengganti alert() dengan pesan di console/UI jika memungkinkan, tetapi 
// mengikuti format asli untuk meminimalkan perubahan fungsionalitas.
console.error("Sesi habis atau tidak terotorisasi. Silakan login kembali.");
alert("Sesi habis atau tidak terotorisasi. Silakan login kembali.");
logout(true); 
throw new Error("Unauthorized");
}

const contentType = res.headers.get("content-type");
let data = {};

if (contentType && contentType.indexOf("application/json") !== -1) {
try {
data = await res.json();
} catch (e) {
console.error("Gagal parsing JSON dari respons:", e);
data = { error: "Respons JSON tidak valid." };
}
} else {
const textError = await res.text();
// Hanya log jika bukan 401
if (res.status !== 401) {
console.error(`Non-JSON Response (${res.status}):`, textError);
}
data = { error: res.statusText || `Server error (Code ${res.status}). Detail ada di Console.` };
}


if (!res.ok) {
console.error("API Error (Non-2xx):", data);
throw new Error(data.error || "Gagal memuat data dari server");
}
return data;
}

// ===================================
// 📚 Fungsi Utilitas (Load Kelas, Mapel, Tahun)
// ===================================
async function getKelasDariBackend() {
try {
const data = await apiFetch("/kelas");
const daftarKelas = data.kelas || [];
document.querySelectorAll("#kelas-absensi, #kelas-nilai, #rekap-kelas").forEach(sel => {
sel.innerHTML = "<option value=''>--Pilih Kelas--</option>";
daftarKelas.forEach(k => {
const opt = document.createElement("option");
opt.value = k;
opt.textContent = k;
sel.appendChild(opt);
});
});
// Panggil updateRekap untuk kelas pertama saat dashboard dimuat
const rekapKelasEl = document.getElementById("rekap-kelas");
if (rekapKelasEl && daftarKelas.length > 0) {
rekapKelasEl.value = daftarKelas[0];
updateRekap(daftarKelas[0]); 
}

} catch (err) {
console.warn("Tidak bisa ambil kelas dari server.");
}
}

async function getMapelDariBackend() {
try {
const data = await apiFetch("/mapel");
let daftarMapel = data.mapel || [];

if (daftarMapel.length === 0) {
// Jika backend kosong/error, gunakan daftar dummy yang lengkap
daftarMapel = MATA_PELAJARAN_DUMMY.map((nama, index) => ({ id: index + 1, nama_mapel: nama }));
console.warn("Menggunakan daftar mata pelajaran dummy yang lengkap karena backend kosong.");
}

document.querySelectorAll("#mapel-absensi, #mapel-nilai, #rekap-mapel").forEach(sel => {
// Atur opsi default sesuai kebutuhan
sel.innerHTML = `<option value="">--${sel.id.includes('rekap') ? 'Semua Mapel' : 'Pilih Mapel'}--</option>`;
daftarMapel.forEach(m => {
const opt = document.createElement("option");
opt.value = m.id; // Kirim ID Mapel
opt.textContent = m.nama_mapel;
sel.appendChild(opt);
});
});
} catch (err) {
console.warn("Tidak bisa ambil mata pelajaran dari server. Menggunakan daftar dummy.");
// Isi dengan daftar dummy jika terjadi error
const daftarMapel = MATA_PELAJARAN_DUMMY.map((nama, index) => ({ id: index + 1, nama_mapel: nama }));
document.querySelectorAll("#mapel-absensi, #mapel-nilai, #rekap-mapel").forEach(sel => {
sel.innerHTML = `<option value="">--${sel.id.includes('rekap') ? 'Semua Mapel' : 'Pilih Mapel'}--</option>`;
daftarMapel.forEach(m => {
const opt = document.createElement("option");
opt.value = m.id; 
opt.textContent = m.nama_mapel;
sel.appendChild(opt);
});
});
}
}

function populateTahunAjaran() {
const currentYear = new Date().getFullYear();
const select = document.getElementById("rekap-tahun");
if (select) {
let htmlOptions = "<option value=''>--Pilih Tahun--</option>";
for (let i = -2; i < 3; i++) {
const startYear = currentYear + i;
const endYear = startYear + 1;
const optionValue = `${startYear}/${endYear}`;
// Tandai tahun ajaran berjalan sebagai default
const isCurrent = (new Date().getMonth() + 1 >= 7) ? (startYear === currentYear) : (endYear === currentYear);
htmlOptions += `<option value="${optionValue}" ${isCurrent ? 'selected' : ''}>${optionValue}</option>`;
}
select.innerHTML = htmlOptions;
}
}

// ===================================
// 🔄 Load Siswa (Absensi & Nilai)
// ===================================
async function loadSiswaAbsensi() {
const kelas = document.getElementById("kelas-absensi")?.value;
const tbody = document.querySelector("#tabel-absensi tbody");
const totalEl = document.getElementById("total-siswa-absensi"); 

tbody.innerHTML = "";
if (totalEl) totalEl.textContent = '0';
if (!kelas) return;

try {
const data = await apiFetch(`/siswa`, { params: { kelas: kelas } });
const siswaList = data.siswa || [];

let htmlContent = '';
siswaList.forEach(s => {
htmlContent += `
 <tr>
 <td>${s.nama}</td>
 <td>
 <select data-siswa-id="${s.id}" data-siswa-nama="${s.nama}" data-siswa-kelas="${kelas}">
 <option value="Hadir" selected>Hadir</option>
 <option value="Izin">Izin</option>
 <option value="Sakit">Sakit</option>
 <option value="Alpha">Alpha</option>
 </select>
 </td>
 </tr>`;
});
tbody.innerHTML = htmlContent;
if (totalEl) totalEl.textContent = siswaList.length;
} catch (err) {
if(err.message !== "Unauthorized") alert("Gagal memuat data siswa dari server.");
console.error(err);
tbody.innerHTML = `<tr><td colspan="2" class="text-danger">Gagal memuat siswa: ${err.message}</td></tr>`;
}
}

async function loadSiswaNilai() {
const kelas = document.getElementById("kelas-nilai")?.value;
const select = document.getElementById("nama-siswa-nilai");
select.innerHTML = "<option value=''>--Pilih Siswa--</option>";
if (!kelas) return;

try {
const data = await apiFetch(`/siswa`, { params: { kelas: kelas } });
const siswaList = data.siswa || [];
siswaList.forEach(s => {
const opt = document.createElement("option");
opt.value = s.nama;
opt.textContent = s.nama;
select.appendChild(opt);
});
} catch (err) {
if(err.message !== "Unauthorized") alert("Gagal memuat daftar siswa!");
console.error(err);
}
}

// ===================================
// 💾 Simpan Absensi & Nilai
// ===================================
async function simpanSemuaAbsensi() {
const tanggal = document.getElementById("tanggal-absensi")?.value;
const semester = document.getElementById("semester-absensi")?.value;
const kelas = document.getElementById("kelas-absensi")?.value;
const id_mapel = document.getElementById("mapel-absensi")?.value; 

const alertMessageEl = document.getElementById("absensi-alert-message"); 
// TANGANI ERROR 1: Cannot set properties of null (setting 'textContent')
const btnSimpan = document.getElementById("btn-simpan-absensi"); 

// Pastikan elemen alert dan tombol ada sebelum memanipulasinya
if (!alertMessageEl) {
console.error("Elemen 'absensi-alert-message' tidak ditemukan.");
} else {
alertMessageEl.textContent = "";
}

if (!btnSimpan) {
console.error("Elemen 'btn-simpan-absensi' tidak ditemukan.");
// Jika tombol tidak ditemukan, kita tidak bisa melanjutkan, karena tidak bisa menampilkan loading state/error.
return; 
}

// Validasi form sebelum proses
if (!tanggal || !semester || !kelas || !id_mapel) {
alert("Harap lengkapi semua data form (Tanggal, Semester, Kelas, dan Mata Pelajaran) sebelum menyimpan!");
return;
}

const selectElements = document.querySelectorAll("#tabel-absensi tbody tr select");

if (selectElements.length === 0) {
alert("Tidak ada siswa yang dimuat untuk disimpan. Pilih kelas terlebih dahulu.");
return;
}

const dataAbsensi = Array.from(selectElements).map(select => {
return { 
nama: select.dataset.siswaNama, 
kelas: select.dataset.siswaKelas,
tanggal: tanggal, 
semester: semester, 
keterangan: select.value
};
});

// State Loading
btnSimpan.textContent = "Menyimpan...";
btnSimpan.disabled = true;

try {
const res = await apiFetch("/absensi", {
method: "POST",
body: JSON.stringify({ data: dataAbsensi, id_mapel: id_mapel })
});

// Pemberitahuan
alert(res.message || "✅ Absensi berhasil disimpan!");
if (alertMessageEl) alertMessageEl.textContent = "✅ Absensi berhasil disimpan!"; 
loadDashboardChart();

// **PERBAIKAN FINAL RESET FORM ABSENSI:**
// Reset Tanggal, Kelas, Mapel, dan hapus tabel siswa
document.getElementById("tanggal-absensi").value = '';
document.getElementById("kelas-absensi").value = ''; 
document.getElementById("mapel-absensi").value = ''; 
document.querySelector("#tabel-absensi tbody").innerHTML = ''; // Mengosongkan tabel siswa
document.getElementById("total-siswa-absensi").textContent = '0'; // Mereset total siswa

} catch (err) {
if(err.message !== "Unauthorized") {
const msg = "❌ Gagal menyimpan absensi! Cek Console (F12) untuk detail error.";
// PERBAIKAN: Jika alertMessageEl null, console.error sudah cukup.
alert(msg);
if (alertMessageEl) alertMessageEl.textContent = msg;
}
console.error("Error Absensi Submit:", err);
} finally {
// Reset state loading
btnSimpan.textContent = "Simpan Semua Absensi";
btnSimpan.disabled = false;
}
}
// Tambahkan simpanSemuaAbsensi ke window agar bisa diakses dari HTML
window.simpanSemuaAbsensi = simpanSemuaAbsensi;


async function simpanSemuaNilai() {
const kelas = document.getElementById("kelas-nilai")?.value;
const siswa = document.getElementById("nama-siswa-nilai")?.value;
const semester = document.getElementById("semester-nilai")?.value || "Ganjil"; 
const id_mapel = document.getElementById("mapel-nilai")?.value;

const harian = parseInt(document.getElementById("harian-nilai")?.value) || 0;
const tugas = parseInt(document.getElementById("tugas-nilai")?.value) || 0;
const uts = parseInt(document.getElementById("uts-nilai")?.value) || 0;
const uas = parseInt(document.getElementById("uas-nilai")?.value) || 0;

const alertMessageEl = document.getElementById("nilai-alert-message");
if (alertMessageEl) alertMessageEl.textContent = ""; 

// Dapatkan tombol simpan nilai
const btnSimpan = document.getElementById("btn-simpan-nilai");
if (!btnSimpan) {
console.error("Elemen 'btn-simpan-nilai' tidak ditemukan.");
return;
}

if (!kelas || !siswa || !id_mapel) {
alert("Lengkapi semua data form (Kelas, Siswa, dan Mata Pelajaran)!");
return;
}

if (harian < 0 || tugas < 0 || uts < 0 || uas < 0) {
alert("Input nilai tidak boleh bernilai negatif!");
return;
}

// State Loading
btnSimpan.textContent = "Menyimpan...";
btnSimpan.disabled = true;

try {
const res = await apiFetch("/nilai", {
method: "POST",
body: JSON.stringify({ 
kelas, siswa, id_mapel, semester, 
harian, tugas, uts, uas
})
});

// Pemberitahuan
alert(res.message || "✅ Nilai berhasil disimpan!"); 
if (alertMessageEl) alertMessageEl.textContent = "✅ Nilai berhasil disimpan!";

// Kosongkan Form Nilai (hanya bagian nilai)
document.getElementById("harian-nilai").value = '';
document.getElementById("tugas-nilai").value = '';
document.getElementById("uts-nilai").value = '';
document.getElementById("uas-nilai").value = '';

loadDashboardChart();

} catch (err) {
if(err.message !== "Unauthorized") {
const msg = "❌ Gagal menyimpan nilai! Cek Console (F12) untuk detail error.";
alert(msg);
if (alertMessageEl) alertMessageEl.textContent = msg;
}
console.error("Error Nilai Submit:", err);
} finally {
// Reset state loading
btnSimpan.textContent = "Simpan Nilai";
btnSimpan.disabled = false;
}
}
// Tambahkan simpanSemuaNilai ke window agar bisa diakses dari HTML
window.simpanSemuaNilai = simpanSemuaNilai;

// ===================================
// 📊 Rekap Data & Chart
// ===================================
let dashboardChart;

async function loadDashboardChart() {
try {
const data = await apiFetch("/rekap/dashboard");

// TANGANI ERROR 2: data.rata_nilai?.toFixed is not a function
// Pastikan data.rata_nilai dikonversi ke number. 
// Jika null/undefined/string, Number() akan mencoba mengkonversi atau menghasilkan NaN.
const rataNilai = Number(data.rata_nilai) || 0;
const persenHadir = Number(data.persen_hadir) || 0;


document.getElementById("total-siswa-dashboard").textContent = data.total_siswa || 0;
document.getElementById("rata-nilai-dashboard").textContent = rataNilai.toFixed(2);
document.getElementById("persen-hadir-dashboard").textContent = persenHadir.toFixed(2) + "%";

const ctx = document.getElementById("chart-dashboard")?.getContext("2d");
if (!ctx) return;

if (dashboardChart) dashboardChart.destroy();

if (typeof Chart === 'undefined') {
console.error("Library Chart.js belum dimuat!");
return;
}

dashboardChart = new Chart(ctx, {
type: "bar",
data: {
labels: data.labels || [],
datasets: [
{
label: "Rata-rata Nilai",
data: data.nilai || [],
backgroundColor: "rgba(54, 162, 235, 0.6)",
yAxisID: 'y-nilai'
},
{
label: "Persentase Hadir",
data: data.hadir || [],
backgroundColor: "rgba(75, 192, 192, 0.6)",
yAxisID: 'y-hadir'
}
]
},
options: {
responsive: true,
plugins: {
legend: { position: "top" },
title: { display: true, text: "Dashboard Rekap Siswa" }
},
scales: {
'y-nilai': {
type: 'linear',
position: 'left',
beginAtZero: true,
max: 100,
title: { display: true, text: 'Nilai Rata-Rata' }
},
'y-hadir': {
type: 'linear',
position: 'right',
beginAtZero: true,
max: 100,
title: { display: true, text: 'Persentase Hadir (%)' },
grid: { drawOnChartArea: false }
}
}
}
});

} catch (err) {
console.warn("Gagal memuat dashboard chart.", err);
// Reset dashboard stats jika gagal
document.getElementById("total-siswa-dashboard").textContent = 'N/A';
document.getElementById("rata-nilai-dashboard").textContent = 'N/A';
document.getElementById("persen-hadir-dashboard").textContent = 'N/A';
}
}
// Tambahkan loadDashboardChart ke window agar bisa diakses dari HTML
window.loadDashboardChart = loadDashboardChart;

/**
 * Memuat dan menampilkan rekap absensi dan nilai berdasarkan filter.
 * Menggabungkan semua filter yang ada (Kelas, Semester, Mapel, Tahun, Bulan).
 */
async function updateRekap(kelas) {
const tbody = document.querySelector("#tabel-rekap tbody");
const hariEfektifEl = document.getElementById("rekap-hari-efektif");

tbody.innerHTML = "<tr><td colspan='9'>Memuat data...</td></tr>"; 
if (hariEfektifEl) hariEfektifEl.textContent = '0';

if (!kelas) {
tbody.innerHTML = "<tr><td colspan='9'>Pilih Kelas untuk menampilkan rekap.</td></tr>";
return;
}

// Ambil nilai filter
const semester = document.getElementById("rekap-semester")?.value || "";
const id_mapel = document.getElementById("rekap-mapel")?.value || "";
const tahun_ajaran = document.getElementById("rekap-tahun")?.value || "";
const bulan = document.getElementById("rekap-bulan")?.value || "";

try {
const data = await apiFetch(`/rekap`, { 
params: {
kelas,
semester,
id_mapel,
tahun: tahun_ajaran,
bulan
}
});
const rekapList = data.rekap || [];

if (hariEfektifEl) hariEfektifEl.textContent = data.hari_efektif || 0;
// Gunakan minimal 1 untuk menghindari error pembagian nol
const hariEfektif = data.hari_efektif || 1; 

let htmlContent = '';
if (rekapList.length === 0) {
htmlContent = "<tr><td colspan='9'>Tidak ada data ditemukan untuk filter ini.</td></tr>";
} else {
rekapList.forEach(r => {
// Perhitungan Absensi
// Total Absensi adalah total Hadir + Sakit + Izin + Alpha
const totalAbsensiHari = r.total_hadir + r.total_sakit + r.total_izin + r.total_alpha;

let persentaseHadir = 0;
if (totalAbsensiHari > 0) {
// Persentase Hadir = Hadir / Total Absensi Siswa
persentaseHadir = ((r.total_hadir / totalAbsensiHari) * 100).toFixed(2);
}

let alphaRate = 0;
if (hariEfektif > 0) {
// Alpha Rate = Total Alpha Siswa / Total Hari Efektif Kelas (Ini yang Anda cari untuk melihat persentase Alpha global)
alphaRate = ((r.total_alpha / hariEfektif) * 100).toFixed(2);
}

// Pastikan r.rata_rata adalah numerik atau konversi string ke float
const rataRataDisplay = r.rata_rata !== null && r.rata_rata !== undefined
? parseFloat(r.rata_rata).toFixed(2)
: "-";


htmlContent += `
 <tr>
 <td>${r.nama}</td>
 <td>${r.nama_mapel || 'Semua Mapel'}</td>
 <td class="${rataRataDisplay === '-' ? 'text-muted' : ''}">${rataRataDisplay}</td>
 <td>${r.total_sakit || 0}</td>
 <td>${r.total_izin || 0}</td>
 <td>${r.total_alpha || 0}</td>
 <td>${r.total_hadir || 0}</td>
 <td>${persentaseHadir}%</td>
 <td>${alphaRate}%</td>
 </tr>`;
});
}

tbody.innerHTML = htmlContent;
} catch (err) {
const errorMsg = err.message === "Unauthorized" 
 ? "Sesi habis/belum login. Silakan coba login ulang." 
 : `Gagal memuat data. Detail: ${err.message}`;

console.warn("Gagal memuat rekap dari server:", err.message);
console.error(err);
tbody.innerHTML = `<tr><td colspan='9'>❌ ${errorMsg}</td></tr>`;
}
}
// Tambahkan updateRekap ke window agar bisa diakses dari HTML
window.updateRekap = updateRekap;

// ===================================
// ⬇️ Download Excel
// ===================================
function downloadRekapExcel() {
const kelas = document.getElementById("rekap-kelas")?.value;
const mapelNameEl = document.getElementById("rekap-mapel");
const mapelName = mapelNameEl?.options[mapelNameEl.selectedIndex]?.textContent;

if (!kelas) {
alert("Harap pilih Kelas di Rekap terlebih dahulu untuk mengunduh data yang difilter.");
return;
}

const table = document.getElementById("tabel-rekap");
const hariEfektif = document.getElementById("rekap-hari-efektif")?.textContent || 0; 

if (!table || table.rows.length <= 1 || table.rows[1].cells[0].innerText.includes('Tidak ada data') || table.rows[1].cells[0].innerText.includes('Gagal memuat data')) {
alert("Tidak ada data valid ditemukan di tabel rekap. Pilih kelas dan filter terlebih dahulu.");
return;
}

const headerRow = table.querySelector('thead tr');
const header = Array.from(headerRow.cells).map(cell => cell.textContent);
header.push("Jumlah Hari Efektif"); 

const data = [header];

for (let r = 1; r < table.rows.length; r++) { 
const row = [];
// Ambil semua kolom data (9 kolom)
for (let c = 0; c < table.rows[r].cells.length; c++) { 
if(table.rows[r].cells[c]) {
 row.push(table.rows[r].cells[c].innerText);
}
}
if(row.length > 0) {
row.push(hariEfektif); // Tambahkan hari efektif
data.push(row);
}
}

if (typeof XLSX === 'undefined') {
alert("Library XLSX (SheetJS) belum dimuat! Pastikan Anda memuat file js/xlsx.full.min.js.");
return;
}

const mapelLabel = mapelName ? mapelName.replace(/[^a-zA-Z0-9]/g, '_') : 'SemuaMapel';
const filename = `rekap_${kelas}_${mapelLabel}.xlsx`;

const worksheet = XLSX.utils.aoa_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap-${kelas}`);
XLSX.writeFile(workbook, filename);
}
window.downloadRekapExcel = downloadRekapExcel;

// ===================================
// 🚪 Logout
// ===================================
function logout(isForce = false) {
// PERBAIKAN: Mengganti window.confirm() dengan console.log() dan hanya logout jika isForce=true
if (isForce || confirm("Yakin ingin logout?")) {
localStorage.removeItem("token");
window.location.href = "index.html"; 
}
}
window.logout = logout;

// ===================================
// 🔄 Navigasi antar Form
// ===================================
function navigateToSection(id, linkEl) {
document.querySelectorAll(".page-section").forEach(sec => {
sec.classList.add("hidden");
sec.classList.remove("active", "fade-in");
});

const section = document.getElementById(id);
if (section) {
section.classList.remove("hidden");
section.classList.add("fade-in", "active");
document.getElementById("section-title").textContent = section.querySelector("h2").textContent;
}

document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
if (linkEl) linkEl.classList.add("active");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const toggleBtn = document.getElementById("toggle-sidebar");

// Sembunyikan sidebar setelah navigasi (khusus mobile)
if (sidebar?.classList.contains("open")) {
sidebar.classList.remove("open");
overlay.classList.remove("show");
if (toggleBtn) toggleBtn.style.transform = "translateX(0)";
}

if (id === 'rekap-section') {
const kelasInput = document.getElementById('rekap-kelas');
// Panggil updateRekap di sini saat masuk ke halaman rekap
if (kelasInput?.value) updateRekap(kelasInput.value);
}
}
window.navigateToSection = navigateToSection;

// ===================================
// 🚀 Inisialisasi Event Listener
// ===================================
document.addEventListener("DOMContentLoaded", () => {
// =======================
// 🌄 Efek Parallax
// =======================
window.addEventListener("scroll", () => {
const bg = document.querySelector(".background-parallax");
if (bg) bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});

// =======================
// 🎛️ Toggle Sidebar (Desktop + Mobile)
// =======================
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const toggleBtn = document.getElementById("toggle-sidebar"); 

if (toggleBtn && sidebar && overlay) {
// Inisialisasi tampilan awal tombol
toggleBtn.style.opacity = "0.8"; 
toggleBtn.addEventListener("click", () => {
const isOpen = sidebar.classList.toggle("open");
overlay.classList.toggle("show", isOpen);
toggleBtn.style.transform = isOpen ? "translateX(180px)" : "translateX(0)";
toggleBtn.style.opacity = isOpen ? "1" : "0.8";
});
}

if (overlay && sidebar) {
overlay.addEventListener("click", () => {
sidebar.classList.remove("open");
overlay.classList.remove("show");
if (toggleBtn) toggleBtn.style.transform = "translateX(0)";
});
}


// =======================
// 🛠️ Pemuatan Data Awal
// =======================
getKelasDariBackend();
getMapelDariBackend();
populateTahunAjaran();
loadDashboardChart(); 

// =======================
// 🖱️ Event Listener Submit
// =======================
document.getElementById("btn-simpan-absensi")?.addEventListener("click", simpanSemuaAbsensi);
document.getElementById("btn-simpan-nilai")?.addEventListener("click", simpanSemuaNilai);

// =======================
// 🖱️ Event Listener Filter Rekap (Semua filter memanggil updateRekap)
// =======================
document.getElementById("rekap-kelas")?.addEventListener("change", (e) => updateRekap(e.target.value));

// Semua filter lain memanggil updateRekap dengan nilai kelas yang sama
const rekapFilters = ["rekap-semester", "rekap-mapel", "rekap-tahun", "rekap-bulan"];
rekapFilters.forEach(id => {
document.getElementById(id)?.addEventListener("change", () => {
const kelas = document.getElementById("rekap-kelas")?.value;
if (kelas) updateRekap(kelas);
});
});

// =======================
// 🖱️ Event Listener Load Siswa
// =======================
document.getElementById("kelas-absensi")?.addEventListener("change", loadSiswaAbsensi);
document.getElementById("kelas-nilai")?.addEventListener("change", loadSiswaNilai);

});


// ===================================
// Global Exposure (agar bisa dipanggil dari HTML)
// ===================================
// Hanya perlu diexpose di window jika tidak dipanggil via EventListener langsung
// window.simpanSemuaAbsensi = simpanSemuaAbsensi; // Sudah di dalam fungsi
// window.simpanSemuaNilai = simpanSemuaNilai;  // Sudah di dalam fungsi
// window.updateRekap = updateRekap; // Sudah di dalam fungsi
window.loadSiswaAbsensi = loadSiswaAbsensi;
window.loadSiswaNilai = loadSiswaNilai;
// window.downloadRekapExcel sudah diexpose di baris 494
// window.logout sudah diexpose di baris 510
