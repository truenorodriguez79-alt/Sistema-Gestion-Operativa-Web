/* ==========================================================
   MAIN
   Sistema de Gestión Operativa
========================================================== */

/* ==========================================================
   INICIO DEL DASHBOARD
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarDashboard);

async function iniciarDashboard() {

    console.clear();

    console.log("======================================");
    console.log(" Sistema de Gestión Operativa");
    console.log(" Dashboard iniciado");
    console.log("======================================");

    await cargarResumenDashboard();

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

            data: pendientes = [],

            error: errorPendientes

        } = await supabaseClient

            .from("pendientes")

            .select("*");

        if (errorPendientes) throw errorPendientes;

        /* ==========================================
           ESTADÍSTICAS
        ========================================== */

        const total = pendientes.filter(

            p => p.estado !== "Finalizado"

        ).length;

        const finalizados = pendientes.filter(

            p => p.estado === "Finalizado"

        ).length;

        const urgentes = pendientes.filter(

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

if (heroPendientes) {
    heroPendientes.textContent = total;
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

await actualizarTableroEstados();


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

console.log("Actualizando tablero de estados...");

/* ==========================================
   COLUMNAS
========================================== */

const columnaPendientes =
    document.getElementById("tableroPendientes");

const columnaProceso =
    document.getElementById("tableroProceso");

const columnaFinalizados =
    document.getElementById("tableroFinalizados");

if (!columnaPendientes ||
    !columnaProceso ||
    !columnaFinalizados) {

    console.warn("No se encontraron las columnas del tablero.");

    return;

}

/* ==========================================
   LIMPIAR COLUMNAS
========================================== */

columnaPendientes.innerHTML = "";

columnaProceso.innerHTML = "";

columnaFinalizados.innerHTML = "";



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