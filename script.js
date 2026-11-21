const $ = (sel) => document.querySelector(sel);
const screens = document.querySelectorAll(".screen");
const palette = ["#7390ab", "#d4a1ab", "#cca85b", "#566b52", "#75594e"];

/* Changer d'écran */
function show(id) {
screens.forEach((s) => s.classList.toggle("active", s.id === id));
if (id === "s5") startCake();
if (id === "s6") startGlobe();
}

/* Étoiles de fond */
(function makeStars() {
const box = $("#stars");
for (let i = 0; i < 60; i++) {
const star = document.createElement("span");
star.className = "star";
star.style.left = Math.random() * 100 + "%";
star.style.top = Math.random() * 100 + "%";
star.style.animationDelay = Math.random() * 4 + "s";
star.style.transform = "scale(" + (0.6 + Math.random() * 1.2) + ")";
box.appendChild(star);
}
})();

/* Écran 1 : décompte de 5 secondes, puis bouton Next */
(function countdown() {
const count = $("#count");
let n = 5;
count.classList.add("pop");
const timer = setInterval(() => {
n--;
if (n > 0) {
count.textContent = n;
count.classList.remove("pop");
void count.offsetWidth; // relance l'animation
count.classList.add("pop");
} else {
clearInterval(timer);
count.style.display = "none";
$("#next1").classList.remove("hidden");
}
}, 1000);
})();

$("#next1").addEventListener("click", () => show("s2"));
$("#next2").addEventListener("click", () => show("s3"));

/* Écran 3 : le cadeau s'ouvre, la lettre apparaît paragraphe par paragraphe */
$("#gift").addEventListener("click", () => {
const gift = $("#gift");
if (gift.classList.contains("open")) return;
gift.classList.add("open");
$("#touch").style.opacity = "0";
setTimeout(() => {
$("#touch").style.display = "none";
gift.style.display = "none";
const letter = $("#letter");
letter.classList.remove("hidden");
const lines = letter.querySelectorAll("p");
lines.forEach((p, i) => setTimeout(() => p.classList.add("in"), 300 + i * 1800));
setTimeout(() => $("#next3").classList.remove("hidden"), 300 + lines.length * 1800);
}, 800);
});

$("#next3").addEventListener("click", () => show("s4"));
$("#next4").addEventListener("click", () => show("s5"));

/* Écran 5 : gâteau, langues et confettis */
const wishes = [
{ text: "Joyeux anniversaire", cls: "" },
{ text: "Happy Birthday", cls: "" },
{ text: "お誕生日おめでとう", cls: "jp" },
{ text: "生日快乐", cls: "zh" },
];
let cakeStarted = false;

function confetti() {
for (let i = 0; i < 40; i++) {
const c = document.createElement("span");
c.className = "confetti";
c.style.left = Math.random() * 100 + "vw";
c.style.background = palette[Math.floor(Math.random() * palette.length)];
c.style.animationDuration = 3 + Math.random() * 3 + "s";
c.style.animationDelay = Math.random() * 1.5 + "s";
document.body.appendChild(c);
setTimeout(() => c.remove(), 7500);
}
}

function startCake() {
if (cakeStarted) return;
cakeStarted = true;
const wish = $("#wish");
let i = 0;
confetti();
setInterval(() => {
wish.classList.add("fade");
setTimeout(() => {
i = (i + 1) % wishes.length;
wish.textContent = wishes[i].text;
wish.className = "wish " + wishes[i].cls;
if (i === 0) confetti();
}, 500);
}, 2800);
}

$("#next5").addEventListener("click", () => show("s6"));
$("#replay").addEventListener("click", () => location.reload());

/* Écran 6 : globe qui tourne et distance entre vous deux
Coordonnées [longitude, latitude]. Remplace-les par les tiennes pour plus de précision
(Google Maps : appui long sur le point, les coordonnées s'affichent en haut). */
const MOI = { nom: "Moi", coord: [-17.4677, 14.7167] }; // Dakar (à ajuster)
const LUI = { nom: "Julian", coord: [115.98, 28.66] }; // Nanchang, campus de Yaohu (approx.)

let globeStarted = false;

function startGlobe() {
if (globeStarted) return;
globeStarted = true;

const canvas = $("#globe");
const ctx = canvas.getContext("2d");
const W = canvas.width, R = W / 2 - 8;
const projection = d3.geoOrthographic().scale(R).translate([W / 2, W / 2]).clipAngle(90);
const path = d3.geoPath(projection, ctx);
const sphere = { type: "Sphere" };
const graticule = d3.geoGraticule10();
const arcInterp = d3.geoInterpolate(MOI.coord, LUI.coord);
const km = Math.round(d3.geoDistance(MOI.coord, LUI.coord) * 6371);
let land = null;

// Phases : 0 = rotation vers moi, 1 = tracé du trait, 2 = arrivée
let phase = 0, t0 = performance.now(), progress = 0;
let rot = [0, -20];
const rotToMe = [-MOI.coord[0], -MOI.coord[1]];
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function arcPoints(p) {
const pts = [];
for (let i = 0; i <= 80; i++) pts.push(arcInterp((i / 80) * p));
return pts;
}

function marker(coord, color) {
const [x, y] = projection(coord);
const visible = d3.geoDistance(coord, [-rot[0], -rot[1]]) < Math.PI / 2;
if (!visible) return;
ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI);
ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.fill();
ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = "#f4e9e1"; ctx.stroke();
}

function draw() {
projection.rotate(rot);
ctx.clearRect(0, 0, W, W);

ctx.beginPath(); path(sphere); ctx.fillStyle = "#1f2c3b"; ctx.fill();
ctx.beginPath(); path(graticule); ctx.strokeStyle = "rgba(115,144,171,0.25)"; ctx.lineWidth = 1; ctx.stroke();
if (land) {
ctx.beginPath(); path(land); ctx.fillStyle = "#566b52"; ctx.fill();
ctx.strokeStyle = "rgba(244,233,225,0.25)"; ctx.lineWidth = 0.7; ctx.stroke();
}

if (progress > 0) {
ctx.beginPath();
path({ type: "LineString", coordinates: arcPoints(progress) });
ctx.strokeStyle = "#cca85b"; ctx.lineWidth = 4; ctx.lineCap = "round";
ctx.shadowColor = "#cca85b"; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
}

marker(MOI.coord, "#d4a1ab");
marker(LUI.coord, "#cca85b");

ctx.beginPath(); path(sphere); ctx.strokeStyle = "rgba(212,161,171,0.5)"; ctx.lineWidth = 3; ctx.stroke();
}

function frame(now) {
const dt = now - t0;
if (phase === 0) {
const k = Math.min(dt / 2500, 1);
rot = [-60 + (rotToMe[0] + 60) * ease(k), -20 + (rotToMe[1] + 20) * ease(k)];
if (k >= 1) { phase = 1; t0 = now; }
} else if (phase === 1) {
const k = Math.min(dt / 6000, 1);
progress = ease(k);
const head = arcInterp(progress);
rot = [-head[0], -head[1]];
if (k >= 1) { phase = 2; t0 = now; showDistance(); }
} else {
// Dézoom léger pour voir les deux points : rotation vers le milieu de l'arc
const mid = arcInterp(0.5);
rot = [rot[0] + (-mid[0] - rot[0]) * 0.04, rot[1] + (-mid[1] - rot[1]) * 0.04];
draw();
requestAnimationFrame(frame);
return;
}
draw();
requestAnimationFrame(frame);
}

function showDistance() {
const box = $("#distanceBox");
box.classList.remove("hidden");
box.classList.add("show");
const out = $("#km");
const start = performance.now();
(function count(now) {
const k = Math.min((now - start) / 2200, 1);
out.textContent = Math.round(km * ease(k)).toLocaleString("fr-FR");
if (k < 1) requestAnimationFrame(count);
})(start);
confetti();
}

fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
.then((r) => r.json())
.then((w) => { land = topojson.feature(w, w.objects.land); })
.catch(() => {});
requestAnimationFrame((n) => { t0 = n; frame(n); });
}