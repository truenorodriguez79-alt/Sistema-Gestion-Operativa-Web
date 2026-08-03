/* ==========================================================
   SISTEMA GLOBAL DE TEMAS
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarTema);

/* ==========================================================
   INICIO
========================================================== */

function iniciarTema() {

    const temaGuardado =
        localStorage.getItem("temaSistema") || "claro";

    aplicarTema(temaGuardado);

    prepararBotonTema();

}

/* ==========================================================
   PREPARAR BOTÓN
========================================================== */

function prepararBotonTema() {

const boton =
    document.getElementById("btnModo") ||
    document.getElementById("btnTema");

    if (!boton) return;

    boton.addEventListener("click", cambiarTema);

}

/* ==========================================================
   CAMBIAR TEMA
========================================================== */

function cambiarTema() {

    const oscuro =
        document.body.classList.contains("tema-oscuro");

    const nuevoTema =
        oscuro ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

}

/* ==========================================================
   APLICAR TEMA
========================================================== */

function aplicarTema(tema) {

    document.body.classList.remove("tema-oscuro");

    if (tema === "oscuro") {

        document.body.classList.add("tema-oscuro");

    }

    localStorage.setItem("temaSistema", tema);

    actualizarIcono();

}

/* ==========================================================
   ICONO
========================================================== */

function actualizarIcono() {

    const boton =
        document.getElementById("btnModo") ||
        document.getElementById("btnTema");

    if (!boton) return;

    const oscuro =
        document.body.classList.contains("tema-oscuro");

    boton.innerHTML = oscuro

        ? '<i class="fa-solid fa-sun"></i> Claro / Oscuro'

        : '<i class="fa-solid fa-moon"></i> Claro / Oscuro';

}