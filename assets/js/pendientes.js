/* ==========================================================
   GESTIÓN OPERATIVA
   MÓDULO DE PENDIENTES
   Versión 2.0
========================================================== */



/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pendientes = [];
let ultimoFolio = 0;
let pendienteEditando = null;
let canalRealtime = null;

/* ==========================================================
   ELEMENTOS DEL DOM
========================================================== */

const formulario = document.getElementById("formPendiente");

const txtTitulo = document.getElementById("titulo");

const txtFecha = document.getElementById("fecha");
const txtHora = document.getElementById("hora");

const cmbPrioridad = document.getElementById("prioridad");

const btnVoz = document.getElementById("btnVoz");

const cuerpoTabla = document.getElementById("listaPendientes");

const txtBuscar = document.getElementById("buscarPendiente");

const kanbanPendientes = document.getElementById("pendientes");
const kanbanProceso = document.getElementById("proceso");
const kanbanFinalizados = document.getElementById("finalizados");

const totalPendientes = document.getElementById("totalPendientes");
const totalProceso = document.getElementById("totalProceso");
const totalFinalizados = document.getElementById("totalFinalizados");
const totalUrgentes = document.getElementById("totalUrgentes");

const porcentajeProgreso = document.getElementById("porcentajeProgreso");
const barraProgreso = document.querySelector(".barra");

/* ==========================================================
   INICIAR SISTEMA
========================================================== */

async function iniciarSistema() {

    console.clear();

    console.log("========================================");

    console.log("GESTIÓN OPERATIVA");

    console.log("Módulo Pendientes");

    console.log("Versión 2.0");

    console.log("========================================");

await cargarUltimoFolioSupabase();

await cargarPendientesSupabase();

    actualizarTabla();

    actualizarKanban();

    actualizarEstadisticas();

console.log("Formulario:", formulario);
console.log("Botón conectado correctamente");

    registrarEventos();


    iniciarRealtime();

    iniciarDragDrop();

}

/* ==========================================================
   EVENTOS
========================================================== */

function registrarEventos() {

    formulario.addEventListener(

        "submit",

        async (e)=>{

            e.preventDefault();

            await crearPendiente();

        }

    );

}

/* ==========================================================
   FOLIOS
========================================================== */

async function generarFolio() {

    const { data, error } = await supabaseClient

        .from("pendientes")

        .select("folio")

        .order("folio", { ascending: false })

        .limit(1)

        .maybeSingle();

    if (error) {

        console.error(error);

        return 1;

    }

    return data

        ? Number(data.folio) + 1

        : 1;

}

function cargarUltimoFolio(){

    ultimoFolio = Number(

        localStorage.getItem(

            "ultimoFolioPendiente"

        )

    ) || 0;

}

async function cargarUltimoFolioSupabase() {

    const { data, error } = await supabaseClient
        .from("pendientes")
        .select("folio")
        .order("folio", { ascending: false })
        .limit(1);

    if (error) {

        console.error(error);
        return;

    }

    ultimoFolio =
        data.length > 0
            ? Number(data[0].folio)
            : 0;

    const folioActual =
        document.getElementById("folioActual");

    if (folioActual) {

        folioActual.textContent =
            "#" + String(ultimoFolio + 1).padStart(6, "0");

    }

}

function guardarUltimoFolio(){

    localStorage.setItem(

        "ultimoFolioPendiente",

        ultimoFolio

    );

}

/* ==========================================================
   SUPABASE
========================================================== */

async function cargarPendientesSupabase() {

    const usuario =
        sessionStorage.getItem("usuarioSesionActual");

    let consulta = supabaseClient
        .from("pendientes")
        .select("*");

    // Administrador y Jasso pueden ver todo
    if (usuario !== "augusto" && usuario !== "jasso") {

        consulta = consulta.eq(
            "asignado_a",
            usuario
        );

    }

    const {

        data,

        error

    } = await consulta.order(
        "folio",
        {
            ascending: true
        }
    );


console.log("Usuario:", usuario);
console.log("Datos recibidos:", data);
console.log("Error:", error);


    if (error) {

        console.error(error);

        return;

    }


    
    pendientes = data || [];

}

async function guardarPendienteSupabase(pendiente){

    const { data, error } = await supabaseClient

        .from("pendientes")

        .insert([pendiente])

        .select()

        .single();

    if(error){

        console.error("ERROR COMPLETO:", error);
        console.error("Mensaje:", error.message);
        console.error("Detalles:", error.details);
        console.error("Hint:", error.hint);
        console.error("Código:", error.code);

        return null;

    }

    if (typeof actualizarPaneles === "function") {

        await actualizarPaneles();

    }

    if (typeof cargarResumenDashboard === "function") {

       

    }

    if (typeof cargarBitacora === "function") {

        await cargarBitacora();

    }

    return data;

}

/* ==========================================================
   HISTORIAL
========================================================== */

async function registrarHistorial(

    pendienteId,

    accion,

    descripcion

){

    try{

        const usuarioId = sessionStorage.getItem(

            "usuarioId"

        );

        const pendiente = pendientes.find(
    p => p.id === Number(id)
);

        const { error } = await supabaseClient

            .from("historial_pendientes")

            .insert([{

                pendiente_id: pendienteId,

                usuario_id: usuarioId,

                accion,

                descripcion

            }]);

       if (error) {

    console.error("ERROR HISTORIAL COMPLETO:", error);
    console.error("Mensaje:", error.message);
    console.error("Detalles:", error.details);
    console.error("Hint:", error.hint);
    console.error("Código:", error.code);

}

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   REALTIME
========================================================== */

function iniciarRealtime(){

    if(canalRealtime){

        supabaseClient.removeChannel(

            canalRealtime

        );

    }

    canalRealtime = supabaseClient

    .channel(

        "pendientes"

    )

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"pendientes"

        },

        async()=>{

            await cargarPendientesSupabase();

            actualizarTabla();

            actualizarKanban();

            actualizarEstadisticas();

        }

    )

    .subscribe();

}

/* ==========================================================
   CREAR
========================================================== */



/* ==========================================================
   TABLA
========================================================== */

function actualizarTabla() {

    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = "";

pendientes
    .filter(p => p.estado !== "Finalizado")
    .forEach((pendiente) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${pendiente.folio}</td>
            <td>${pendiente.titulo}</td>
            <td>${pendiente.asignado_a}</td>
            <td>
                <span class="prioridad-${pendiente.prioridad.toLowerCase()}">
                    ${pendiente.prioridad}
                </span>
            </td>
            <td>${pendiente.estado}</td>
            <td>${pendiente.fecha || "-"}</td>
            <td>${pendiente.hora || "-"}</td>
            <td>

                

               <button
    class="btn-eliminar"
    onclick="console.log('ID:', '${pendiente.id}'); eliminarPendiente('${pendiente.id}')">
    🗑️
</button>

            </td>
        `;

        cuerpoTabla.appendChild(fila);

    });

}

/* ==========================================================
   ESTADÍSTICAS
========================================================== */
function actualizarEstadisticas() {

    const activos = pendientes.filter(
        p => p.estado === "Pendiente"
    ).length;

    const proceso = pendientes.filter(
        p => p.estado === "En Proceso"
    ).length;

    const finalizados = pendientes.filter(
        p => p.estado === "Finalizado"
    ).length;

    const urgentes = pendientes.filter(
        p =>
            p.prioridad === "Urgente" &&
            p.estado !== "Finalizado"
    ).length;

    if (totalPendientes)
        totalPendientes.textContent = activos;

    if (totalProceso)
        totalProceso.textContent = proceso;

    if (totalFinalizados)
        totalFinalizados.textContent = finalizados;

    if (totalUrgentes)
        totalUrgentes.textContent = urgentes;

    const totalGeneral =
        activos + proceso + finalizados;

    const porcentaje =
        totalGeneral === 0
            ? 0
            : Math.round(
                (finalizados * 100) /
                totalGeneral
            );

    if (porcentajeProgreso)
        porcentajeProgreso.textContent =
            porcentaje + "%";

    if (barraProgreso)
        barraProgreso.style.width =
            porcentaje + "%";

}
/* ==========================================================
   KANBAN
========================================================== */

function actualizarKanban() {

    if (!kanbanPendientes) return;

    kanbanPendientes.innerHTML = "";

    kanbanProceso.innerHTML = "";

    kanbanFinalizados.innerHTML = "";

pendientes
    .filter(p => p.estado !== "Finalizado")
    .forEach(crearTarjetaKanban);
}

function crearTarjetaKanban(pendiente) {

    const tarjeta = document.createElement("div");

    tarjeta.className = "tarjeta-kanban";

    tarjeta.draggable = true;

    tarjeta.dataset.id = pendiente.id;
tarjeta.innerHTML = `

   <div class="folio-kanban">
    <span class="texto-folio">Folio:</span>
    <span class="numero-folio">${pendiente.folio}</span>
</div>

    <h3>${pendiente.titulo}</h3>


    <div class="info-kanban">

        <small>
            <strong>Creó:</strong>
            ${pendiente.creado_por}
        </small>

        <small>
            <strong>Asignado:</strong>
            ${pendiente.asignado_a}
        </small>

    </div>

    <span class="badge ${pendiente.prioridad.toLowerCase()}">
        ${pendiente.prioridad}
    </span>

`;

    tarjeta.addEventListener("dragstart", () => {

        tarjeta.classList.add("dragging");

    });

    tarjeta.addEventListener("dragend", () => {

        tarjeta.classList.remove("dragging");

    });

    switch (pendiente.estado) {

        case "Pendiente":

            kanbanPendientes.appendChild(tarjeta);

            break;

        case "En Proceso":

            kanbanProceso.appendChild(tarjeta);

            break;

        case "Finalizado":

            kanbanFinalizados.appendChild(tarjeta);

            break;

    }

}

/* ==========================================================
   ELIMINAR
========================================================== */

async function eliminarPendiente(id) {

    if (!confirm("¿Eliminar este pendiente?")) {

        return;

    }

console.log("ID a eliminar:", id);



    const { error } = await supabaseClient

        .from("pendientes")

        .delete()

       .eq("id", Number(id));

   if (error) {

    console.error("ERROR SUPABASE:", error);

} else {

    console.log("Pendiente eliminado correctamente");

}


    await cargarPendientesSupabase();

    actualizarTabla();

    actualizarKanban();

    actualizarEstadisticas();

}

/* ==========================================================
   EDITAR
========================================================== */

function editarPendiente(id) {

    const pendiente = pendientes.find(

        p => p.id === id

    );

    if (!pendiente) {

        return;

    }

    pendienteEditando = pendiente;

    txtTitulo.value = pendiente.titulo;


    txtFecha.value = pendiente.fecha || "";

    txtHora.value = pendiente.hora || "";

}

/* ==========================================================
   CREAR / EDITAR
========================================================== */

async function crearPendiente() {

console.log("🚀 crearPendiente ejecutada");

    const titulo = txtTitulo.value.trim();

    if (!titulo) {
        alert("Debes escribir un título.");
        txtTitulo.focus();
        return;
    }

 const usuario = sessionStorage.getItem("usuarioSesionActual");

let responsable = usuario;

let tituloFinal = titulo;

/* ============================================
   SOLO JASSO Y AUGUSTO PUEDEN ASIGNAR
============================================ */

if (usuario === "jasso" || usuario === "augusto") {

    const usuarios = {
        elizabeth: "elizabeth",
        enrique: "enrique",
        jasso: "jasso"
    };

    const palabras = titulo.trim().split(" ");

    const ultimaPalabra = palabras.pop().toLowerCase();

    if (usuarios[ultimaPalabra]) {

        responsable = usuarios[ultimaPalabra];

        tituloFinal = palabras.join(" ");

    } else {

        palabras.push(ultimaPalabra);

        tituloFinal = palabras.join(" ");

    }

}

/* ============================================
   DATOS DEL PENDIENTE
============================================ */

const datos = {

    folio: await generarFolio(),

    titulo: tituloFinal,

    prioridad: cmbPrioridad.value,

    estado: "Pendiente",

    creado_por: usuario,

    asignado_a: responsable

};

console.log("Guardando:", datos);

const pendiente = await guardarPendienteSupabase(datos);

if (!pendiente) {

    alert("No fue posible guardar el pendiente.");

    return;

}

if (typeof window.registrarMovimiento === "function") {

}

if (typeof cargarBitacora === "function") {

    await cargarBitacora();

}

formulario.reset();

pendienteEditando = null;

await cargarUltimoFolioSupabase();

await cargarPendientesSupabase();

actualizarTabla();

actualizarKanban();

actualizarEstadisticas();

console.log("Pendiente creado correctamente.");

}
/* ==========================================================
   DRAG & DROP
========================================================== */

function iniciarDragDrop() {

    const columnas = [

        kanbanPendientes,

        kanbanProceso,

        kanbanFinalizados

    ];

    columnas.forEach(columna => {

        columna.addEventListener("dragover", e => {

            e.preventDefault();

        });

        columna.addEventListener(

            "drop",

            moverTarjeta

        );

    });

}

async function moverTarjeta(e) {

    e.preventDefault();

    const tarjeta = document.querySelector(".dragging");

    if (!tarjeta) return;

    const id = tarjeta.dataset.id;

    let estado = "Pendiente";

    if (e.currentTarget === kanbanProceso) {

        estado = "En Proceso";

    }

    if (e.currentTarget === kanbanFinalizados) {

        estado = "Finalizado";

    }

    const { error } = await supabaseClient

        .from("pendientes")

        .update({

            estado

        })

        .eq("id", id);

    if (error) {

        console.error(error);

        return;

    }

    registrarMovimiento(

        "Cambio de estado",

        estado

    );

}

/* ==========================================================
   BÚSQUEDA
========================================================== */

txtBuscar.addEventListener(

    "input",

    buscarPendientes

);

function buscarPendientes() {

    const texto = txtBuscar.value

        .toLowerCase()

        .trim();

    const filas = cuerpoTabla.querySelectorAll("tr");

    filas.forEach(fila => {

        fila.style.display =

            fila.textContent

            .toLowerCase()

            .includes(texto)

            ? ""

            : "none";

    });

}



/* ==========================================================
   NOTIFICACIONES
========================================================== */

function mostrarNotificacion(

    mensaje

){

    console.log(

        "🔔",

        mensaje

    );

}

/* ==========================================================
   EXPORTAR EXCEL
========================================================== */

function exportarExcel(){

    const hoja = XLSX.utils.json_to_sheet(

        pendientes

    );

    const libro =

    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        libro,

        hoja,

        "Pendientes"

    );

    XLSX.writeFile(

        libro,

        "Pendientes.xlsx"

    );

}

/* ==========================================================
   EXPORTAR PDF
========================================================== */

function exportarPDF(){

    const doc = new jspdf.jsPDF();

    doc.setFontSize(18);

    doc.text(

        "Gestión Operativa",

        15,

        20

    );

    let y=35;

    pendientes.forEach(p=>{

        doc.text(

            p.folio+

            " - "+

            p.titulo,

            15,

            y

        );

        y+=10;

    });

    doc.save(

        "Pendientes.pdf"

    );

}

/* ==========================================================
   PERMISOS
========================================================== */

function usuarioPuedeEditar(){

    const usuario=

    sessionStorage.getItem(

        "usuarioSesionActual"

    );

    return usuario==="augusto"

    ||

    usuario==="jasso";

}

/* ==========================================================
   MODO CLARO / OSCURO
========================================================== */

const btnModo = document.getElementById("btnModo");

if (btnModo) {

    // Cargar tema guardado
    const temaGuardado = localStorage.getItem("temaPendientes");

    if (temaGuardado === "claro") {

        document.body.classList.add("claro");

        btnModo.innerHTML = "🌙 Modo Oscuro";

    } else {

        btnModo.innerHTML = "☀️ Modo Claro";

    }

    btnModo.addEventListener("click", () => {

        document.body.classList.toggle("claro");

        if (document.body.classList.contains("claro")) {

            localStorage.setItem("temaPendientes", "claro");

            btnModo.innerHTML = "🌙 Modo Oscuro";

        } else {

            localStorage.setItem("temaPendientes", "oscuro");

            btnModo.innerHTML = "☀️ Modo Claro";

        }

    });

}

/* ==========================================================
   DICTADO POR VOZ
========================================================== */
if (btnVoz) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Este navegador no soporta reconocimiento de voz.");

    } else {

        const reconocimiento = new SpeechRecognition();

        reconocimiento.lang = "es-MX";
        reconocimiento.continuous = false;
        reconocimiento.interimResults = false;

        btnVoz.addEventListener("click", () => {

            console.log("🎤 Iniciando reconocimiento...");
            reconocimiento.start();

        });

        reconocimiento.onstart = () => {

            console.log("✅ Micrófono iniciado");

        };

        reconocimiento.onspeechstart = () => {

            console.log("🗣️ Empezaste a hablar");

        };

        reconocimiento.onresult = (event) => {

            console.log("📢 Resultado:", event);

           txtTitulo.value = event.results[0][0].transcript;

        };

        reconocimiento.onerror = (event) => {

            console.error("❌ Error:", event);

        };

        reconocimiento.onend = () => {

            console.log("🔚 Reconocimiento finalizado");

        };

    }

}



window.editarPendiente = editarPendiente;
window.eliminarPendiente = eliminarPendiente;



