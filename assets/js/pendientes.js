
let pendientes =
JSON.parse(localStorage.getItem("pendientes")) || [];

let bitacoraMini =
JSON.parse(localStorage.getItem("bitacoraMini")) || [];

let tabActual = "activos";

let historialPermanentePendientes =
JSON.parse(localStorage.getItem("historialPermanentePendientes")) || [];

let respaldosAutomaticosPendientes =
JSON.parse(localStorage.getItem("respaldosAutomaticosPendientes")) || [];

let actualizacionRemotaEnProceso = false;


const datosUsuarios = {
    elizabeth:{
        clase:"tema-elizabeth",
        fila:"fila-elizabeth",
        nombre:"Lic. Elizabeth",
        area:"Control Financiero",
        img:"assets/img/team/2.jpg"
    },
    jasso:{
        clase:"tema-jaso",
        fila:"fila-jaso",
        nombre:"Lic. Jasso",
        area:"Asuntos Consultivos",
        img:"assets/img/team/3.jpg"
    },
    enrique:{
        clase:"tema-enrique",
        fila:"fila-enrique",
        nombre:"Lic. Enrique",
        area:"Asuntos Contenciosos",
        img:"assets/img/team/1.jpg"
    }
};

;
function obtenerUsuarioActivoSistema(){

    const selector =
        document.getElementById("usuario");

    const usuarioSelect =
        selector ? selector.value : "";

    if(usuarioSelect){
        return usuarioSelect;
    }

    return sessionStorage.getItem("usuarioSesionActual") || "";

}

function sincronizarSelectorConUsuarioActivo(){

    const usuarioActivo =
        obtenerUsuarioActivoSistema();

    const selector =
        document.getElementById("usuario");

    if(selector && usuarioActivo && selector.value !== usuarioActivo){
        selector.value = usuarioActivo;
    }

}

function puedeModificarPendiente(pendiente){

    const usuarioActivo =
        obtenerUsuarioActivoSistema();

    if(!usuarioActivo){
        alert("Primero selecciona o inicia sesión con un usuario.");
        return false;
    }

    if(!pendiente){
        alert("No se encontró el pendiente.");
        return false;
    }

    if(pendiente.usuario !== usuarioActivo){
        alert(
            "No puedes modificar este pendiente porque pertenece a " +
            pendiente.usuario +
            ". Usuario activo: " +
            usuarioActivo
        );
        return false;
    }

    return true;

}


if(localStorage.getItem("modoPendientes") === "oscuro"){
    document.body.classList.add("modo-oscuro");
}

const sesion = JSON.parse(
    localStorage.getItem("usuarioSesion")
);

if (!sesion) {

    window.location.href = "index.html";

} else {

    const usuarioActivoInicial = sesion.usuario;

    console.log("Sesión completa:", sesion);
console.log("sesion.usuario:", sesion.usuario);
console.log("sesion.nombre:", sesion.nombre);

    const selector = document.getElementById("usuario");

    if (selector) {

        selector.value = usuarioActivoInicial;

    }

    sessionStorage.setItem(
        "usuarioSesionActual",
        usuarioActivoInicial
    );

    localStorage.setItem(
        "usuarioRecordadoSistema",
        usuarioActivoInicial
    );

}

function cambiarModo(){
    document.body.classList.toggle("modo-oscuro");

    if(document.body.classList.contains("modo-oscuro")){
        localStorage.setItem("modoPendientes","oscuro");
    }else{
        localStorage.setItem("modoPendientes","claro");
    }
}

function aplicarTemaUsuario(){
    document.body.classList.remove(
        "tema-elizabeth",
        "tema-jaso",
        "tema-enrique"
    );

    let usuario = document.getElementById("usuario").value;

    if(datosUsuarios[usuario]){
        document.body.classList.add(datosUsuarios[usuario].clase);

        document.getElementById("perfilImg").src = datosUsuarios[usuario].img;
        document.getElementById("perfilNombre").innerText = datosUsuarios[usuario].nombre;
        document.getElementById("perfilArea").innerHTML = datosUsuarios[usuario].area + ' <span class="estado-usuario-activo">🟢 Activa</span>';
    }
}

function abrirFecha(){
    let fecha = document.getElementById("fecha");

    if(fecha.showPicker){
        fecha.showPicker();
    }
}

function abrirHora(){
    let hora = document.getElementById("hora");

    if(hora.showPicker){
        hora.showPicker();
    }
}

function guardarPendientes(){
    localStorage.setItem(
        "pendientes",
        JSON.stringify(pendientes)
    );

    crearRespaldoAutomatico("Cambio guardado en pendientes");
}

/* ===========================
   SUPABASE
=========================== */

async function guardarPendienteSupabase(nuevo){

    const { data: usuarioActual, error: errorUsuario } = await supabaseClient
        .from("usuarios")
        .select("id")
        .eq("usuario", nuevo.usuario.toLowerCase())
        .single();

    if(errorUsuario){
        console.error("No se encontró el usuario:", errorUsuario);
        return;
    }

    const { data, error } = await supabaseClient
        .from("pendientes")
        .insert([{
            titulo: nuevo.pendiente,
            descripcion: "",
            prioridad: nuevo.prioridad,
            estado: nuevo.estado,
            asignado_a: usuarioActual.id,
            creado_por: usuarioActual.id
        }]);

    if(error){
        console.error("Error al guardar pendiente:", error);
    }else{
        console.log("Pendiente guardado en Supabase");
    }

}


function obtenerFechaCompletaMX(){
    return new Date().toLocaleString("es-MX", {
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
    });
}

function registrarHistorialPermanente(texto){

    const usuarioActual =
        document.getElementById("usuario")
        ? document.getElementById("usuario").value || "Sistema"
        : "Sistema";

    historialPermanentePendientes.unshift({
        id:Date.now(),
        texto:texto,
        usuario:usuarioActual,
        fechaISO:new Date().toISOString(),
        fechaTexto:obtenerFechaCompletaMX(),
        totalPendientes:pendientes.length,
        activos:pendientes.filter(p => !p.finalizado).length,
        finalizados:pendientes.filter(p => p.finalizado).length
    });

    historialPermanentePendientes =
        historialPermanentePendientes.slice(0,500);

    localStorage.setItem(
        "historialPermanentePendientes",
        JSON.stringify(historialPermanentePendientes)
    );

    renderizarPanelRespaldo();
}

function crearRespaldoAutomatico(motivo){

    const respaldo = {
        id:Date.now(),
        motivo:motivo || "Respaldo automático",
        fechaISO:new Date().toISOString(),
        fechaTexto:obtenerFechaCompletaMX(),
        pendientes:pendientes,
        bitacoraMini:bitacoraMini,
        historialPermanentePendientes:historialPermanentePendientes
    };

    localStorage.setItem(
        "respaldoAutomaticoPendientes",
        JSON.stringify(respaldo)
    );

    respaldosAutomaticosPendientes.unshift({
        id:respaldo.id,
        motivo:respaldo.motivo,
        fechaISO:respaldo.fechaISO,
        fechaTexto:respaldo.fechaTexto,
        totalPendientes:pendientes.length
    });

    respaldosAutomaticosPendientes =
        respaldosAutomaticosPendientes.slice(0,10);

    localStorage.setItem(
        "respaldosAutomaticosPendientes",
        JSON.stringify(respaldosAutomaticosPendientes)
    );

    renderizarPanelRespaldo();
}

function renderizarPanelRespaldo(){

    const ultimo = document.getElementById("ultimoRespaldoTexto");
    const total = document.getElementById("totalHistorialTexto");

    if(ultimo){
        if(respaldosAutomaticosPendientes.length > 0){
            ultimo.innerText =
                respaldosAutomaticosPendientes[0].fechaTexto +
                " · " +
                respaldosAutomaticosPendientes[0].totalPendientes +
                " pendiente(s)";
        }else{
            ultimo.innerText = "Aún no se ha generado respaldo";
        }
    }

    if(total){
        total.innerText =
            historialPermanentePendientes.length +
            " movimiento(s) registrados";
    }
}


function actualizarContadorNotificaciones(){
    const contador = document.getElementById("contadorNotificaciones");
    const lista = document.getElementById("listaNotificaciones");

    if(!contador || !lista){
        return;
    }

    contador.innerText = lista.children.length;
}

function refrescarSistema(){
    mostrarPendientes();
    renderizarBitacoraMini();
    renderizarPanelRespaldo();
    actualizarContadorNotificaciones();
}

function mostrarAvisoSincronizacion(texto){
    const aviso = document.getElementById("avisoSincronizacion");

    if(!aviso){
        return;
    }

    aviso.innerHTML = texto || "🔄 Información actualizada desde otra pestaña";
    aviso.style.display = "block";

    clearTimeout(window.timeoutAvisoSincronizacion);

    window.timeoutAvisoSincronizacion = setTimeout(() => {
        aviso.style.display = "none";
    }, 2800);
}

function descargarJSON(nombreArchivo, datos){

    const blob = new Blob(
        [JSON.stringify(datos, null, 2)],
        {type:"application/json"}
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();

    URL.revokeObjectURL(url);
}

function exportarRespaldoJSON(){

    const respaldo = {
        proyecto:"Gestión Integral de Pendientes",
        tipo:"Respaldo completo local",
        fechaExportacion:obtenerFechaCompletaMX(),
        pendientes:pendientes,
        bitacoraMini:bitacoraMini,
        historialPermanentePendientes:historialPermanentePendientes,
        respaldosAutomaticosPendientes:respaldosAutomaticosPendientes
    };

    descargarJSON(
        "respaldo_pendientes_" + new Date().toISOString().slice(0,10) + ".json",
        respaldo
    );

    agregarBitacoraMini("💾 Se exportó un respaldo JSON");
    mostrarNotificacion("💾 Respaldo exportado correctamente");
}

function exportarHistorialJSON(){

    const historial = {
        proyecto:"Gestión Integral de Pendientes",
        tipo:"Historial permanente de actividades",
        fechaExportacion:obtenerFechaCompletaMX(),
        historial:historialPermanentePendientes
    };

    descargarJSON(
        "historial_pendientes_" + new Date().toISOString().slice(0,10) + ".json",
        historial
    );

    mostrarNotificacion("📓 Historial exportado correctamente");
}

function restaurarRespaldoDesdeArchivo(archivo){

    if(!archivo){
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){
        try{
            const datos = JSON.parse(e.target.result);

            if(!Array.isArray(datos.pendientes)){
                alert("El archivo no contiene un respaldo válido de pendientes.");
                return;
            }

            if(!confirm("¿Restaurar este respaldo? Se reemplazarán los pendientes actuales.")){
                return;
            }

            pendientes = datos.pendientes || [];
            bitacoraMini = datos.bitacoraMini || bitacoraMini || [];
            historialPermanentePendientes =
                datos.historialPermanentePendientes ||
                datos.historial ||
                historialPermanentePendientes || [];

            localStorage.setItem("pendientes", JSON.stringify(pendientes));
            localStorage.setItem("bitacoraMini", JSON.stringify(bitacoraMini));
            localStorage.setItem("historialPermanentePendientes", JSON.stringify(historialPermanentePendientes));

            agregarBitacoraMini("⬆️ Se restauró un respaldo JSON");
            crearRespaldoAutomatico("Respaldo creado después de restaurar archivo");

            refrescarSistema();

            mostrarNotificacion("⬆️ Respaldo restaurado correctamente");
            enviarNotificacionGlobal("respaldo", "Sistema", "restauró un respaldo de pendientes");
        }catch(error){
            alert("No se pudo leer el archivo JSON. Revisa que sea un respaldo válido.");
        }
    };

    lector.readAsText(archivo);
}


function esUrgentePendiente(p){

    if(!p){
        return false;
    }

    const texto =
        String(p.pendiente || "").toLowerCase();

    const prioridad =
        String(p.prioridad || "").toLowerCase();

    const estado =
        String(p.estado || "").toLowerCase();

    return (
        p.finalizado !== true &&
        estado !== "finalizado" &&
        (
            estado === "urgente" ||
            prioridad === "alta" ||
            prioridad.includes("urgente") ||
            texto.includes("urgente")
        )
    );

}

function detectarPrioridad(texto){
    let t = texto.toLowerCase();

    if(
        t.includes("urgente") ||
        t.includes("importante") ||
        t.includes("prioridad alta")
    ){
        return "alta";
    }

    if(
        t.includes("revisión") ||
        t.includes("revision") ||
        t.includes("pendiente") ||
        t.includes("prioridad media")
    ){
        return "media";
    }

    return "baja";
}

function etiquetaPrioridad(prioridad){
    if(prioridad === "alta"){
        return `<span class="badge-prioridad prioridad-alta">⚠️ Alta</span>`;
    }

    if(prioridad === "media"){
        return `<span class="badge-prioridad prioridad-media">🟡 Media</span>`;
    }

    return `<span class="badge-prioridad prioridad-baja">🟢 Baja</span>`;
}

function mostrarNotificacion(texto){
    let n = document.getElementById("notificacion");

    n.innerHTML = texto;
    n.style.display = "block";

    setTimeout(() => {
        n.style.display = "none";
    }, 2300);
}

function agregarNotificacionLista(texto){

    let lista = document.getElementById("listaNotificaciones");

    let item = document.createElement("div");

    item.className = "noti-item";

    item.innerHTML = `
        <strong>${texto}</strong>
        <small>${new Date().toLocaleString()}</small>
    `;

    lista.prepend(item);
    actualizarContadorNotificaciones();

    setTimeout(() => {

        item.style.transition = "0.5s";
        item.style.opacity = "0";
        item.style.transform = "translateX(20px)";

        setTimeout(() => {
            item.remove();
            actualizarContadorNotificaciones();
        },500);

    },10000);
}

function agregarBitacoraMini(texto){

    bitacoraMini.unshift({
        texto:texto,
        hora:new Date().toLocaleTimeString(
            "es-MX",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        )
    });

    bitacoraMini = bitacoraMini.slice(0,30);

    localStorage.setItem(
        "bitacoraMini",
        JSON.stringify(bitacoraMini)
    );

    registrarHistorialPermanente(texto);
    crearRespaldoAutomatico("Actividad registrada en bitácora");

    renderizarBitacoraMini();
}

function renderizarBitacoraMini(){

    let lista = document.getElementById("listaBitacoraMini");

    if(!lista){
        return;
    }

    lista.innerHTML = "";

    if(bitacoraMini.length === 0){
        lista.innerHTML = `
            <div class="bitacora-mini-item">
                Sin actividad registrada
                <small>La bitácora aparecerá aquí</small>
            </div>
        `;
        return;
    }

    bitacoraMini.slice(0,3).forEach(item => {
        lista.innerHTML += `
            <div class="bitacora-mini-item">
                ${item.texto}
                <small>${item.hora}</small>
            </div>
        `;
    });
}

function abrirBitacoraCompleta(){

    let modal = document.getElementById("modalBitacora");
    let lista = document.getElementById("listaBitacoraCompleta");

    lista.innerHTML = "";

    if(bitacoraMini.length === 0){
        lista.innerHTML = `
            <div class="bitacora-completa-item">
                Sin registros anteriores
                <small>No hay actividad guardada</small>
            </div>
        `;
    }else{
        bitacoraMini.forEach(item => {
            lista.innerHTML += `
                <div class="bitacora-completa-item">
                    ${item.texto}
                    <small>${item.hora}</small>
                </div>
            `;
        });
    }

    modal.classList.add("activo");
}

function cerrarBitacoraCompleta(){
    document.getElementById("modalBitacora").classList.remove("activo");
}

function sonidoSuave(){
    const audioCtx =
    new (window.AudioContext || window.webkitAudioContext)();

    if(audioCtx.state === "suspended"){
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.setValueAtTime(
        700,
        audioCtx.currentTime
    );

    oscillator.frequency.linearRampToValueAtTime(
        950,
        audioCtx.currentTime + 0.18
    );

    gainNode.gain.setValueAtTime(
        0.45,
        audioCtx.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.6
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.6);
}


function limpiarAcentosAsignacion(texto){
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function detectarDestinatarioJaso(texto){

    const t =
        limpiarAcentosAsignacion(texto).toLowerCase();

    if(/\bpara\s+(lic\.?\s*)?elizabeth\b/.test(t)){
        return "elizabeth";
    }

    if(/\bpara\s+(lic\.?\s*)?(luis\s+)?enrique\b/.test(t)){
        return "enrique";
    }

    return "";
}

function detectarFechaAsignacion(texto){

    const t =
        limpiarAcentosAsignacion(texto).toLowerCase();

    const match =
        t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);

    if(!match){
        return "";
    }

    let dia = match[1].padStart(2,"0");
    let mes = match[2].padStart(2,"0");
    let anio = match[3];

    if(anio.length === 2){
        anio = "20" + anio;
    }

    return `${anio}-${mes}-${dia}`;
}

function detectarHoraAsignacion(texto){

    const t =
        limpiarAcentosAsignacion(texto).toLowerCase();

    const hora24 =
        t.match(/\b(\d{1,2}):(\d{2})\b/);

    if(hora24){
        return hora24[1].padStart(2,"0") + ":" + hora24[2];
    }

    const horaAmPm =
        t.match(/\b(\d{1,2})\s*(am|pm)\b/);

    if(horaAmPm){
        let h = parseInt(horaAmPm[1], 10);
        const tipo = horaAmPm[2];

        if(tipo === "pm" && h < 12){
            h += 12;
        }

        if(tipo === "am" && h === 12){
            h = 0;
        }

        return String(h).padStart(2,"0") + ":00";
    }

    return "";
}

function limpiarTextoAsignacionJaso(texto){

    let limpio =
        String(texto || "");

    limpio = limpio.replace(/\bpara\s+(lic\.?\s*)?elizabeth\b/ig, "");
    limpio = limpio.replace(/\bpara\s+(lic\.?\s*)?(luis\s+)?enrique\b/ig, "");

    limpio = limpio.replace(/\b(el|día|dia)\s+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/ig, "");
    limpio = limpio.replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/ig, "");

    limpio = limpio.replace(/\b(a\s+las|alas)\s+\d{1,2}:\d{2}\b/ig, "");
    limpio = limpio.replace(/\b(a\s+las|alas)\s+\d{1,2}\s*(am|pm)\b/ig, "");
    limpio = limpio.replace(/\b\d{1,2}:\d{2}\b/ig, "");
    limpio = limpio.replace(/\b\d{1,2}\s*(am|pm)\b/ig, "");

    limpio = limpio.replace(/\s+/g, " ").trim();

    return limpio || texto;
}

function analizarAsignacionJaso(texto){

    return {
        usuario: detectarDestinatarioJaso(texto),
        fecha: detectarFechaAsignacion(texto),
        hora: detectarHoraAsignacion(texto),
        pendiente: limpiarTextoAsignacionJaso(texto)
    };

}

function actualizarAyudaAsignacionJaso(){

    const usuario =
        obtenerUsuarioActivoSistema();

    const ayuda =
        document.getElementById("ayudaAsignacionJaso");

    if(!ayuda){
        return;
    }

    if(usuario === "Jaso"){
        ayuda.style.display = "block";
    }else{
        ayuda.style.display = "none";
    }

}

async function agregarPendiente(){
    sincronizarSelectorConUsuarioActivo();

    let creador =
        obtenerUsuarioActivoSistema();

    let textoOriginal =
        document.getElementById("pendiente").value.trim();

    let fechaManual =
        document.getElementById("fecha").value;

    let horaManual =
        document.getElementById("hora").value;

    if(creador === "" || textoOriginal === ""){
        alert("Selecciona un usuario y escribe el pendiente");
        return;
    }

    let usuario = creador;
    let pendiente = textoOriginal;
    let fecha = fechaManual;
    let hora = horaManual;

if(creador === "jasso"){

        const analisis =
            analizarAsignacionJaso(textoOriginal);

        if(analisis.usuario){
            usuario = analisis.usuario;
            pendiente = analisis.pendiente;
            fecha = analisis.fecha || fechaManual;
            hora = analisis.hora || horaManual;
        }

    }

    let prioridad =
        detectarPrioridad(textoOriginal);
    let ultimoFolio =
        Number(localStorage.getItem("ultimoFolioPendiente")) ||0;

        ultimoFolio++;

        localStorage.setItem(
            "ultimoFolioPendiente",
            ultimoFolio
        );

    let nuevo = {
        id: Date.now(),

        folio: ultimoFolio,

        usuario: usuario,

        creador: creador,

        asignadoPor: creador !== usuario ? creador : "",

        pendiente: pendiente,

        fecha: fecha || "Sin fecha",

        hora: hora || "Sin hora",

        prioridad: prioridad,

        estado: prioridad === "alta" ? "urgente" : "pendiente",

        finalizado:false
    };

    await guardarPendienteSupabase(nuevo);

pendientes.push(nuevo);

guardarPendientes();

refrescarSistema();


    if(creador !== usuario){
        mostrarNotificacion("✅ Pendiente asignado a " + usuario);
        enviarNotificacionGlobal(
            "nuevo",
            creador,
            "asignó un pendiente a " + usuario
        );
        agregarNotificacionLista(`✅ ${creador} asignó un pendiente a ${usuario}`);
        agregarBitacoraMini(`✅ ${creador} asignó pendiente a ${usuario}`);
    }else{
        mostrarNotificacion("✅ Pendiente agregado correctamente");
        enviarNotificacionGlobal(
            "nuevo",
            usuario,
            "agregó un nuevo pendiente"
        );
        agregarNotificacionLista(`✅ Nuevo pendiente para ${usuario}`);
        agregarBitacoraMini(`✅ ${usuario} agregó un pendiente`);
    }

    if(prioridad === "alta"){
        agregarNotificacionLista(`⚠️ Pendiente urgente detectado para ${usuario}`);
        agregarBitacoraMini(`⚠️ ${creador} agregó un pendiente urgente para ${usuario}`);
    }

    setTimeout(() => {
        sonidoSuave();
    }, 100);

    document.getElementById("pendiente").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
}

function finalizarPendiente(id){

    sincronizarSelectorConUsuarioActivo();

    const pendienteEncontrado =
        pendientes.find(p => p.id === id);

    if(!puedeModificarPendiente(pendienteEncontrado)){
        return;
    }

    pendientes = pendientes.map(p => {
        if(p.id === id){
            p.finalizado = true;
            p.estado = "finalizado";
            agregarBitacoraMini(`✅ ${p.usuario} finalizó un pendiente`);
        }

        return p;
    });

    guardarPendientes();
    refrescarSistema();

    mostrarNotificacion("✅ Pendiente finalizado");
    agregarNotificacionLista("✅ Pendiente marcado como completado");
}

function eliminarPendiente(id, boton){

    sincronizarSelectorConUsuarioActivo();

    const pendienteEncontrado =
        pendientes.find(p => p.id === id);

    if(!puedeModificarPendiente(pendienteEncontrado)){
        return;
    }

    if(confirm("¿Eliminar este pendiente?")){
        let fila = boton.closest("tr");

        fila.classList.add("fade-out");

        setTimeout(() => {

            let eliminado = pendientes.find(p => p.id === id);

            pendientes = pendientes.filter(
                p => p.id !== id
            );

            guardarPendientes();
            refrescarSistema();

            mostrarNotificacion("🗑️ Pendiente eliminado");
            agregarNotificacionLista("🗑️ Pendiente eliminado");

            if(eliminado){
                agregarBitacoraMini(`🗑️ ${eliminado.usuario} eliminó un pendiente`);
            }

        }, 500);
    }
}


function limpiarFinalizadosUsuarioActivo(){

    sincronizarSelectorConUsuarioActivo();

    const usuarioActual =
        obtenerUsuarioActivoSistema();

    if(!usuarioActual){
        alert("Primero selecciona o inicia sesión con el usuario activo.");
        return;
    }

    const confirmar =
        confirm("¿Eliminar solo los pendientes finalizados de " + usuarioActual + "?");

    if(!confirmar){
        return;
    }

    let eliminados = 0;

    pendientes = pendientes.filter(p => {

        const esDelUsuario =
            p.usuario === usuarioActual;

        const estaFinalizado =
            p.finalizado === true ||
            p.estado === "finalizado";

        if(esDelUsuario && estaFinalizado){
            eliminados++;
            return false;
        }

        return true;

    });

    guardarPendientes();
    refrescarSistema();

    mostrarNotificacion("🧹 Se limpiaron " + eliminados + " pendiente(s) finalizado(s) de " + usuarioActual);
    agregarNotificacionLista("🧹 Limpieza realizada para " + usuarioActual);
    agregarBitacoraMini("🧹 " + usuarioActual + " limpió solo sus pendientes finalizados");

    enviarNotificacionGlobal(
        "limpieza",
        usuarioActual,
        "limpió solo sus pendientes finalizados"
    );

}

/* Compatibilidad con botones anteriores */
function limpiarFinalizados(){
    limpiarFinalizadosUsuarioActivo();
}


function cambiarTab(tab, boton){
    tabActual = tab;

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("activo");
    });

    boton.classList.add("activo");

    mostrarPendientes();
}

function mostrarPendientes(){
    let tabla = document.getElementById("tablaPendientes");

    tabla.innerHTML = "";

    sincronizarSelectorConUsuarioActivo();

    let usuarioSeleccionado =
    obtenerUsuarioActivoSistema();

    if(usuarioSeleccionado === ""){
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Selecciona un usuario para ver sus pendientes
                </td>
            </tr>
        `;
        actualizarPaneles();
        return;
    }

    let filtrados =
    pendientes.filter(p => p.usuario === usuarioSeleccionado);

    if(tabActual === "activos"){
        filtrados = filtrados.filter(p => !p.finalizado);
    }

    if(tabActual === "urgentes"){
        filtrados = filtrados.filter(
            p => esUrgentePendiente(p)
        );
    }

    if(tabActual === "finalizados"){
        filtrados = filtrados.filter(p => p.finalizado);
    }

    filtrados.forEach(p => {
        let datos = datosUsuarios[p.usuario];

        tabla.innerHTML += `
            <tr class="${datos ? datos.fila : ""} ${esUrgentePendiente(p) ? "fila-urgente-pendiente" : ""} ${p.finalizado ? "fila-finalizada" : ""}">
                <td>${p.usuario}</td>
                <td>${p.pendiente} ${p.asignadoPor ? `<br><span class="badge-asignado">Asignado por: Lic. ${p.asignadoPor}</span>` : ""}</td>
                <td>${p.fecha || "Sin fecha"}</td>
                <td>${p.hora || "Sin hora"}</td>
                <td>${etiquetaPrioridad(p.prioridad || detectarPrioridad(p.pendiente))}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button type="button"
                            class="btn btn-success btn-sm"
                            onclick="finalizarPendiente(${p.id})"
                            ${p.finalizado || p.usuario !== obtenerUsuarioActivoSistema() ? "disabled" : ""}>
                            ${p.finalizado ? "Finalizado" : "Finalizar"}
                        </button>

                        <button type="button"
                            class="btn btn-danger btn-sm"
                            onclick="eliminarPendiente(${p.id}, this)"
                            ${p.usuario !== obtenerUsuarioActivoSistema() ? "disabled" : ""}>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if(filtrados.length === 0){
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No hay pendientes en esta categoría
                </td>
            </tr>
        `;
    }

    actualizarPaneles();
}

function actualizarPaneles(){
    sincronizarSelectorConUsuarioActivo();

    let usuario = obtenerUsuarioActivoSistema();

    let base = usuario
    ? pendientes.filter(p => p.usuario === usuario)
    : pendientes;

    let totalActivos =
        base.filter(p => !p.finalizado && p.estado !== "finalizado").length;

    let urgentes =
        base.filter(p => esUrgentePendiente(p)).length;

    let completados =
        base.filter(p => p.finalizado === true || p.estado === "finalizado").length;

    let totalGeneral =
        base.length;

    let porcentaje =
        totalGeneral > 0
        ? Math.round((completados / totalGeneral) * 100)
        : 0;

    document.getElementById("statTotal").innerText = totalActivos;
    document.getElementById("statUrgentes").innerText = urgentes;
    document.getElementById("statCompletados").innerText = completados;

    const barra =
        document.getElementById("barraCompletadosPendientes");

    const textoBarra =
        document.getElementById("textoBarraCompletados");

    if(barra){
        barra.style.width = porcentaje + "%";
    }

    if(textoBarra){
        textoBarra.innerText = porcentaje + "% completado";
    }

    actualizarVencimientos(base);
    actualizarIA(base, urgentes, totalActivos);
}

function actualizarVencimientos(lista){
    let contenedor = document.getElementById("listaVencimientos");

    contenedor.innerHTML = "";

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    let conFecha = lista.filter(p =>
        p.fecha &&
        p.fecha !== "Sin fecha" &&
        !p.finalizado
    );

    conFecha.sort((a,b) => {
        return new Date(a.fecha) - new Date(b.fecha);
    });

    conFecha.slice(0,5).forEach(p => {
        const fechaPendiente = new Date(p.fecha + "T00:00:00");
        let tipo = "proximo";
        let etiqueta = "🟢 Próximo";

        if(fechaPendiente.getTime() === hoy.getTime()){
            tipo = "hoy";
            etiqueta = "🔴 Hoy";
        }else if(fechaPendiente.getTime() === manana.getTime()){
            tipo = "manana";
            etiqueta = "🟡 Mañana";
        }

        contenedor.innerHTML += `
            <div class="vencimiento-item ${tipo}">
                <span class="etiqueta-vencimiento">${etiqueta}</span>
                <strong>${p.pendiente}</strong>
                <small>${p.usuario} · ${p.fecha} ${p.hora || ""}</small>
            </div>
        `;
    });

    if(conFecha.length === 0){
        contenedor.innerHTML = `
            <div class="vencimiento-item">
                <strong>Sin vencimientos próximos</strong>
                <small>No hay pendientes con fecha activa</small>
            </div>
        `;
    }
}

function actualizarIA(lista, urgentes, total){
    let respuesta = document.getElementById("respuestaIA");

    let activos = lista.filter(p => !p.finalizado);

    if(activos.length === 0){
        respuesta.innerHTML =
        "✅ Todo está al día. No hay pendientes activos.";
        return;
    }

    if(urgentes > 0){
        respuesta.innerHTML =
        `⚠️ Hay <strong>${urgentes}</strong> pendiente(s) urgente(s). Conviene atenderlos primero.`;
        return;
    }

    if(total >= 5){
        respuesta.innerHTML =
        `📌 Hay <strong>${total}</strong> pendientes activos. Conviene organizar por fecha.`;
        return;
    }

    respuesta.innerHTML =
    "📋 La carga de pendientes está controlada.";
}

function crearTareaIA(){

    rellenarCamposDesdeIA();

    let pregunta = datosIA.pendiente;

if(!pregunta){

    pregunta =
    document.getElementById("preguntaIA").value.trim();

}

    if(pregunta === ""){
        alert("Escribe una instrucción para la IA");
        return;
    }

    sincronizarSelectorConUsuarioActivo();

    let creador =
        obtenerUsuarioActivoSistema();

    if(creador === ""){
        alert("Selecciona un usuario primero");
        return;
    }

    let usuario = creador;
    let textoPendiente = pregunta;
    let fechaIA = document.getElementById("fechaIA").value;
    let horaIA = document.getElementById("horaIA").value;

if(creador === "jasso"){
            const analisis =
            analizarAsignacionJaso(pregunta);

        if(analisis.usuario){
            usuario = analisis.usuario;
            textoPendiente = analisis.pendiente;
            fechaIA = analisis.fecha || fechaIA;
            horaIA = analisis.hora || horaIA;
        }
    }

    let prioridad =
        detectarPrioridad(pregunta);

let ultimoFolio =
     Number(localStorage.getItem("ultimoFolioPendiente")) || 0;

     ultimoFolio++;

     localStorage.setItem(
        "ultimoFolioPendiente",
        ultimoFolio
     );

    let nuevo = {
        id: Date.now(),
        folio: ultimoFolio,
        usuario: usuario,
        creador: creador,
        asignadoPor: creador !== usuario ? creador : "",
        pendiente: textoPendiente,
        fecha: fechaIA || new Date().toISOString().split("T")[0],
        hora: horaIA || new Date().toLocaleTimeString(
            "es-MX",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        ),
        prioridad: prioridad,
        estado: prioridad === "alta" ? "urgente" : "pendiente",
        finalizado:false
    };

    console.log(nuevo);

    
    pendientes.push(nuevo);

    guardarPendientes();
    refrescarSistema();

    document.getElementById("preguntaIA").value = "";
    document.getElementById("fechaIA").value = "";
    document.getElementById("horaIA").value = "";

    if(creador !== usuario){
        mostrarNotificacion("🤖 Pendiente asignado automáticamente a " + usuario);
        agregarNotificacionLista(`🤖 ${creador} asignó con IA un pendiente para ${usuario}`);
        agregarBitacoraMini(`🤖 ${creador} asignó con IA pendiente a ${usuario}`);
    }else{
        mostrarNotificacion("🤖 Pendiente creado automáticamente");
        agregarNotificacionLista(`🤖 La IA agregó un pendiente para ${usuario}`);
        agregarBitacoraMini(`🤖 IA creó pendiente para ${usuario}`);
    }

    if(prioridad === "alta"){
        agregarNotificacionLista(`⚠️ La IA detectó prioridad alta`);
        agregarBitacoraMini(`⚠️ IA detectó prioridad alta`);
    }

    sonidoSuave();
}

document.getElementById("usuario")
.addEventListener("change", () => {
    const usuarioElegido = document.getElementById("usuario").value;

    if(usuarioElegido){
        sessionStorage.setItem("usuarioSesionActual", usuarioElegido);
        localStorage.setItem("usuarioRecordadoSistema", usuarioElegido);
    }

    aplicarTemaUsuario();
    actualizarAyudaAsignacionJaso();
    mostrarPendientes();
});

aplicarTemaUsuario();
actualizarAyudaAsignacionJaso();
mostrarPendientes();
actualizarPaneles();
renderizarBitacoraMini();
actualizarContadorNotificaciones();

/* ========================= */
/* ACTUALIZACIÓN EN VIVO */
/* ========================= */

window.addEventListener("storage", function(event){

    // ACTUALIZAR BITÁCORA
    if(event.key === "bitacoraMini"){

        bitacoraMini =
        JSON.parse(
            localStorage.getItem("bitacoraMini")
        ) || [];

        renderizarBitacoraMini();
        renderizarPanelRespaldo();
        mostrarAvisoSincronizacion("📓 Bitácora actualizada desde otra pestaña");

    }

    // ACTUALIZAR PENDIENTES
    if(event.key === "pendientes"){

        pendientes =
        JSON.parse(
            localStorage.getItem("pendientes")
        ) || [];

        refrescarSistema();
        mostrarAvisoSincronizacion("🔄 Pendientes actualizados desde otra pestaña");

    }

    if(event.key === "historialPermanentePendientes"){
        historialPermanentePendientes =
        JSON.parse(localStorage.getItem("historialPermanentePendientes")) || [];
        renderizarPanelRespaldo();
    }

    if(event.key === "respaldosAutomaticosPendientes"){
        respaldosAutomaticosPendientes =
        JSON.parse(localStorage.getItem("respaldosAutomaticosPendientes")) || [];
        renderizarPanelRespaldo();
    }

});



/* ========================= */
/* NOTIFICACIONES GLOBALES ENTRE PESTAÑAS */
/* ========================= */

function activarSonidosGlobales(){
    window.sonidosGlobalesActivos = true;
}

document.addEventListener("click", activarSonidosGlobales, { once:true });
document.addEventListener("keydown", activarSonidosGlobales, { once:true });

function sonidoNotificacionGlobal(){

    if(!window.sonidosGlobalesActivos){
        return;
    }

    try{
        const audioCtx =
            new (window.AudioContext || window.webkitAudioContext)();

        const osc =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();

        osc.type = "sine";

        osc.frequency.setValueAtTime(
            720,
            audioCtx.currentTime
        );

        osc.frequency.linearRampToValueAtTime(
            950,
            audioCtx.currentTime + 0.18
        );

        gain.gain.setValueAtTime(
            0.08,
            audioCtx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + 0.35
        );

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);

    }catch(e){}
}

function enviarNotificacionGlobal(tipo, usuario, mensaje){

    localStorage.setItem("notificacionGlobalSistema", JSON.stringify({
        tipo:tipo,
        usuario:usuario || "Sistema",
        mensaje:mensaje || "Nueva actividad registrada",
        fecha:Date.now()
    }));

}

function mostrarNotificacionGlobalSistema(texto){

    if(typeof mostrarNotificacion === "function"){
        mostrarNotificacion(texto);
        return;
    }

    let contenedor =
        document.getElementById("notificaciones");

    if(!contenedor){
        contenedor = document.createElement("div");
        contenedor.id = "notificaciones";
        contenedor.style.position = "fixed";
        contenedor.style.top = "90px";
        contenedor.style.right = "25px";
        contenedor.style.zIndex = "999999";
        document.body.appendChild(contenedor);
    }

    const aviso =
        document.createElement("div");

    aviso.innerHTML = texto;

    aviso.style.background = "rgba(15,15,25,0.94)";
    aviso.style.color = "white";
    aviso.style.padding = "15px 20px";
    aviso.style.borderRadius = "15px";
    aviso.style.marginBottom = "12px";
    aviso.style.boxShadow = "0 0 25px rgba(0,170,255,0.45)";
    aviso.style.border = "1px solid rgba(255,255,255,0.18)";
    aviso.style.fontWeight = "bold";
    aviso.style.minWidth = "260px";

    contenedor.appendChild(aviso);

    setTimeout(() => {
        aviso.remove();
    }, 3800);

}

window.addEventListener("storage", function(event){

    if(event.key === "notificacionGlobalSistema"){

        if(!event.newValue){
            return;
        }

        const data =
            JSON.parse(event.newValue);

        sonidoNotificacionGlobal();

        mostrarNotificacionGlobalSistema(
            `🔔 ${data.usuario}: ${data.mensaje}`
        );

    }

});



/* ========================= */
/* MINI ASISTENTE INTELIGENTE */
/* ========================= */

function normalizarHoraIA(horaTexto){

    if(!horaTexto){
        return "";
    }

    let texto =
        horaTexto.toLowerCase().replace(/\s+/g,"").trim();

    let match =
        texto.match(/(\d{1,2})(?::(\d{2}))?(am|pm)?/);

    if(!match){
        return "";
    }

    let horas =
        parseInt(match[1],10);

    let minutos =
        match[2] ? parseInt(match[2],10) : 0;

    let periodo =
        match[3] || "";

    if(periodo === "pm" && horas < 12){
        horas += 12;
    }

    if(periodo === "am" && horas === 12){
        horas = 0;
    }

    if(horas > 23){
        horas = 23;
    }

    if(minutos > 59){
        minutos = 59;
    }

    return String(horas).padStart(2,"0") + ":" + String(minutos).padStart(2,"0");
}

function normalizarFechaIA(fechaTexto){

    if(!fechaTexto){
        return "";
    }

    let partes =
        fechaTexto.split(/[\/\-]/);

    if(partes.length < 3){
        return "";
    }

    let dia =
        partes[0].padStart(2,"0");

    let mes =
        partes[1].padStart(2,"0");

    let anio =
        partes[2];

    if(anio.length === 2){
        anio = "20" + anio;
    }

    return anio + "-" + mes + "-" + dia;
}

function extraerDatosMiniIA(texto){

    let limpio =
        String(texto || "").trim();

    let fecha = "";
    let hora = "";

    let fechaMatch =
        limpio.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    if(fechaMatch){
        fecha = normalizarFechaIA(fechaMatch[1]);
        limpio = limpio.replace(fechaMatch[0], "");
    }

    let horaMatch =
        limpio.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);

    if(horaMatch){
        hora = normalizarHoraIA(horaMatch[1]);
        limpio = limpio.replace(horaMatch[0], "");
    }

    limpio = limpio
        .replace(/tenemos pendiente/gi, "")
        .replace(/tengo pendiente/gi, "")
        .replace(/pendiente/gi, "")
        .replace(/\bel\b/gi, "")
        .replace(/\bd[ií]a\b/gi, "")
        .replace(/\ba las\b/gi, "")
        .replace(/\ba la\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

    return {
        pendiente:limpio,
        fecha:fecha,
        hora:hora
    };

}

function rellenarCamposDesdeIA(){

    const textoIA =
        document.getElementById("preguntaIA");

    const pendienteInput =
        document.getElementById("pendiente");

    const fechaInput =
        document.getElementById("fecha");

    const horaInput =
        document.getElementById("hora");

    const respuestaIA =
        document.getElementById("respuestaIA");

    if(!textoIA || !pendienteInput){
        return;
    }

    const datos =
        extraerDatosMiniIA(textoIA.value);

    if(datos.pendiente){
        pendienteInput.value = datos.pendiente;
    }

    if(datos.fecha && fechaInput){
        fechaInput.value = datos.fecha;
    }

    if(datos.hora && horaInput){
        horaInput.value = datos.hora;
    }

    if(respuestaIA){
        respuestaIA.innerHTML = `
            ✅ Campos rellenados correctamente.<br>
            📝 Pendiente: <strong>${datos.pendiente || "No detectado"}</strong><br>
            📅 Fecha: <strong>${datos.fecha || "Sin fecha"}</strong><br>
            ⏰ Hora: <strong>${datos.hora || "Sin hora"}</strong>
        `;
    }

    pendienteInput.focus();

}

function configurarEnterCamposPendientes(){

    const preguntaIA =
        document.getElementById("preguntaIA");

    const pendiente =
        document.getElementById("pendiente");

    const fecha =
        document.getElementById("fecha");

    const hora =
        document.getElementById("hora");

    if(preguntaIA){

        preguntaIA.addEventListener("keydown", function(e){

            if(e.key === "Enter" && !e.shiftKey){
                e.preventDefault();
                rellenarCamposDesdeIA();

                if(pendiente){
                    pendiente.focus();
                }
            }

        });

    }

    if(pendiente){

        pendiente.addEventListener("keydown", function(e){

            if(e.key === "Enter"){
                e.preventDefault();

                if(fecha){
                    fecha.focus();
                }
            }

        });

    }

    if(fecha){

        fecha.addEventListener("keydown", function(e){

            if(e.key === "Enter"){
                e.preventDefault();

                if(hora){
                    hora.focus();
                }
            }

        });

    }

    if(hora){

        hora.addEventListener("keydown", function(e){

            if(e.key === "Enter"){
                e.preventDefault();

                if(typeof agregarPendiente === "function"){
                    agregarPendiente();
                }
            }

        });

    }

}

document.addEventListener("DOMContentLoaded", configurarEnterCamposPendientes);

document.addEventListener("DOMContentLoaded", function(){
    const inputRestaurar = document.getElementById("inputRestaurarRespaldo");

    if(inputRestaurar){
        inputRestaurar.addEventListener("change", function(){
            restaurarRespaldoDesdeArchivo(this.files[0]);
            this.value = "";
        });
    }

    renderizarPanelRespaldo();
});

renderizarPanelRespaldo();
actualizarContadorNotificaciones();

document.addEventListener("DOMContentLoaded", function(){
    const paramsPendientes = new URLSearchParams(window.location.search);
    const usuarioURLPendientes = paramsPendientes.get("usuario");

    if(usuarioURLPendientes){
        const selector = document.getElementById("usuario");

        if(selector){
            selector.value = usuarioURLPendientes;
        }

        sessionStorage.setItem("usuarioSesionActual", usuarioURLPendientes);
        localStorage.setItem("usuarioRecordadoSistema", usuarioURLPendientes);
    }

    if(typeof aplicarTemaUsuario === "function"){
        aplicarTemaUsuario();
    }

    if(typeof actualizarAyudaAsignacionJaso === "function"){
        actualizarAyudaAsignacionJaso();
    }

    if(typeof mostrarPendientes === "function"){
        mostrarPendientes();
    }

    const btnMicrofono = document.getElementById("btnMicrofono");
const btnDetener = document.getElementById("btnDetener");
const indicadorIA = document.querySelector(".ia-indicador");
const estadoIA = document.getElementById("estadoIA");
const preguntaIA = document.getElementById("preguntaIA");

let reconocimiento;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    reconocimiento = new SpeechRecognition();

    reconocimiento.lang = "es-MX";
    reconocimiento.continuous = true;
    reconocimiento.interimResults = true;

    reconocimiento.onstart = () => {

        btnMicrofono.classList.add("escuchando");
        indicadorIA.classList.add("escuchando");
        estadoIA.innerHTML = "🎤 Escuchando...";

    };

    reconocimiento.onend = () => {

        btnMicrofono.classList.remove("escuchando");
        indicadorIA.classList.remove("escuchando");
        estadoIA.innerHTML = "Esperando instrucciones...";

    };

    reconocimiento.onresult = (event) => {

    let texto = "";

    for(let i = event.resultIndex; i < event.results.length; i++){

        texto += event.results[i][0].transcript;

    }

    preguntaIA.value = texto;

let datosIA = {
    usuario: "",
    fecha: "",
    hora: "",
    prioridad: "Normal",
    pendiente: ""
};

    analizarMiniIA(texto);

};

    btnMicrofono.addEventListener("click", () => {

        reconocimiento.start();

    });

    btnDetener.addEventListener("click", () => {

        reconocimiento.stop();

    });

}else{

    estadoIA.innerHTML = "❌ Este navegador no soporta reconocimiento de voz.";

}

});

function analizarMiniIA(texto){

    texto = texto.toLowerCase();

    let usuario = "Sin detectar";
    let fecha = "Sin detectar";
    let hora = "Sin detectar";
    let prioridad = "Normal";
    let pendiente = texto;

    // ===== Usuario =====

    if(texto.includes("elizabeth")){

        usuario = "Elizabeth";

    }else if(texto.includes("enrique")){

        usuario = "Enrique";

    }else if(
        texto.includes("jaso") ||
        texto.includes("jasso")
    ){

        usuario = "Jaso";

    }

    // ===== Prioridad =====

    if(
        texto.includes("urgente") ||
        texto.includes("crítico") ||
        texto.includes("importante")
    ){

        prioridad = "Alta";

    }

    // ===== Fecha =====

    if(texto.includes("hoy")){

        fecha = "Hoy";

    }else if(texto.includes("mañana")){

        fecha = "Mañana";

    }else if(texto.includes("pasado mañana")){

        fecha = "Pasado mañana";

    }

    // ===== Hora =====

    const horaDetectada = texto.match(/\d{1,2}(:\d{2})?/);

    if(horaDetectada){

        hora = horaDetectada[0];

    }

    // ===== Limpiar texto =====

    pendiente = pendiente
        .replace(/para/gi,"")
        .replace(/elizabeth/gi,"")
        .replace(/enrique/gi,"")
        .replace(/jaso/gi,"")
        .replace(/jasso/gi,"")
        .replace(/urgente/gi,"")
        .replace(/importante/gi,"")
        .replace(/crítico/gi,"")
        .replace(/hoy/gi,"")
        .replace(/mañana/gi,"")
        .replace(/pasado mañana/gi,"")
        .replace(/\s+/g," ")
        .trim();

    document.getElementById("iaUsuario").textContent = usuario;
    document.getElementById("iaFecha").textContent = fecha;
    document.getElementById("iaHora").textContent = hora;
    document.getElementById("iaPrioridad").textContent = prioridad;
    document.getElementById("iaPendiente").textContent = pendiente;

datosIA = {
    usuario,
    fecha,
    hora,
    prioridad,
    pendiente
};

}

