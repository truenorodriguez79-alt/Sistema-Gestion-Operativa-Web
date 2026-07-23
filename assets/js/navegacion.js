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
        ["menuReportes", "reportes"],
        ["menuUsuarios", "bitacora"],
        ["menuBitacora", "bitacora"],
        ["menuIA", "ia"],
        ["menuConfiguracion", "configuracion"]

    ];

    opciones.forEach(([boton, seccion]) => {

        const enlace = document.getElementById(boton);
        const destino = document.getElementById(seccion);

        if (!enlace || !destino) return;

        enlace.addEventListener("click", (e) => {

            e.preventDefault();

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