/* ==========================================================
   GESTIÓN DE PENDIENTES - SUPABASE
   Sistema Gestión Operativa
========================================================== */

async function obtenerUsuarioPorNombre(nombreUsuario) {

    if (!nombreUsuario) {
        console.error("No se recibió nombre de usuario.");
        return null;
    }

    console.log("Buscando usuario:", nombreUsuario);

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, usuario, nombre")
        .eq("usuario", nombreUsuario.toLowerCase())
        .single();

    if (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }

    console.log("Usuario encontrado:", data);

    return data;
}

async function guardarPendienteSupabase(nuevo) {

    console.log("======================================");
    console.log("Iniciando guardado en Supabase");
    console.log("Objeto recibido:", nuevo);

    const usuario = await obtenerUsuarioPorNombre(nuevo.usuario);

    console.log("nuevo.usuario:", nuevo.usuario);
    console.log("usuario encontrado:", usuario);

    if (!usuario) {
        console.error("No se encontró el usuario:", nuevo.usuario);
        return false;
    }

    const pendiente = {
        folio: nuevo.folio,
        titulo: nuevo.pendiente,
        descripcion: "",
        prioridad: nuevo.prioridad,
        estado: nuevo.estado,
        fecha_limite: nuevo.fecha === "Sin fecha" ? null : nuevo.fecha,
        asignado_a: usuario.id,
        creado_por: usuario.id,
        kanban: "Pendiente"
    };

    console.log("Datos enviados a Supabase:", pendiente);

    const { data, error } = await supabaseClient
        .from("pendientes")
        .insert([pendiente])
        .select();

    if (error) {
        console.error("Error guardando pendiente:", error);
        return false;
    }

    console.log("Pendiente guardado correctamente:", data);

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

    console.log("Pendientes cargados:", data);

    return data;
}