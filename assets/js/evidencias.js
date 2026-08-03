"use strict";

/* ==========================================================
   SISTEMA DE GESTIÓN OPERATIVA
   MÓDULO DE EVIDENCIAS
========================================================== */

console.clear();

console.log("======================================");
console.log(" SISTEMA DE GESTIÓN OPERATIVA");
console.log(" MÓDULO DE EVIDENCIAS");
console.log("======================================");

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let evidencias = [];

let usuarioActual = null;

let usuarioActualBD = null;

let contenedorEvidencias = null;

let inputEvidencia = null;

let btnAgregarEvidencia = null;

const LIMITE_EVIDENCIAS = 9;

/* ==========================================================
   INICIO DEL MÓDULO
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Inicializando módulo...");

    contenedorEvidencias =
        document.getElementById("contenedorEvidencias");

    inputEvidencia =
        document.getElementById("inputEvidencia");

    btnAgregarEvidencia =
        document.getElementById("btnAgregarEvidencia");

    if (
        !contenedorEvidencias ||
        !inputEvidencia ||
        !btnAgregarEvidencia
    ) {

        console.error(
            "No se encontraron los elementos del módulo."
        );

        return;

    }

    usuarioActual =
        sessionStorage.getItem(
            "usuarioSesionActual"
        );

    if (!usuarioActual) {

        usuarioActual = "invitado";

    }

    console.log(
        "Usuario activo:",
        usuarioActual
    );

    btnAgregarEvidencia.addEventListener(
        "click",
        () => {

            inputEvidencia.click();

        }
    );

    inputEvidencia.addEventListener(
        "change",
        seleccionarArchivos
    );

    await obtenerUsuarioBD();

    await cargarEvidencias();

});

/* ==========================================================
   OBTENER USUARIO DE LA BASE DE DATOS
========================================================== */

async function obtenerUsuarioBD() {

    const {

        data,

        error

    } = await supabaseClient

        .from("usuarios")

        .select("id, usuario")

        .eq("usuario", usuarioActual)

        .single();

    if (error) {

        console.error(error);

        return;

    }

    usuarioActualBD = data;

    console.log(
        "Usuario BD:",
        usuarioActualBD
    );

}

/* ==========================================================
   SELECCIONAR ARCHIVOS
========================================================== */

async function seleccionarArchivos(evento) {

    const archivos = [...evento.target.files];

    if (!archivos.length) return;

    for (const archivo of archivos) {

        await subirArchivo(archivo);

    }

    inputEvidencia.value = "";

}

/* ==========================================================
   SUBIR ARCHIVO
========================================================== */

async function subirArchivo(archivo) {

    console.log(
        "Subiendo:",
        archivo.name
    );

    const nombreArchivo =

        Date.now() +

        "_" +

        archivo.name.replace(/\s+/g, "_");

    const {

        error

    } = await supabaseClient.storage

        .from("evidencias")

        .upload(

            nombreArchivo,

            archivo

        );

    if (error) {

        console.error(error);

        alert("Error al subir el archivo.");

        return;

    }

    const {

        data

    } = supabaseClient.storage

        .from("evidencias")

        .getPublicUrl(nombreArchivo);

    console.log(

        "URL:",

        data.publicUrl

    );

console.log("Usuario BD:", usuarioActualBD);

console.log("ID Usuario:", usuarioActualBD?.id);

console.log("Archivo:", archivo);

console.log("URL:", data.publicUrl);

    await guardarEvidenciaBD({

        pendienteId: null,

        tipo: archivo.type,

        nombre: archivo.name,

        url: data.publicUrl,

        descripcion: "",

        usuarioId: usuarioActualBD.id

    });

    await cargarEvidencias();

}

/* ==========================================================
   GUARDAR EVIDENCIA EN LA BASE DE DATOS
========================================================== */

async function guardarEvidenciaBD({

    pendienteId = null,

    tipo,

    nombre,

    url,

    descripcion = "",

    usuarioId

}) {

    const {

        error

    } = await supabaseClient

        .from("evidencias")

        .insert({

            pendiente_id: pendienteId,

            tipo: tipo,

            nombre_archivo: nombre,

            archivo: url,

            descripcion: descripcion,

            subido_por: usuarioId,

            fecha_subida: new Date()

        });

    if (error) {

        console.error(error);

        alert("No fue posible guardar la evidencia.");

        return false;

    }

    console.log("✅ Evidencia registrada.");

    return true;

}

/* ==========================================================
   CARGAR EVIDENCIAS
========================================================== */

async function cargarEvidencias() {

    contenedorEvidencias.innerHTML = "";

const {

    data,

    error

} = await supabaseClient

    .from("evidencias")

    .select(`
        *,
        usuarios (
            usuario
        )
    `)

    .order(
        "fecha_subida",
        {
            ascending: false
        }
    )

    .limit(9);

    if (error) {

        console.error(error);

        return;

    }

   evidencias = data || [];

if (!evidencias.length) {

    contenedorEvidencias.innerHTML = `

        <div class="evidencia-vacia">

            Sin evidencias registradas

        </div>

    `;

    actualizarContador();

    return;

}

evidencias.forEach(evidencia => {

    crearTarjeta(evidencia);

});

actualizarContador();

}

/* ==========================================================
   CREAR TARJETA DE EVIDENCIA
========================================================== */

function crearTarjeta(evidencia) {

    const usuario =

        evidencia.usuarios?.usuario ||

        "Desconocido";

    const fecha =

        new Date(

            evidencia.fecha_subida

        ).toLocaleString("es-MX");

    const tarjeta =

        document.createElement("div");

    tarjeta.className =

        "tarjeta-evidencia";

    tarjeta.innerHTML = `

        <div class="imagen-contenedor">

            <img

                src="${evidencia.archivo}"

                class="imagen-evidencia"

                alt="${evidencia.nombre_archivo}">

        </div>

        <div class="info-evidencia">

            <h4>

                ${evidencia.nombre_archivo}

            </h4>

            <small>

                👤 ${usuario}

            </small>

            <small>

                📅 ${fecha}

            </small>

            <p class="descripcion-evidencia">

                ${evidencia.descripcion || ""}

            </p>

            <div class="acciones-evidencia">

                <button

                    class="btn-ver"

                    onclick="abrirImagen('${evidencia.archivo}')">

                    👁 Ver

                </button>

                <button

                    class="btn-eliminar"

                    onclick="eliminarEvidencia(${evidencia.id}, '${evidencia.archivo}')">

                    🗑 Eliminar

                </button>

            </div>

        </div>

    `;

    contenedorEvidencias.appendChild(tarjeta);

}

/* ==========================================================
   ABRIR IMAGEN
========================================================== */

function abrirImagen(url) {

    let modal = document.getElementById("modalEvidencia");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "modalEvidencia";

        modal.className = "modal-evidencia";

        modal.innerHTML = `

            <div class="modal-contenido">

                <button
                    class="cerrar-modal"
                    onclick="cerrarImagen()">

                    ✕

                </button>

                <img
                    id="imagenModal"
                    class="imagen-modal"
                    src="">

            </div>

        `;

        document.body.appendChild(modal);

    }

    document.getElementById("imagenModal").src = url;

    modal.style.display = "flex";

}

/* ==========================================================
   CERRAR IMAGEN
========================================================== */

function cerrarImagen() {

    const modal =
        document.getElementById("modalEvidencia");

    if (!modal) return;

    modal.style.display = "none";

}

/* ==========================================================
   CERRAR AL HACER CLICK FUERA
========================================================== */

window.addEventListener("click", (e) => {

    const modal =
        document.getElementById("modalEvidencia");

    if (!modal) return;

    if (e.target === modal) {

        cerrarImagen();

    }

});

/* ==========================================================
   ELIMINAR EVIDENCIA
========================================================== */

async function eliminarEvidencia(id, urlArchivo) {

    const confirmar = confirm(
        "¿Deseas eliminar esta evidencia?"
    );

    if (!confirmar) return;

    try {

        const nombreArchivo = urlArchivo.split("/").pop();

        const { error: errorStorage } =
            await supabaseClient.storage
                .from("evidencias")
                .remove([nombreArchivo]);

        if (errorStorage) {

            console.error(errorStorage);

        }

        const { error: errorBD } =
            await supabaseClient
                .from("evidencias")
                .delete()
                .eq("id", id);

        if (errorBD) {

            console.error(errorBD);

            alert("No fue posible eliminar la evidencia.");

            return;

        }

        console.log("✅ Evidencia eliminada.");

        await cargarEvidencias();

    } catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   ACTUALIZAR CONTADOR
========================================================== */

function actualizarContador() {

    const contador =
        document.getElementById("contadorEvidencias");

    if (!contador) return;

    contador.textContent =
        `${evidencias.length} evidencia${evidencias.length !== 1 ? "s" : ""}`;

}

/* ==========================================================
   FORMATEAR FECHA
========================================================== */

function formatearFecha(fecha) {

    if (!fecha) return "";

    return new Date(fecha).toLocaleString("es-MX", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}

/* ==========================================================
   OBTENER ICONO SEGÚN EL ARCHIVO
========================================================== */

function obtenerIconoArchivo(nombreArchivo) {

    const extension =

        nombreArchivo

        .split(".")

        .pop()

        .toLowerCase();

    switch (extension) {

        case "pdf":
            return "📄";

        case "doc":

        case "docx":
            return "📝";

        case "xls":

        case "xlsx":
            return "📊";

        case "ppt":

        case "pptx":
            return "📈";

        case "jpg":

        case "jpeg":

        case "png":

        case "gif":

        case "webp":
            return "🖼️";

        default:
            return "📁";

    }

}

/* ==========================================================
   RECARGAR GALERÍA
========================================================== */

async function actualizarModuloEvidencias() {

    await cargarEvidencias();

    actualizarContador();

}


/* ==========================================================
   EXPORTAR FUNCIONES
========================================================== */

window.abrirImagen = abrirImagen;

window.cerrarImagen = cerrarImagen;

window.eliminarEvidencia = eliminarEvidencia;

window.actualizarModuloEvidencias =
    actualizarModuloEvidencias;

/* ==========================================================
   MÓDULO LISTO
========================================================== */

console.log("======================================");
console.log(" MÓDULO DE EVIDENCIAS LISTO");
console.log("======================================");