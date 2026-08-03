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

    return data;
}

/* ==========================================================
   GUARDAR PENDIENTE
========================================================== */

async function guardarPendienteSupabase(nuevo) {

    console.clear();
    console.log("========================================");
    console.log("INICIANDO GUARDADO EN SUPABASE");
    console.log("Datos recibidos:", nuevo);

    /* --------------------------------------------
       Obtener usuario asignado
    ---------------------------------------------*/

    const usuarioAsignado = await obtenerUsuarioPorNombre(nuevo.asignado_a);

    if (!usuarioAsignado) {
        console.error("No existe el usuario asignado:", nuevo.asignado_a);
        return false;
    }

    /* --------------------------------------------
       Obtener usuario creador
    ---------------------------------------------*/

    const usuarioCreador = await obtenerUsuarioPorNombre(nuevo.creado_por);

    if (!usuarioCreador) {
        console.error("No existe el usuario creador:", nuevo.creado_por);
        return false;
    }

    /* --------------------------------------------
       Preparar objeto
    ---------------------------------------------*/

    const pendiente = {

        folio: nuevo.folio,

        titulo: nuevo.titulo,

        descripcion: nuevo.descripcion || "",

        prioridad: nuevo.prioridad || "Media",

        estado: nuevo.estado || "Pendiente",

        fecha_limite:
            !nuevo.fecha || nuevo.fecha === "Sin fecha"
                ? null
                : nuevo.fecha,

        asignado_a: usuarioAsignado.id,

        creado_por: usuarioCreador.id,

        kanban: "Pendiente"

    };

    console.log("Objeto que se enviará:");
    console.table(pendiente);

    /* --------------------------------------------
       Guardar
    ---------------------------------------------*/

    const { data, error } = await supabaseClient
        .from("pendientes")
        .insert([pendiente])
        .select();

    if (error) {

        console.error("========================================");
        console.error("ERROR AL GUARDAR");
        console.error(error);

        return false;

    }

    console.log("========================================");
    console.log("PENDIENTE GUARDADO");
    console.table(data);

    return true;
}

/* ==========================================================
   CARGAR PENDIENTES
========================================================== */

async function cargarPendientesSupabase() {

    const { data, error } = await supabaseClient

        .from("pendientes")

        .select(`
            *,
            asignado:asignado_a(
                id,
                usuario,
                nombre
            ),
            creador:creado_por(
                id,
                usuario,
                nombre
            )
        `)

        .order("folio", { ascending: true });

    if (error) {

        console.error("Error cargando pendientes:");
        console.error(error);

        return [];

    }

    console.log("Pendientes obtenidos:");
    console.table(data);

    return data;
}

/* ==========================================================
   ELIMINAR PENDIENTE
========================================================== */

async function eliminarPendienteSupabase(id) {

    const { error } = await supabaseClient

        .from("pendientes")

        .delete()

        .eq("id", id);

    if (error) {

        console.error(error);

        return false;

    }

    return true;
}

/* ==========================================================
   ACTUALIZAR PENDIENTE
========================================================== */

async function actualizarPendienteSupabase(id, datos) {

    const { error } = await supabaseClient

        .from("pendientes")

        .update(datos)

        .eq("id", id);

    if (error) {

        console.error(error);

        return false;

    }

    return true;
}