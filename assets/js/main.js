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

        const {
            data: usuarios,
            error: errorUsuarios
        } = await supabaseClient
            .from("usuarios")
            .select("*");

        if (errorUsuarios) {

            console.error(errorUsuarios);

        } else {

            const activos = usuarios.filter(
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

        const totalPendientes =
            document.getElementById("totalPendientes");

        const totalUrgentes =
            document.getElementById("totalUrgentes");

        const totalFinalizados =
            document.getElementById("totalFinalizados");

        if (totalPendientes) {
            totalPendientes.textContent = total;
        } else {
            console.warn("No existe #totalPendientes");
        }

        if (totalUrgentes) {
            totalUrgentes.textContent = urgentes;
        } else {
            console.warn("No existe #totalUrgentes");
        }

        if (totalFinalizados) {
            totalFinalizados.textContent = finalizados;
        } else {
            console.warn("No existe #totalFinalizados");
        }

    } catch (error) {

        console.error(
            "Error cargando dashboard:",
            error
        );

    }

}