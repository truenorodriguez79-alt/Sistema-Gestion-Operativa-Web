/* ==========================================================
   MAIN
   Sistema de Gestión Operativa
========================================================== */

/* ==========================================================
   INICIO DEL DASHBOARD
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarDashboard);

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pendientesDashboard = [];

let canalDashboard = null;

async function iniciarDashboard() {

    console.clear();

    console.log("======================================");
    console.log(" Sistema de Gestión Operativa");
    console.log(" Dashboard iniciado");
    console.log("======================================");

   await cargarResumenDashboard();

activarRealtimeDashboard();

}


// ==========================================================
// CARGAR DATOS DEL DASHBOARD

// ==========================================================
async function cargarResumenDashboard() {

    try {

        if (typeof supabaseClient === "undefined") {

            console.error("Supabase no inicializado.");

            return;

        }

        /* ==========================================
           USUARIOS
        ========================================== */

        const {

            data: usuarios = [],

            error: errorUsuarios

        } = await supabaseClient

            .from("usuarios")

            .select("*");

        if (errorUsuarios) throw errorUsuarios;

        const activos = usuarios.filter(

            usuario => usuario.habilitado === true

        );

        /* ==========================================
           PENDIENTES
        ========================================== */

   const {
    data,
    error: errorPendientes
} = await supabaseClient

            .from("pendientes")

            .select("*");

        if (errorPendientes) throw errorPendientes;

        pendientesDashboard = data || [];

        /* ==========================================
           ESTADÍSTICAS
        ========================================== */

      const total = pendientesDashboard.filter(

    p => p.estado !== "Finalizado"

).length;

const finalizados = pendientesDashboard.filter(

    p => p.estado === "Finalizado"

).length;

const urgentes = pendientesDashboard.filter(

    p => p.prioridad === "Urgente"

).length;

/* ==========================================
   ELEMENTOS DEL DASHBOARD
========================================== */

// HERO
const heroPendientes =
    document.getElementById("heroPendientes");

const heroUrgentes =
    document.getElementById("heroUrgentes");

const heroFinalizados =
    document.getElementById("heroFinalizados");

const heroUsuariosActivos =
    document.getElementById("heroUsuariosActivos");

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

// TARJETAS
const totalPendientes =
    document.getElementById("totalPendientes");

const totalUrgentes =
    document.getElementById("totalUrgentes");

const totalFinalizados =
    document.getElementById("totalFinalizados");

const usuariosConectados =
    document.getElementById("usuariosConectados");


/* ==========================================
   ACTUALIZAR INDICADORES
========================================== */

const heroPendientesHero =
    document.getElementById("heroPendientesHero");

if (heroPendientes) {
    heroPendientes.textContent = total;
}

if (heroPendientesHero) {
    heroPendientesHero.textContent = total;
}

if (heroUrgentes) {
    heroUrgentes.textContent = urgentes;
}

if (heroFinalizados) {
    heroFinalizados.textContent = finalizados;
}

if (heroUsuariosActivos) {
    heroUsuariosActivos.textContent = activos.length;
}

if (totalPendientes) {
    totalPendientes.textContent = total;
}

if (totalUrgentes) {
    totalUrgentes.textContent = urgentes;
}

if (totalFinalizados) {
    totalFinalizados.textContent = finalizados;
}

if (usuariosConectados) {
    usuariosConectados.textContent = activos.length;
}

/* ==========================================
   BARRA DE PROGRESO
========================================== */

const porcentaje =

    (total + finalizados) > 0

        ? Math.round((finalizados / (total + finalizados)) * 100)

        : 0;

if (heroBarra) {
    heroBarra.style.width = porcentaje + "%";
}

if (heroPorcentaje) {
    heroPorcentaje.textContent = porcentaje + "%";
}

/* ==========================================
   INFORMACIÓN DEL SISTEMA
========================================== */

if (heroMensaje) {

    heroMensaje.textContent =
        `Hay ${total} pendiente(s) activo(s)`;

}

if (heroActualizacion) {

    heroActualizacion.textContent =
        new Date().toLocaleTimeString("es-MX");

}

if (heroUsuario) {

    heroUsuario.textContent =
        sessionStorage.getItem("usuarioSesionActual") || "-";

}

/* ==========================================
   TABLERO
========================================== */

if (typeof actualizarTableroEstados === "function") {

    await actualizarTableroEstados();

}

 } catch (error) {

        console.error(
            "Error cargando dashboard:",
            error
        );

    }

}

/* ==========================================================
   TABLERO DE ESTADOS
========================================================== */

async function actualizarTableroEstados() {

    console.log("Actualizando tablero de estados...");

const columnaPendientes =
    document.getElementById("estadoPendiente");

const columnaProceso =
    document.getElementById("estadoProceso");

const columnaFinalizados =
    document.getElementById("estadoFinalizado");

    if (
        !columnaPendientes ||
        !columnaProceso ||
        !columnaFinalizados
    ) {

        console.warn("No se encontraron las columnas del tablero.");

        return;

    }

    columnaPendientes.innerHTML = "";

    columnaProceso.innerHTML = "";

    columnaFinalizados.innerHTML = "";

    pendientesDashboard.forEach(pendiente => {

    const tarjeta = document.createElement("div");

    tarjeta.className = "tarjeta-tablero";

    tarjeta.innerHTML = `

        <strong>#${pendiente.folio}</strong>

        <h4>${pendiente.titulo}</h4>

        <small>${pendiente.prioridad}</small>

    `;

    switch (pendiente.estado) {

        case "Pendiente":

            columnaPendientes.appendChild(tarjeta);

            break;

        case "En Proceso":

            columnaProceso.appendChild(tarjeta);

            break;

        case "Finalizado":

            columnaFinalizados.appendChild(tarjeta);

            break;

    }

});

}

/* ==========================================================
   REALTIME
========================================================== */

function activarRealtimeDashboard() {

    if (canalDashboard) {

        supabaseClient.removeChannel(canalDashboard);

    }

    canalDashboard = supabaseClient

        .channel("dashboard-resumen")

        .on(

            "postgres_changes",

            {

                event: "*",

                schema: "public",

                table: "pendientes"

            },

            () => {

                console.log("🔄 Dashboard actualizado");

                cargarResumenDashboard();

            }

        )

        .subscribe();

}