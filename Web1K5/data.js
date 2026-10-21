/* =====================================================================
   DATA.JS — SATU-SATUNYA FILE YANG PERLU KAMU EDIT UNTUK ISI WEBSITE
   Aturan: jangan hapus tanda kutip " ", koma , dan kurung [ ] { }.
   Foto yang belum ada otomatis diganti gambar placeholder.
   ===================================================================== */

// ---------------------------------------------------------------------
// 1. FOLDER FOTO (taruh file foto di folder ini, sejajar dengan index.html)
// ---------------------------------------------------------------------
const FOLDER_ANGGOTA = "gambar/anggota/";
const FOLDER_TANAMAN = "gambar/tanaman/";
const FOLDER_DOK     = "gambar/dokumentasi/";

// ---------------------------------------------------------------------
// 2. PENGATURAN PROJECT
// ---------------------------------------------------------------------
const START = new Date(2026, 7, 31); // 31 Agustus 2026 (bulan dihitung dari 0: Agustus = 7)
const LAST_WEEK = 12;                // minggu terakhir
const MAX_DATA_WEEK = 5;             // data tersedia sampai minggu ini (naikkan jika minggu 5 sudah berlangsung)

// ---------------------------------------------------------------------
// 3. ANGGOTA (6 orang)
// Format tiap baris: ["Nama", "Peran", "Deskripsi singkat", "namafile-foto.jpg"]
// Kosongkan foto dengan "" jika belum ada. Foto disimpan di gambar/anggota/
// ---------------------------------------------------------------------
const MEMBERS = [
  ["Iffat Khoerul Mu'minin", "Ketua Kelompok", "Absen No. 28", "Iffat.jpg"],
  ["Keanu Ragil Triananda", "Sekertaris", "Absen No. 30", "Keanu.jpg"],
  ["Haris Maidani", "Bendahara", "Absen No. 26", "Haris.jpg"],
  ["Jyotis Varuna", "Anggota", "Absen No. 29", "Jyotis.jpg"],
  ["Haryono Oktana", "Anggota", "Absen No. 27", "Haryono.jpg"],
  ["Hafiz Setya", "Anggota", "Absen No. 25", "Hafiz.jpg"]
];

// ---------------------------------------------------------------------
// 4. DOKUMENTASI
// Format tiap baris: ["kategori", "Keterangan foto", "namafile.jpg"]
// kategori harus salah satu: "mawar", "melati", "project", "kegiatan"
// Foto disimpan di gambar/dokumentasi/
// Mau tambah foto? Salin satu baris, tempel di bawahnya, ganti isinya.
// ---------------------------------------------------------------------
const DOCS = [
  ["Kegiatan",    "Penyiraman",          "dok26.jpg"],
  ["mawar",   "Mawar",         "mawa.jpg"],
  ["melati",   "Melati",           "melati.jpg"],
  ["project",  "Penyusunan Website dan Blog",    "dok28.jpg"],
  ["project",  "Penanaman",    "dok12.jpg"],
  ["project",  "Penanaman",    "dok3.jpg"],
  ["project",  "Pembuatan Vidio Narasi B. Inggris",    "dok22.jpg"],
  ["project",  "Presentasi B. Inggris",    "dok21.jpg"],
  ["project",  "Pengisian LKPD Matematika",    "dok23.jpg"],
  ["project",  "Pengukuran Lahan",    "dok2.jpg"],
  ["project",  "Pengukuran Lahan",    "dok6.jpg"],
  ["project",  "QR Code Blog Kami",    "dok27.jpg"],
  ["kegiatan", "Pemupukan",    "dok20.jpg"],
  ["kegiatan", "Penyiraman",    "dok17.jpg"],
  ["kegiatan", "Penyiraman",    "dok15.jpg"],
  ["kegiatan", "Penyiraman",    "dok13.jpg"],
  ["kegiatan", "Penyiraman",    "dok10.jpg"],
  ["kegiatan", "Penyiraman",    "dok25.jpg"],
];

// ---------------------------------------------------------------------
// 5. TANAMAN
// image = foto kartu tanaman di gambar/tanaman/ ("" jika belum ada)
// sample = DATA CONTOH jurnal minggu 0–4. GANTI dengan hasil pengamatan asli.
// Jangan isi minggu 5–12.
// ---------------------------------------------------------------------
const plants = {
  mawar: {
    name: "Mawar", icon: "🌹", color: "#b83a52", image: "mawar.jpg",
    desc: "Tanaman berbunga berduri dengan bunga berlapis kelopak.",
    initial: "Tanaman kecil yang sudah tumbuh, mulai dirawat pada hari pertaman",
    traits: "Menyukai sinar matahari pagi, media gembur, dan penyiraman teratur.",
    sample: [
      { week: 0, height: 18,   leaves: 6,  condition: "Sehat", activity: "Pengukuran awal", note: "Data awal tanaman kecil (contoh)" },
      { week: 1, height: 16, leaves: 8,  condition: "Layu", activity: "Penyiraman", note: "Contoh" },
      { week: 2, height: 19,   leaves: 11, condition: "Cukup sehat", activity: "Pembersihan area", note: "Contoh" },
      { week: 3, height: 24, leaves: 14, condition: "Sehat", activity: "Pemberian pupuk", note: "Contoh" },
      { week: 4, height: 30, leaves: 17, condition: "Sangat sehat", activity: "Pembersihan area", note: "Contoh" },
      { week: 5, height: 31, leaves: 17, condition: "Sangat sehat", activity: "Penyiraman", note: "Contoh" }
    ]
  },
  melati: {
    name: "Melati", icon: "🌼", color: "#b99a3a", image: "melati.jpg",
    desc: "Tanaman perdu beraroma harum dengan bunga putih kecil.",
    initial: "Tanaman kecil yang sudah tumbuh, mulai dirawat pada hari pertama",
    traits: "Menyukai cahaya cukup, tanah lembap tidak tergenang, dan pemangkasan ringan.",
    sample: [
      { week: 0, height: 7,    leaves: 8,  condition: "Sehat", activity: "Pengukuran awal", note: "Data awal tanaman kecil (contoh)" },
      { week: 1, height: 9, leaves: 10, condition: "Sehat", activity: "Penyiraman", note: "Contoh" },
      { week: 2, height: 11, leaves: 13, condition: "Sehat", activity: "Pembersihan area", note: "Contoh" },
      { week: 3, height: 15, leaves: 15, condition: "Cukup sehat", activity: "Pemberian pupuk", note: "Contoh" },
      { week: 4, height: 17, leaves: 18, condition: "Sehat", activity: "Pembersihan area", note: "Contoh" },
      { week: 5, height: 19, leaves: 18, condition: "Sehat", activity: "Penyiraman", note: "Contoh" }
    ]
  }
};

// ---------------------------------------------------------------------
// 6. CHECKLIST PERAWATAN (berlaku untuk Mawar dan Melati)
// ---------------------------------------------------------------------
const tasks = [
  "Penyiraman",
  "Pemberian pupuk",
  "Pemeriksaan media tanam",
  "Pembersihan area tanaman",
  "Dokumentasi kondisi tanaman"
];