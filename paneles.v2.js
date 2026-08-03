"use strict";

/* ==========================================================
   PANELES V2
   SISTEMA DE GESTIÓN OPERATIVA
========================================================== */

console.log("======================================");
console.log(" PANEL DE PENDIENTES V2 ");
console.log("======================================");

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pendientes = [];

let usuarioActual = null;

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
        imagen: "assets/img/fondo/apartado Enrique .jpg"
    }

];

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    iniciarPanel

);

async function iniciarPanel() {

    console.log("Inicializando Paneles V2...");

    usuarioActual =
        (
            sessionStorage.getItem("usuarioSesionActual")
            || ""
        ).toLowerCase();

    await cargarPendientes();

    crearPanelPendientes();

    crearPizarronPendientes();

    activarRealtime();

}

/* ==========================================================
   CARGAR PENDIENTES
========================================================== */

async function cargarPendientes() {

    console.log("Cargando pendientes...");

    try {

        const { data, error } = await supabaseClient

            .from("pendientes")

            .select("*")

            .order("folio", {

                ascending: false

            });

        if (error) throw error;

        pendientes = data || [];

        console.log(

            `Pendientes cargados: ${pendientes.length}`

        );

    }

    catch (error) {

        console.error(

            "Error al cargar pendientes:",

            error

        );

        pendientes = [];

    }

}

/* ==========================================================
   CREAR PANEL DE RESPONSABLES
========================================================== */

function crearPanelPendientes() {

    const contenedor =
        document.getElementById("pendientesUsuarios");

    if (!contenedor) {

        console.error("No existe #pendientesUsuarios");

        return;

    }

    contenedor.innerHTML = "";

    RESPONSABLES.forEach(responsable => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "tarjeta-pendiente";

        tarjeta.innerHTML = `

            <img
                src="${responsable.imagen}"
                class="tarjeta-imagen"
                alt="${responsable.nombre}">

            <div class="tarjeta-info">

                <h3>

                    ${responsable.nombre}

                </h3>

                <p>

                    ${responsable.area}

                </p>

                <div class="tarjeta-botones">

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${responsable.usuario}','pendientes')">

                        <i class="fa-solid fa-list-check"></i>

                        Pendientes

                    </button>

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${responsable.usuario}','tablas')">

                        <i class="fa-solid fa-table"></i>

                        Tablas y Gráficas

                    </button>

                    <button
                        class="btn-dashboard"
                        onclick="abrirApartado('${responsable.usuario}','grafica_pastel')">

                        <i class="fa-solid fa-chart-pie"></i>

                        Gráfica Pastel

                    </button>

                </div>

            </div>

        `;

        contenedor.appendChild(tarjeta);

    });

    console.log("Panel de responsables creado.");

}

/* ==========================================================
   VALIDAR ACCESO A LOS APARTADOS
========================================================== */

function abrirApartado(usuarioDestino, pagina) {

    if (!usuarioActual) {

        alert("Debes iniciar sesión.");

        return;

    }

    usuarioDestino =
        usuarioDestino.toLowerCase();

    // Administrador
    if (usuarioActual === "augusto") {

        window.location.href =
            `${pagina}.html?usuario=${usuarioDestino}`;

        return;

    }

    // Invitado
    if (usuarioActual === "invitado") {

        alert(
            "El usuario Invitado no tiene permisos para acceder a este apartado."
        );

        return;

    }

    // Cada usuario entra únicamente a su apartado
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
   VALIDAR ACCESO A LOS APARTADOS
========================================================== */

function abrirApartado(usuarioDestino, pagina) {

    if (!usuarioActual) {

        alert("Debes iniciar sesión.");

        return;

    }

    usuarioDestino =
        usuarioDestino.toLowerCase();

    // Administrador
    if (usuarioActual === "augusto") {

        window.location.href =
            `${pagina}.html?usuario=${usuarioDestino}`;

        return;

    }

    // Invitado
    if (usuarioActual === "invitado") {

        alert(
            "El usuario Invitado no tiene permisos para acceder a este apartado."
        );

        return;

    }

    // Cada usuario entra únicamente a su apartado
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
   CREAR COLUMNA
========================================================== */

function crearColumnaPizarron(responsable, listaPendientes) {

    const columna =
        document.createElement("div");

    columna.className =
        `columna-pizarron ${responsable.clase}`;

    columna.innerHTML = `

        <div class="cabecera-pizarron">

            <h3>${responsable.nombre}</h3>

            <small>${responsable.area}</small>

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

    listaPendientes.forEach(p => {

        lista.appendChild(

            crearTarjetaPendiente(p)

        );

    });

    return columna;

}

/* ==========================================================
   CREAR COLUMNA
========================================================== */

function crearColumnaPizarron(responsable, listaPendientes) {

    const columna =
        document.createElement("div");

    columna.className =
        `columna-pizarron ${responsable.clase}`;

    columna.innerHTML = `

        <div class="cabecera-pizarron">

            <h3>${responsable.nombre}</h3>

            <small>${responsable.area}</small>

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

    listaPendientes.forEach(p => {

        lista.appendChild(

            crearTarjetaPendiente(p)

        );

    });

    return columna;

}

/* ==========================================================
   FINALIZAR PENDIENTE
========================================================== */

async function finalizarPendiente(id) {

    const confirmar = confirm(

        "¿Deseas marcar este pendiente como Finalizado?"

    );

    if (!confirmar) return;

    try {

        const { error } = await supabaseClient

            .from("pendientes")

            .update({

                estado: "Finalizado",

                kanban: "Finalizado",

                fecha_finalizacion:
                    new Date().toISOString()

            })

            .eq("id", id);

        if (error) throw error;

        console.log(

            "✅ Pendiente finalizado."

        );

        await cargarPendientes();

        crearPizarronPendientes();

    }

    catch (error) {

        console.error(

            "Error al finalizar:",

            error

        );

        alert(

            "No fue posible finalizar el pendiente."

        );

    }

}

/* ==========================================================
   ACTUALIZAR PANEL
========================================================== */

async function actualizarPanel() {

    await cargarPendientes();

    crearPanelPendientes();

    crearPizarronPendientes();

}

/* ==========================================================
   REALTIME
========================================================== */

function activarRealtime() {

    supabaseClient

        .channel("dashboard-paneles-v2")

        .on(

            "postgres_changes",

            {

                event: "*",

                schema: "public",

                table: "pendientes"

            },

            async () => {

                console.log("📡 Cambio detectado.");

                await actualizarPanel();

            }

        )

        .subscribe((estado) => {

            console.log("Realtime:", estado);

        });

}

/* ==========================================================
   FUNCIONES PÚBLICAS
========================================================== */

window.abrirApartado = abrirApartado;

window.finalizarPendiente = finalizarPendiente;

window.actualizarPanel = actualizarPanel;

/* ==========================================================
   FIN DEL MÓDULO
========================================================== */

console.log("======================================");
console.log("✅ paneles.v2.js inicializado correctamente");
console.log("======================================");