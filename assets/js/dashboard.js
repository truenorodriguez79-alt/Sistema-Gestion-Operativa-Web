// ======================================================
// DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    iniciarDashboard();

});

async function iniciarDashboard() {

    actualizarSaludo();

    iniciarReloj();

}
// ======================================================
// SALUDO
// ======================================================

function actualizarSaludo() {

    const saludo = document.getElementById("saludo");

    if (!saludo) return;

    const hora = new Date().getHours();

    let texto = "";

    if (hora < 12) {

        texto = "Buenos días";

    } else if (hora < 19) {

        texto = "Buenas tardes";

    } else {

        texto = "Buenas noches";

    }

    saludo.textContent = texto;

}






// ======================================================
// RELOJ
// ======================================================

function iniciarReloj() {

    actualizarHora();

    setInterval(actualizarHora, 1000);

}

function actualizarHora() {

    const elemento = document.getElementById("horaActual");

    if (!elemento) return;

    const ahora = new Date();

    elemento.textContent =
        ahora.toLocaleTimeString("es-MX");

}

/* ==========================================================
   MENÚ MÓVIL
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("btnMenuMovil");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("menuOverlay");

    if (!boton || !sidebar || !overlay) return;

    boton.addEventListener("click", () => {

        sidebar.classList.toggle("sidebar-abierta");
        overlay.classList.toggle("activo");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("sidebar-abierta");
        overlay.classList.remove("activo");

    });

});


// ======================================================
// DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    iniciarDashboard();

});

async function iniciarDashboard() {

    actualizarSaludo();

    iniciarReloj();

}
// ======================================================
// SALUDO
// ======================================================

function actualizarSaludo() {

    const saludo = document.getElementById("saludo");

    if (!saludo) return;

    const hora = new Date().getHours();

    let texto = "";

    if (hora < 12) {

        texto = "Buenos días";

    } else if (hora < 19) {

        texto = "Buenas tardes";

    } else {

        texto = "Buenas noches";

    }

    saludo.textContent = texto;

}






// ======================================================
// RELOJ
// ======================================================

function iniciarReloj() {

    actualizarHora();

    setInterval(actualizarHora, 1000);

}

function actualizarHora() {

    const elemento = document.getElementById("horaActual");

    if (!elemento) return;

    const ahora = new Date();

    elemento.textContent =
        ahora.toLocaleTimeString("es-MX");

}

/* ======================================================
   BOTONES HERO
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const btnPizarron =
        document.getElementById("btnIrPizarron");

    const btnPendientes =
        document.getElementById("btnIrPendientes");

    if (btnPizarron) {

        btnPizarron.addEventListener("click", () => {

            irAModulo("pizarron");

        });

    }

    if (btnPendientes) {

        btnPendientes.addEventListener("click", () => {

            irAModulo("pendientes");

        });

    }

});