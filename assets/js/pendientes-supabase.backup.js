/* ==========================================================
   GESTIÓN DE PENDIENTES - SUPABASE
   Sistema Gestión Operativa
========================================================== */

async function obtenerUsuarioPorNombre(nombreUsuario) {

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, usuario, nombre")
        .eq("usuario", nombreUsuario.toLowerCase())
        .single();

    if (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }

    return data;
}

async function guardarPendienteSupabase(nuevo) {

    const usuario = await obtenerUsuarioPorNombre(nuevo.usuario);

    if (!usuario) {
        return false;
    }

    const { error } = await supabaseClient
        .from("pendientes")
        .insert([{
            folio: nuevo.folio,
            titulo: nuevo.pendiente,
            descripcion: "",
            prioridad: nuevo.prioridad,
            estado: nuevo.estado,
            fecha_limite: nuevo.fecha === "Sin fecha" ? null : nuevo.fecha,
            asignado_a: usuario.id,
            creado_por: usuario.id,
            kanban: "Pendiente"
        }]);

    if (error) {
        console.error("Error guardando pendiente:", error);
        return false;
    }

    return true;
}

async function cargarPendientesSupabase() {

    const { data, error } = await supabaseClient
        .from("pendientes")
        .select(`
            *,
            asignado:asignado_a(usuario,nombre),
            creador:creado_por(usuario,nombre)
        `)
        .order("folio", { ascending: true });

    if (error) {
        console.error("Error cargando pendientes:", error);
        return [];
    }

    return data;
}