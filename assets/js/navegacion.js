
// ======================================================
// NAVEGACIÓN DEL DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    prepararMenu();

});

function prepararMenu() {

    const opciones = [

        ["menuInicio", "inicio"],
        ["menuPendientes", "pendientes"],
        ["menuEvidencias", "evidencias"],
        ["menuReportes", "tablas"],
        ["menuUsuarios", "bitacora"],
        ["menuBitacora", "bitacora"],
        ["menuIA", "ia"],
        ["menuConfiguracion", "configuracion"]

    ];

    opciones.forEach(([boton, seccion]) => {

        const enlace = document.getElementById(boton);

        if (!enlace) return;

        enlace.addEventListener("click", (e) => {

            e.preventDefault();

            if (seccion === "tablas") {

                window.location.href = "tablas.html";

                return;

            }

            const destino = document.getElementById(seccion);

            if (!destino) return;

            document
                .querySelectorAll(".sidebar-menu a")
                .forEach(a => a.classList.remove("activo"));

            enlace.classList.add("activo");

            destino.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        });

    });

}

/* ======================================================
   IR A MÓDULO
====================================================== */

function irAModulo(idModulo) {

    const destino = document.getElementById(idModulo);

    if (!destino) return;

    destino.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

window.irAModulo = irAModulo;