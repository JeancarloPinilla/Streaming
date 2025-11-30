
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
