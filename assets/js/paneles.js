"use strict";

/* ==========================================================
   PANEL DE PENDIENTES
   Sistema de Gestión Operativa
========================================================== */

console.log("✅ paneles.js cargado");

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pendientes = [];

let canalBitacora = null;

/* ==========================================================
   RESPONSABLES
========================================================== */

const RESPONSABLES = [

    {
        usuario: "elizabeth",
        nombre: "Lic. Elizabeth Alvarez Hernandez",
        area: "Control Financiero",
        clase: "tema-elizabeth",
        imagen: "assets/img/fondo/elizabeth.png"
    },

    {
        usuario: "jasso",
        nombre: "Ing. Juan Carlos Rodriguez Jasso",
        area: "Asuntos Contenciosos",
        clase: "tema-jaso",
        imagen: "assets/img/fondo/apartado Jasso.jpg"
    },

    {
        usuario: "enrique",
        nombre: "Ing. Luis Enrique Arredondo Facio",
        area: "Gestión Operativa",
        clase: "tema-enrique",
        imagen: "assets/img/fondo/apartado Enrique.jpg"
    }

];

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarPaneles);

/* ==========================================================
   INICIAR PANEL
========================================================== */

async function iniciarPaneles() {

    console.log("📌 Inicializando paneles...");

    await cargarPendientes();

crearPanelPendientes();

crearPizarronPendientes();

// actualizarResumenGeneral();
// actualizarTableroEstados();
// actualizarUsuariosActivos();
// actualizarBitacora();

    activarRealtime();

}

/* ==========================================================
   CARGAR PENDIENTES DESDE SUPABASE
========================================================== */

async function cargarPendientes() {

    console.log("📥 Cargando pendientes...");

    const { data, error } = await supabaseClient

        .from("pendientes")

        .select("*")

        .order("folio", {

            ascending: false

        });

    if (error) {

        console.error("❌ Error al cargar pendientes:", error);

        pendientes = [];

        return;

    }

    pendientes = data || [];

    console.log(

        `✅ ${pendientes.length} pendiente(s) cargado(s).`

    );

}

/* ==========================================================
   CREAR PANEL DE PENDIENTES
========================================================== */

function crearPanelPendientes() {

    const contenedor =
        document.getElementById("pendientesUsuarios");

    if (!contenedor) {

        console.error("❌ No existe #pendientesUsuarios");

        return;

    }

    contenedor.innerHTML = "";

    RESPONSABLES.forEach(usuario => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "tarjeta-pendiente";

console.log(usuario.nombre);
console.log(usuario.imagen);

        tarjeta.innerHTML = `

            <img
                src="${usuario.imagen}"
                class="tarjeta-imagen"
                alt="${usuario.nombre}">

            <div class="tarjeta-info">

                <h3>${usuario.nombre}</h3>

                <p>${usuario.area}</p>

                <div class="tarjeta-botones">

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${usuario.usuario}','pendientes')">

                        <i class="fa-solid fa-list-check"></i>

                        Pendientes

                    </button>

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${usuario.usuario}','tablas')">

                        <i class="fa-solid fa-table"></i>

                        Tablas y Gráficas

                    </button>

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${usuario.usuario}','grafica_pastel')">

                        <i class="fa-solid fa-chart-pie"></i>

                        Gráfica Pastel

                    </button>

                </div>

            </div>

        `;

        contenedor.appendChild(tarjeta);

    });

}

/* ==========================================================
   VALIDAR ACCESO A LOS APARTADOS
========================================================== */

function abrirApartado(usuarioDestino, pagina) {

    const usuarioActual =
        (sessionStorage.getItem("usuarioSesionActual") || "")
        .toLowerCase();

    usuarioDestino =
        usuarioDestino.toLowerCase();

    // El administrador puede acceder a todo
    if (usuarioActual === "augusto") {

        window.location.href =
            `${pagina}.html?usuario=${usuarioDestino}`;

        return;

    }

    // Cada usuario solo puede entrar a su propio apartado
    if (usuarioActual !== usuarioDestino) {

        alert(
            "No tienes permiso para acceder al apartado de otro usuario."
        );

        return;

    }

    window.location.href =
        `${pagina}.html?usuario=${usuarioDestino}`;

}

/* ==========================================================
   CREAR PIZARRÓN DE PENDIENTES
========================================================== */

function crearPizarronPendientes() {

    const contenedor =
        document.getElementById("pizarronPendientes");

    if (!contenedor) {

        console.error("❌ No existe #pizarronPendientes");

        return;

    }

    contenedor.innerHTML = "";

    RESPONSABLES.forEach(usuario => {

        const listaUsuario = pendientes.filter(p => {

            if (p.estado === "Finalizado") {

                return false;

            }

            const propietario =

                p.asignado_a ||

                p.creado_por ||

                p.usuario ||

                p.responsable ||

                "";

            return propietario.toLowerCase() === usuario.usuario;

        });

        contenedor.appendChild(

            crearColumnaPizarron(

                usuario,

                listaUsuario

            )

        );

    });

}

/* ==========================================================
   CREAR COLUMNA DEL PIZARRÓN
========================================================== */

function crearColumnaPizarron(usuario, listaPendientes) {

    const columna = document.createElement("div");

    columna.className =
        `columna-pizarron ${usuario.clase}`;

    columna.innerHTML = `

        <div class="cabecera-pizarron">

            <h3>${usuario.nombre}</h3>

            <small>${usuario.area}</small>

        </div>

        <div class="estado-pizarron">

            ${listaPendientes.length} pendiente(s)

        </div>

        <div class="lista-pizarron"></div>

    `;

    const lista =
        columna.querySelector(".lista-pizarron");

    if (listaPendientes.length === 0) {

        lista.innerHTML = `

            <div class="sin-pendientes">

                Sin pendientes registrados

            </div>

        `;

        return columna;

    }

listaPendientes.forEach(pendiente => {

console.log(pendiente);

    const tarjeta = document.createElement("div");

    tarjeta.className = "item-pizarron";

    tarjeta.innerHTML = `

       <div class="titulo-pizarron">

    <strong>
        ${pendiente.titulo || "Sin título"}
    </strong>

    ${
        pendiente.descripcion
            ? `
                <div class="descripcion-pizarron">
                    ${pendiente.descripcion}
                </div>
              `
            : ""
    }

</div>

        </div>

        <div class="datos-pizarron">

            <small><b>Folio:</b> ${pendiente.folio ?? "-"}</small>

            <small><b>Prioridad:</b> ${pendiente.prioridad || "-"}</small>

            <small><b>Estado:</b> ${pendiente.estado}</small>

        </div>

        <div class="acciones-pizarron">

<button
        class="btn-dashboard btn-proceso"
        onclick="cambiarEstadoPendiente('${pendiente.id}','En Proceso')">

        <i class="fa-solid fa-spinner"></i>

        En Proceso

    </button>

            <button
                class="btn-dashboard btn-finalizar"
                onclick="finalizarPendiente('${pendiente.id}')">

                <i class="fa-solid fa-circle-check"></i>

                Finalizar

            </button>

        </div>

    `;

    lista.appendChild(tarjeta);

});

    return columna;

}

/* ==========================================================
   ACTUALIZAR PANELES
========================================================== */

console.log("Entró a actualizarPaneles");

async function actualizarPaneles() {

    console.log("🔄 Actualizando paneles...");

    await cargarPendientes();

    crearPanelPendientes();

    crearPizarronPendientes();

}

async function cambiarEstadoPendiente(id, estado) {

    const { error } = await supabaseClient
        .from("pendientes")
        .update({

            estado: estado,
            kanban: estado

        })
        .eq("id", id);

    if (error) {

        console.error(error);
        return;

    }

    await actualizarPaneles();

}

/* ==========================================================
   FINALIZAR PENDIENTE
========================================================== */
async function finalizarPendiente(id) {

    if (!confirm("¿Deseas finalizar este pendiente?")) {

        return;

    }

    // Buscar el pendiente antes de actualizarlo
    const pendiente = pendientes.find(p => p.id == id);

    const { error } = await supabaseClient



    .from("pendientes")

    .delete()

    .eq("id", id);

    if (error) {

        console.error(error);

        alert("No fue posible finalizar el pendiente.");

        return;

    }


    await actualizarPaneles();

}

/* ==========================================================
   SUPABASE REALTIME
========================================================== */

function activarRealtime() {

    if (canalBitacora) {

        supabaseClient.removeChannel(canalBitacora);

    }

    canalBitacora = supabaseClient

        .channel("bitacora-dashboard")

        .on(

            "postgres_changes",

            {

                event: "*",

                schema: "public",

                table: "bitacora"

            },

            async () => {

                console.log("📡 Bitácora actualizada");

                await cargarBitacora();

            }

        )

        .subscribe();

}
/* ==========================================================
   FUNCIONES PÚBLICAS
========================================================== */

window.actualizarPaneles = actualizarPaneles;

window.abrirApartado = abrirApartado;

window.finalizarPendiente = finalizarPendiente;

window.cambiarEstadoPendiente = cambiarEstadoPendiente;
/* ==========================================================
   VERIFICACIÓN FINAL
========================================================== */

console.log("======================================");
console.log("✅ paneles.js inicializado correctamente");
console.log("======================================");