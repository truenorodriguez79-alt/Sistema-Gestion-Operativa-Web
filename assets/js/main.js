/* ==========================================================
   MAIN
   Sistema de Gestión Operativa
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("======================================");
    console.log(" Sistema de Gestión Operativa");
    console.log(" Dashboard iniciado");
    console.log("======================================");

    cargarResumenDashboard();

});


// ==========================================================
// CARGAR DATOS DEL DASHBOARD
// ==========================================================

async function cargarResumenDashboard() {

    try {

        // Verificar que exista Supabase
        if (typeof supabaseClient === "undefined") {
            console.error("Supabase no está inicializado.");
            return;
        }



        // ============================
        // USUARIOS
        // ============================

let activos = [];

        const {
            data: usuarios,
            error: errorUsuarios
        } = await supabaseClient
            .from("usuarios")
            .select("*");

        if (errorUsuarios) {

            console.error(errorUsuarios);

        } else {

activos = usuarios.filter(
    usuario => usuario.habilitado === true
);

            const contadorUsuarios =
                document.getElementById("usuariosConectados");

            if (contadorUsuarios) {
                contadorUsuarios.textContent = activos.length;
            }

        }


        // ============================
        // PENDIENTES
        // ============================

        const {
            data: pendientes,
            error: errorPendientes
        } = await supabaseClient
            .from("pendientes")
            .select("*");

        if (errorPendientes) {

            console.error(errorPendientes);
            return;

        }

        const total = pendientes.filter(
            p => p.estado !== "Finalizado"
        ).length;

        const urgentes = pendientes.filter(
            p => p.prioridad === "Urgente"
        ).length;

        const finalizados = pendientes.filter(
            p => p.estado === "Finalizado"
        ).length;

        // ============================
        // ACTUALIZAR TARJETAS
        // ============================

 // HERO
const heroPendientes =
    document.getElementById("heroPendientes");

const heroUrgentes =
    document.getElementById("heroUrgentes");

const heroFinalizados =
    document.getElementById("heroFinalizados");

const heroUsuariosActivos =
    document.getElementById("heroUsuariosActivos");

const heroPendientesHero =
    document.getElementById("heroPendientesHero");

const heroMensaje =
    document.getElementById("heroMensaje");

const heroActualizacion =
    document.getElementById("heroActualizacion");

const heroUsuario =
    document.getElementById("heroUsuario");

const heroBarra =
    document.getElementById("heroBarra");

const heroPorcentaje =
    document.getElementById("heroPorcentaje");

// INDICADORES
const totalPendientes =
    document.getElementById("totalPendientes");

const totalUrgentes =
    document.getElementById("totalUrgentes");

const totalFinalizados =
    document.getElementById("totalFinalizados");

if (heroPendientes)


       const porcentaje = 0;

if (heroMensaje) {

    heroMensaje.textContent =
        "Hay 0 pendiente(s) activo(s)";

}

if (heroActualizacion) {

    heroActualizacion.textContent =
        new Date().toLocaleTimeString("es-MX");

}

if (heroUsuario) {

    heroUsuario.textContent =
        sessionStorage.getItem("usuarioSesionActual") || "Invitado";

}

if (heroBarra) {

    heroBarra.style.width = porcentaje + "%";

}

if (heroPorcentaje) {

    heroPorcentaje.textContent =
        porcentaje + "% completado";

}

await actualizarTableroEstados();


    } catch (error) {

        console.error(
            "Error cargando dashboard:",
            error
        );

    }

}

/* ==========================================================
   ACTUALIZAR HERO EN TIEMPO REAL
========================================================== */

supabaseClient

    .channel("dashboard-resumen")

    .on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table: "pendientes"

        },

        () => {

            cargarResumenDashboard();

        }

    )

    .subscribe();