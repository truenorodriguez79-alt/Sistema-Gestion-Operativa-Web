"use strict";

/* ==========================================================
   AUTH.JS
   SISTEMA DE GESTIÓN OPERATIVA
========================================================== */

console.log("✅ auth.js cargado");

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let usuarioSesion = null;

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarSistema);

/* ==========================================================
   INICIAR SISTEMA
========================================================== */

function iniciarSistema() {

    console.log("🚀 Inicializando autenticación...");

    prepararLogin();

    verificarSesion();

}

/* ==========================================================
   PREPARAR LOGIN
========================================================== */

function prepararLogin() {

    console.log("🔐 Preparando login...");

    const formulario =
        document.getElementById("loginForm");

    if (formulario) {

        formulario.addEventListener(
            "submit",
            iniciarSesion
        );

    }

    const botonPassword =
        document.getElementById("togglePassword");

    if (botonPassword) {

        botonPassword.addEventListener(
            "click",
            mostrarPassword
        );

    }

    const botonCerrarSesion =
        document.getElementById("btnCerrarSesion");

    if (botonCerrarSesion) {

        botonCerrarSesion.addEventListener(
            "click",
            cerrarSesion
        );

    }

    console.log("✅ Eventos del login preparados.");

}

/* ==========================================================
   MOSTRAR / OCULTAR CONTRASEÑA
========================================================== */

function mostrarPassword() {

    const inputPassword =
        document.getElementById("password");

    if (!inputPassword) return;

    inputPassword.type =

        inputPassword.type === "password"

            ? "text"

            : "password";

}

/* ==========================================================
   INICIAR SESIÓN
========================================================== */

async function iniciarSesion(evento) {

    evento.preventDefault();

    const inputUsuario =
        document.getElementById("usuario");

    const inputPassword =
        document.getElementById("password");

    const mensaje =
        document.getElementById("mensajeLogin");

    if (!inputUsuario || !inputPassword) return;

    const usuario =
        inputUsuario.value.trim().toLowerCase();

    const password =
        inputPassword.value.trim();

    if (mensaje) {
        mensaje.textContent = "";
    }

    if (!usuario || !password) {

        if (mensaje) {

            mensaje.textContent =
                "Ingresa usuario y contraseña.";

        }

        return;

    }

    try {

        const {

            data,

            error

        } = await supabaseClient

            .from("usuarios")

            .select("*")

            .eq("usuario", usuario)

            .maybeSingle();

        if (error) throw error;

        if (!data) {

            if (mensaje) {

                mensaje.textContent =
                    "Usuario no encontrado.";

            }

            return;

        }

        if (!data.habilitado) {

            if (mensaje) {

                mensaje.textContent =
                    "Usuario deshabilitado.";

            }

            return;

        }

        if (data.contrasena !== password) {

            if (mensaje) {

                mensaje.textContent =
                    "Contraseña incorrecta.";

            }

            return;

        }

        const fechaActual =
            new Date().toISOString();

        const { error: errorActualizar } =
            await supabaseClient

                .from("usuarios")

                .update({

                    estado: true,

                    ultimo_acceso: fechaActual

                })

                .eq("id", data.id);

        if (errorActualizar) {

            console.error(errorActualizar);

        }

        usuarioSesion = {

            id: data.id,

            nombre: data.nombre,

            nombre_corto: data.nombre_corto,

            usuario: data.usuario.toLowerCase(),

            rol_id: data.rol_id,

            foto: data.foto,

            estado: true,

            ultimo_acceso: fechaActual

        };

        localStorage.setItem(

            "usuarioSesion",

            JSON.stringify(usuarioSesion)

        );

        sessionStorage.setItem(

            "usuarioSesionActual",

            usuarioSesion.usuario

        );

        sessionStorage.setItem(

            "usuarioId",

            usuarioSesion.id

        );

        sessionStorage.setItem(

            "rolUsuario",

            usuarioSesion.rol_id

        );

        console.log("✅ Sesión iniciada.");

console.log("usuarioSesion:", usuarioSesion);

await actualizarEstadoUsuario(true);

console.log("Conexión enviada a Supabase");

        mostrarDashboard(usuarioSesion);

    }

    catch (error) {

        console.error(error);

        if (mensaje) {

            mensaje.textContent =
                "Error al conectar con Supabase.";

        }

    }

}

/* ==========================================================
   MOSTRAR DASHBOARD
========================================================== */

function mostrarDashboard(usuario) {

    console.log("👤 Usuario activo:", usuario);

    const login =
        document.getElementById("loginContainer");

    const dashboard =
        document.getElementById("dashboardContainer");

    if (login) {

        login.classList.add("d-none");

    }

    if (dashboard) {

        dashboard.classList.remove("d-none");

    }

    const nombre =
        document.getElementById("nombreUsuario");

    if (nombre) {

        nombre.textContent =
            usuario.nombre_corto || usuario.nombre;

    }

    const foto =
        document.getElementById("fotoUsuario");

    if (foto) {

      let fotoUsuario = "assets/img/usuarios/default.png";

switch ((usuario.usuario || "").toLowerCase()) {

    case "elizabeth":
        fotoUsuario = "assets/img/fondo/elizabeth.png";
        break;

    case "jasso":
        fotoUsuario = "assets/img/fondo/apartado Jasso.jpg";
        break;

    case "enrique":
        fotoUsuario = "assets/img/fondo/apartado Enrique.jpg";
        break;

}

foto.src = fotoUsuario;

        foto.alt =
            usuario.nombre;

    }

    const rol =
        document.getElementById("rolUsuario");

    if (rol) {

        rol.textContent =
            obtenerNombreRol(usuario.rol_id);

    }

    const estado =
        document.getElementById("estadoUsuario");

    if (estado) {

        estado.textContent =
            "Sesión activa";

    }

    aplicarPermisos(usuario.rol_id);

    console.log("✅ Dashboard cargado.");

}

/* ==========================================================
   VERIFICAR SESIÓN
========================================================== */

function verificarSesion() {

    const login =
        document.getElementById("loginContainer");

    const dashboard =
        document.getElementById("dashboardContainer");

    const sesionGuardada =
        localStorage.getItem("usuarioSesion");

    // NO EXISTE SESIÓN

    if (!sesionGuardada) {

        console.log("ℹ️ No existe una sesión activa.");

        if (login)
            login.classList.remove("d-none");

        if (dashboard)
            dashboard.classList.add("d-none");

        return;

    }

    try {

        usuarioSesion =
            JSON.parse(sesionGuardada);

        sessionStorage.setItem(
            "usuarioSesionActual",
            usuarioSesion.usuario
        );

        sessionStorage.setItem(
            "usuarioId",
            usuarioSesion.id
        );

        sessionStorage.setItem(
            "rolUsuario",
            usuarioSesion.rol_id
        );


        
        mostrarDashboard(usuarioSesion);

    }

    catch (error) {

        console.error(error);

        localStorage.removeItem("usuarioSesion");

        if (login)
            login.classList.remove("d-none");

        if (dashboard)
            dashboard.classList.add("d-none");

    }

}

/* ==========================================================
   CERRAR SESIÓN
========================================================== */

async function cerrarSesion() {

    try {

        if (usuarioSesion) {

            await actualizarEstadoUsuario(false);

        }

    } catch (error) {

        console.error(error);

    }

    localStorage.removeItem("usuarioSesion");

    sessionStorage.removeItem("usuarioSesionActual");

    sessionStorage.removeItem("usuarioId");

    sessionStorage.removeItem("rolUsuario");

    usuarioSesion = null;

    location.reload();

}

/* ==========================================================
   ACTUALIZAR ESTADO DE CONEXIÓN
========================================================== */

async function actualizarEstadoUsuario(conectado) {

    if (!usuarioSesion) return;

    try {

        const { error } = await supabaseClient

            .from("usuarios")

            .update({

                conectado: conectado,

                ultimo_acceso: new Date().toISOString()

            })

            .eq("id", usuarioSesion.id);

        if (error) throw error;

        usuarioSesion.conectado = conectado;

        localStorage.setItem(

            "usuarioSesion",

            JSON.stringify(usuarioSesion)

        );

        console.log(

            conectado
                ? "🟢 Usuario conectado."
                : "⚫ Usuario desconectado."

        );

    }

    catch (error) {

        console.error(

            "Error actualizando conexión:",

            error

        );

    }

}

/* ==========================================================
   ROLES Y PERMISOS
========================================================== */

function obtenerNombreRol(rol) {

    switch (rol) {

        case 1:
            return "Administrador";

        case 2:
            return "Jefe de Área";

        case 3:
            return "Operador";

        case 4:
            return "Invitado";

        default:
            return "Usuario";

    }

}

function aplicarPermisos(rol) {

    const menu = {

        usuarios: document.getElementById("menuUsuarios"),

        reportes: document.getElementById("menuReportes"),

        pendientes: document.getElementById("menuPendientes"),

        evidencias: document.getElementById("menuEvidencias")

    };

    // Ocultar todo primero

    Object.values(menu).forEach(item => {

        if (item) {

            item.style.display = "none";

        }

    });

    switch (rol) {

        // Administrador

        case 1:

            Object.values(menu).forEach(item => {

                if (item) {

                    item.style.display = "flex";

                }

            });

            break;

        // Jefe de Área

        case 2:

            if (menu.reportes)
                menu.reportes.style.display = "flex";

            if (menu.pendientes)
                menu.pendientes.style.display = "flex";

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

        // Operador

        case 3:

            if (menu.pendientes)
                menu.pendientes.style.display = "flex";

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

        // Invitado

        case 4:

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

    }

}

/* ==========================================================
   ROLES Y PERMISOS
========================================================== */

function obtenerNombreRol(rol) {

    switch (rol) {

        case 1:
            return "Administrador";

        case 2:
            return "Jefe de Área";

        case 3:
            return "Operador";

        case 4:
            return "Invitado";

        default:
            return "Usuario";

    }

}

function aplicarPermisos(rol) {

    const menu = {

        usuarios: document.getElementById("menuUsuarios"),

        reportes: document.getElementById("menuReportes"),

        pendientes: document.getElementById("menuPendientes"),

        evidencias: document.getElementById("menuEvidencias")

    };

    // Ocultar todo primero

    Object.values(menu).forEach(item => {

        if (item) {

            item.style.display = "none";

        }

    });

    switch (rol) {

        // Administrador

        case 1:

            Object.values(menu).forEach(item => {

                if (item) {

                    item.style.display = "flex";

                }

            });

            break;

        // Jefe de Área

        case 2:

            if (menu.reportes)
                menu.reportes.style.display = "flex";

            if (menu.pendientes)
                menu.pendientes.style.display = "flex";

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

        // Operador

        case 3:

            if (menu.pendientes)
                menu.pendientes.style.display = "flex";

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

        // Invitado

        case 4:

            if (menu.evidencias)
                menu.evidencias.style.display = "flex";

            break;

    }

}