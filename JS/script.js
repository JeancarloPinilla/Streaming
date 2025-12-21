
// Detecta scroll para ocultar/mostrar header
let lastScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    const current = window.pageYOffset;

    if (current > lastScroll) {
        header.classList.add("hidden");   // Bajando: esconder
    } else {
        header.classList.remove("hidden"); // Subiendo: mostrar
    }

    lastScroll = current;
});

// Agregar clase "active" según la página actual
const links = document.querySelectorAll("nav a");
const currentPage = window.location.pathname.split("/").pop();

links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
        link.classList.add("active");
    }
});

// Suavizador opcional si quieres animación al cambiar páginas
window.addEventListener("beforeunload", () => {
    document.body.style.opacity = "0";
});




// Animación y cierre inteligente del menú móvil
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

function toggleMenu() {
mobileMenu.classList.toggle("active");
menuBtn.classList.toggle("open");
}

// Abrir/cerrar menú al tocar el botón
menuBtn.addEventListener("click", (event) => {
event.stopPropagation();
toggleMenu();
});

// Cerrar menú al tocar un enlace
mobileMenu.querySelectorAll("a").forEach(link => {
link.addEventListener("click", () => {
mobileMenu.classList.remove("active");
menuBtn.classList.remove("open");
});
});

// Cerrar menú al tocar fuera
document.addEventListener("click", (event) => {
if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
mobileMenu.classList.remove("active");
menuBtn.classList.remove("open");
}
});

function touchOutside(e) {
if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
mobileMenu.classList.remove("active");
menuBtn.classList.remove("open");
}
}
document.addEventListener("touchstart", touchOutside);