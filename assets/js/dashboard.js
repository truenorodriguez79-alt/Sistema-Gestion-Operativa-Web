// ======================================================
// DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    iniciarDashboard();

});

function iniciarDashboard() {

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

