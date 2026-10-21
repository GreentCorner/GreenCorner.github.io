document.addEventListener("DOMContentLoaded", () => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ========================================
// DATA DIAMBIL DARI data.js (edit data di file itu)
// ========================================
const keys = Object.keys(plants);
const members = MEMBERS.map(([name, role, desc, image]) => ({ name, role, desc, image: image ? FOLDER_ANGGOTA + image : "" }));
const docs = DOCS.map(([tag, cap, file]) => ({ tag, cap, src: file ? FOLDER_DOK + file : "" }));
const tagColor = { mawar: "#b83a52", melati: "#d9c27a", project: "#2f6b45", kegiatan: "#5a7fa0" };
const tagIcon = { mawar: "🌹", melati: "🌼", project: "💻", kegiatan: "🌱" };
const ph = d => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='${tagColor[d.tag] || "#2f6b45"}'/><text x='400' y='320' font-size='110' text-anchor='middle'>${tagIcon[d.tag] || "🌱"}</text><text x='400' y='480' font-size='34' fill='white' text-anchor='middle' font-family='sans-serif'>${d.cap.replace(/[<>&']/g, "")}</text></svg>`);
const imgOf = d => d.src || ph(d);

// ========================================
// UTIL: tanggal, toast, storage
// ========================================
const weekDate = w => new Date(START.getFullYear(), START.getMonth(), START.getDate() + w * 7);
const fmt = d => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let tt;
function toast(msg) { const t = $("#toast"); t.textContent = "✓ " + msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2200); }

// ========================================
// LOCAL STORAGE
// ========================================
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const jKey = k => "greatCorner_jurnal_" + k;
const cKey = k => "greatCorner_check_" + k;
const journal = {};
keys.forEach(k => journal[k] = store.get(jKey(k), plants[k].sample.map(x => ({ ...x }))));
const sorted = k => [...journal[k]].sort((a, b) => a.week - b.week);

// ========================================
// NAVBAR, TEMA, SCROLL
// ========================================
const menu = $("#menu"), burger = $("#burger");
burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
$$("[data-go]").forEach(b => b.onclick = () => $(b.dataset.go).scrollIntoView({ behavior: "smooth" }));

const navObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$("#menu a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section").forEach(s => navObs.observe(s));
const rvObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } }), { threshold: .08 });
$$(".sec .card, .sec h2").forEach(el => { el.classList.add("rv"); rvObs.observe(el); });

function setTheme(dark, announce) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $("#themeBtn").textContent = dark ? "☀️" : "🌙";
  store.set("greatCorner_dark", dark);
  if (window.Chart) { Chart.defaults.color = dark ? "#cfe0d2" : "#3b4d3f"; Chart.defaults.borderColor = dark ? "#2c3f31" : "#d8e0cd"; if (charts.mawar) renderCharts(); }
  if (announce) toast(dark ? "Tema gelap aktif." : "Tema terang aktif.");
}
$("#themeBtn").onclick = () => setTheme(document.documentElement.dataset.theme !== "dark", true);

// ========================================
// ANGGOTA & TANAMAN
// ========================================
$("#team").innerHTML = members.map(m => `<article class="card"><div class="avatar">${m.image ? `<img src="${esc(m.image)}" alt="Foto ${esc(m.name)}" onerror="this.replaceWith('🌱')">` : "🌱"}</div><h3>${esc(m.name)}</h3><strong>${esc(m.role)}</strong><p>${esc(m.desc)}</p></article>`).join("");
$("#plantCards").innerHTML = keys.map(k => { const p = plants[k]; return `<article class="card plant ${k}"><div class="art" role="img" aria-label="Ilustrasi ${p.name}">${p.image ? `<img src="${esc(FOLDER_TANAMAN + p.image)}" alt="Foto ${p.name}" onerror="this.remove()">` : ""}<span>${p.icon}</span></div><div class="body"><h3>${p.icon} ${p.name}</h3><p>${p.desc}</p><p><strong>Kondisi awal:</strong> ${p.initial}</p><button class="btn" data-plant="${k}">Lihat Detail</button></div></article>`; }).join("");

// ========================================
// MODAL
// ========================================
const modal = $("#modal");
let lastFocus;
function openModal(k) {
  const p = plants[k], d = sorted(k), last = d[d.length - 1];
  lastFocus = document.activeElement;
  $("#mBody").innerHTML = `<h3 id="mTitle">${p.icon} ${p.name}</h3>
  <p><strong>Kondisi awal:</strong> ${p.initial}</p>
  <p><strong>Tanggal mulai:</strong> ${fmt(START)}</p>
  <p><strong>Pemantauan:</strong> Minggu 0–${LAST_WEEK} (data tersedia sampai Minggu ${MAX_DATA_WEEK})</p>
  <p><strong>Karakteristik:</strong> ${p.traits}</p>
  <p><strong>Data terbaru:</strong> ${last ? `Minggu ${last.week}: ${last.height} cm, ${last.leaves} daun, ${esc(last.condition)}` : "Belum ada data."}</p>
  <p><strong>Perawatan:</strong> ${progress(k)}% checklist selesai</p>`;
  modal.hidden = false; $(".close", modal).focus();
}
function closeAll() { modal.hidden = true; $("#lightbox").hidden = true; if (lastFocus) lastFocus.focus(); }
$("#plantCards").addEventListener("click", e => { const b = e.target.closest("[data-plant]"); if (b) openModal(b.dataset.plant); });
$$("[data-close]").forEach(b => b.onclick = closeAll);
modal.addEventListener("click", e => { if (e.target === modal) closeAll(); });
$("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeAll(); });

// ========================================
// TIMELINE
// ========================================
let selWeek = MAX_DATA_WEEK;
function renderWeeks() {
  $("#weeks").innerHTML = Array.from({ length: LAST_WEEK + 1 }, (_, w) => `<button class="wk ${w <= MAX_DATA_WEEK ? "ok" : "no"} ${w === selWeek ? "sel" : ""}" data-w="${w}" role="tab" aria-selected="${w === selWeek}">Minggu ${w}</button>`).join("");
  const w = selWeek, s = weekDate(w), e = weekDate(w + 1); e.setDate(e.getDate() - 1);
  let body;
  if (w <= MAX_DATA_WEEK) {
    body = keys.map(k => { const r = journal[k].find(x => x.week === w); return `<p>${plants[k].icon} <strong>${plants[k].name}:</strong> ${r ? `${r.height} cm · ${r.leaves} daun · ${esc(r.condition)}` : "Belum dicatat di jurnal."}</p>`; }).join("");
    body = `<p>${w === 0 ? "Data awal tanaman kecil." : "Data pertumbuhan tersedia."}</p>` + body;
  } else body = "<p>Data belum tersedia — minggu ini belum berlangsung. Data pertumbuhan akan tersedia setelah minggu ini berlangsung.</p>";
  $("#weekInfo").innerHTML = `<h3>Minggu ${w}</h3><p>${fmt(s)} – ${fmt(e)}</p>${body}`;
}
$("#weeks").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (b) { selWeek = +b.dataset.w; renderWeeks(); } });

// ========================================
// STATISTIK
// ========================================
function renderStats() {
  $("#stats").innerHTML = keys.map(k => {
    const d = sorted(k), f = d[0], l = d[d.length - 1];
    const v = (a, b) => `<div><b>${a}</b>${b}</div>`;
    return `<div class="card"><h3>${plants[k].icon} ${plants[k].name}</h3><div class="stat">${f ? v(f.height + " cm", "Tinggi awal") + v(l.height + " cm", "Tinggi terbaru") + v("+" + (l.height - f.height).toFixed(1) + " cm", "Pertambahan") + v(l.leaves, "Daun terbaru") : "<p>Belum ada data.</p>"}</div></div>`;
  }).join("");
}

// ========================================
// JURNAL (CRUD)
// ========================================
let jPlant = "mawar";
const form = $("#jForm");
$("#jTabs").innerHTML = keys.map(k => `<button class="tab" data-k="${k}">${plants[k].icon} Jurnal ${plants[k].name}</button>`).join("");
$("#jTabs").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { jPlant = b.dataset.k; renderJournal(); } });
function renderJournal() {
  $$("#jTabs .tab").forEach(b => b.classList.toggle("sel", b.dataset.k === jPlant));
  const d = sorted(jPlant);
  $("#jBody").innerHTML = d.length ? d.map(r => `<tr><td>${r.week}</td><td>${fmt(weekDate(r.week))}</td><td>${r.height} cm</td><td>${r.leaves}</td><td>${esc(r.condition)}</td><td>${esc(r.activity)}</td><td>${esc(r.note || "-")}</td><td><button class="btn sm" data-edit="${r.week}">Edit</button> <button class="btn sm danger" data-del="${r.week}">Hapus</button></td></tr>`).join("") : `<tr><td colspan="8">Belum ada jurnal. Klik "Tambah Jurnal".</td></tr>`;
}
function persist(k) { store.set(jKey(k), journal[k]); renderJournal(); renderStats(); renderWeeks(); renderCharts(); }
function openForm(r) {
  form.hidden = false; form.reset(); $("#fPlant").value = jPlant;
  if (r) { $("#fWeek").value = r.week; $("#fH").value = r.height; $("#fL").value = r.leaves; $("#fC").value = r.condition; $("#fA").value = r.activity; $("#fN").value = r.note || ""; $("#fDate").value = iso(weekDate(r.week)); }
  $("#fWeek").focus();
}
$("#addJ").onclick = () => openForm();
$("#cancelJ").onclick = () => form.hidden = true;
$("#fWeek").addEventListener("input", e => { const w = +e.target.value; $("#fDate").value = e.target.value !== "" && w >= 0 && w <= LAST_WEEK ? iso(weekDate(w)) : ""; });
form.addEventListener("submit", e => {
  e.preventDefault();
  const k = $("#fPlant").value, wRaw = $("#fWeek").value, w = +wRaw;
  const h = parseFloat($("#fH").value), l = parseInt($("#fL").value, 10), a = $("#fA").value.trim();
  $$("input", form).forEach(i => i.classList.remove("bad"));
  if (wRaw === "" || !Number.isInteger(w) || w < 0 || w > LAST_WEEK) { $("#fWeek").classList.add("bad"); return toast("Minggu harus 0–12."); }
  if (w > MAX_DATA_WEEK) { $("#fWeek").classList.add("bad"); return toast(`Minggu ${w} belum dapat dicatat — belum berlangsung.`); }
  if (!(h >= 0)) { $("#fH").classList.add("bad"); return toast("Isi tinggi tanaman dengan benar."); }
  if (!(l >= 0)) { $("#fL").classList.add("bad"); return toast("Isi jumlah daun dengan benar."); }
  if (!a) { $("#fA").classList.add("bad"); return toast("Isi aktivitas perawatan."); }
  const rec = { week: w, height: h, leaves: l, condition: $("#fC").value, activity: a, note: $("#fN").value.trim() };
  const i = journal[k].findIndex(x => x.week === w);
  if (i >= 0) journal[k][i] = rec; else journal[k].push(rec);
  jPlant = k; persist(k); form.hidden = true;
  toast(i >= 0 ? "Data berhasil diperbarui." : "Jurnal berhasil disimpan.");
});
$("#jBody").addEventListener("click", e => {
  const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
  if (ed) openForm(journal[jPlant].find(x => x.week === +ed.dataset.edit));
  if (del && confirm("Hapus jurnal minggu " + del.dataset.del + "?")) { journal[jPlant] = journal[jPlant].filter(x => x.week !== +del.dataset.del); persist(jPlant); toast("Jurnal berhasil dihapus."); }
});
$("#resetJ").onclick = () => {
  if (!confirm("Kembalikan jurnal " + plants[jPlant].name + " ke data contoh awal?")) return;
  store.del(jKey(jPlant)); journal[jPlant] = plants[jPlant].sample.map(x => ({ ...x })); persist(jPlant); toast("Jurnal direset.");
};

// ========================================
// GRAFIK--
// ========================================
const charts = {};
function renderCharts() {
  if (!window.Chart) return;
  keys.forEach(k => {
    const d = sorted(k), data = {
      labels: d.map(r => "Minggu " + r.week),
      datasets: [{ label: `Tinggi ${plants[k].name} (cm)`, data: d.map(r => r.height), borderColor: plants[k].color, backgroundColor: plants[k].color + "33", fill: true, tension: .3, pointRadius: 5 }]
    };
    if (charts[k]) { charts[k].data = data; charts[k].update(); return; }
    charts[k] = new Chart($("#chart" + plants[k].name).getContext("2d"), {
      type: "line", data,
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: "Minggu" } }, y: { title: { display: true, text: "Tinggi tanaman (cm)" }, beginAtZero: true } },
        plugins: { tooltip: { callbacks: { afterLabel: c => { const p = c.dataIndex > 0 ? c.dataset.data[c.dataIndex] - c.dataset.data[c.dataIndex - 1] : 0; return "Pertumbuhan: +" + p.toFixed(1) + " cm"; } } } } }
    });
  });
}

// ========================================
// CHECKLIST & PROGRESS
// ========================================
const checks = {};
keys.forEach(k => checks[k] = store.get(cKey(k), tasks.map(() => false)));
const progress = k => Math.round(checks[k].filter(Boolean).length / tasks.length * 100);
function renderChecks() {
  $("#checks").innerHTML = keys.map(k => `<div class="card"><h3>${plants[k].icon} Perawatan ${plants[k].name}</h3>${tasks.map((t, i) => `<label class="ck ${checks[k][i] ? "done" : ""}"><input type="checkbox" data-k="${k}" data-i="${i}" ${checks[k][i] ? "checked" : ""}><span>${t}</span></label>`).join("")}<div class="bar"><i style="width:${progress(k)}%"></i></div><strong>Progress Perawatan ${plants[k].name} — ${progress(k)}%</strong></div>`).join("");
}
$("#checks").addEventListener("change", e => {
  const c = e.target; if (!c.dataset.k) return;
  checks[c.dataset.k][+c.dataset.i] = c.checked; store.set(cKey(c.dataset.k), checks[c.dataset.k]); renderChecks(); toast("Checklist diperbarui.");
});

// ========================================
// DOKUMENTASI & LIGHTBOX
// ========================================
let filter = "semua", view = [], idx = 0;
const labels = { semua: "Semua", mawar: "Mawar", melati: "Melati", project: "Project", kegiatan: "Kegiatan" };
$("#dFilters").innerHTML = Object.keys(labels).map(f => `<button class="tab" data-f="${f}">${labels[f]}</button>`).join("");
function renderGallery() {
  $$("#dFilters .tab").forEach(b => b.classList.toggle("sel", b.dataset.f === filter));
  view = docs.filter(d => filter === "semua" || d.tag === filter);
  $("#gallery").innerHTML = view.map((d, i) => `<button class="card shot" data-i="${i}" aria-label="Buka foto: ${esc(d.cap)}"><img src="${esc(imgOf(d))}" data-ph="${ph(d)}" onerror="this.onerror=null;this.src=this.dataset.ph" alt="${esc(d.cap)}" loading="lazy"><span>${esc(d.cap)}</span></button>`).join("");
}
$("#dFilters").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; renderGallery(); } });
function showLb() { const d = view[idx]; { const li = $("#lbImg"); li.onerror = () => { li.onerror = null; li.src = ph(d); }; li.src = imgOf(d); } $("#lbImg").alt = d.cap; $("#lbCap").textContent = `${d.cap} (${idx + 1}/${view.length})`; }
function step(n) { idx = (idx + n + view.length) % view.length; showLb(); }
$("#gallery").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (!b) return; lastFocus = b; idx = +b.dataset.i; showLb(); $("#lightbox").hidden = false; });
$("#lbPrev").onclick = () => step(-1);
$("#lbNext").onclick = () => step(1);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAll();
  if (!$("#lightbox").hidden) { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); }
});

// ========================================
// INISIALISASI
// ========================================
setTheme(store.get("greatCorner_dark", false), false);
renderWeeks(); renderStats(); renderJournal(); renderChecks(); renderGallery(); renderCharts();
});