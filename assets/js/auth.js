/* ==========================================================
   AUTENTICACIÓN
========================================================== */


document.addEventListener("DOMContentLoaded", () => {

    prepararLogin();

});


// ==========================================================
// PREPARAR LOGIN
// ==========================================================

function prepararLogin() {


    const form = document.getElementById("loginForm");


    if (form) {

        form.addEventListener(
            "submit",
            iniciarSesion
        );

    }


    const boton = document.getElementById("togglePassword");


    if (boton) {

        boton.addEventListener(
            "click",
            mostrarPassword
        );

    }


    const cerrar = document.getElementById("btnCerrarSesion");


    if (cerrar) {

        cerrar.addEventListener(
            "click",
            cerrarSesion
        );

    }


    verificarSesion();

}


// ==========================================================
// MOSTRAR PASSWORD
// ==========================================================

function mostrarPassword() {


    const input =
        document.getElementById("password");


    if (!input) return;


    input.type =
        input.type === "password"
        ? "text"
        : "password";


}


// ==========================================================
// INICIAR SESIÓN
// ==========================================================

async function iniciarSesion(evento) {


    evento.preventDefault();


    const usuario =
        document
        .getElementById("usuario")
        .value
        .trim()
        .toLowerCase();


    const password =
        document
        .getElementById("password")
        .value
        .trim();


    const mensaje =
        document.getElementById("mensajeLogin");


    mensaje.textContent = "";


    try {


        const { data, error } =
            await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("usuario", usuario)
            .maybeSingle();



        if (error || !data) {

            mensaje.textContent =
                "Usuario no encontrado";

            return;

        }



        if (!data.habilitado) {

            mensaje.textContent =
                "Usuario deshabilitado";

            return;

        }



        if (data.contrasena !== password) {

            mensaje.textContent =
                "Contraseña incorrecta";

            return;

        }



        const fechaAcceso =
            new Date().toISOString();



        await supabaseClient
            .from("usuarios")
            .update({

                ultimo_acceso: fechaAcceso

            })
            .eq("id", data.id);



        const sesion = {

            id:data.id,

            nombre:data.nombre,

            nombre_corto:data.nombre_corto,

            usuario:data.usuario,

            rol_id:data.rol_id,

            foto:data.foto,

            ultimo_acceso:fechaAcceso,

            estado:data.estado

        };



        localStorage.setItem(
            "usuarioSesion",
            JSON.stringify(sesion)
        );



        mostrarDashboard(sesion);



    } catch(error) {


        console.error(error);


        mensaje.textContent =
            "Error al conectar con Supabase";


    }


}


// ==========================================================
// MOSTRAR DASHBOARD
// ==========================================================

function mostrarDashboard(usuario) {


    document
    .getElementById("loginContainer")
    .classList
    .add("d-none");


    document
    .getElementById("dashboardContainer")
    .classList
    .remove("d-none");



    const nombre =
        document.getElementById("nombreUsuario");


    if(nombre){

        nombre.textContent =
            usuario.nombre_corto;

    }



    const rol =
        document.getElementById("rolUsuario");


    if(rol){

        rol.textContent =
            obtenerNombreRol(usuario.rol_id);

    }



    const estado =
        document.getElementById("estadoUsuario");


    if(estado){

        estado.textContent =
            "Sesión activa";

    }

    aplicarPermisos(usuario.rol_id);

}


// ==========================================================
// VERIFICAR SESIÓN
// ==========================================================

function verificarSesion() {


    const login =
        document.getElementById("loginContainer");


    const dashboard =
        document.getElementById("dashboardContainer");


    const sesion =
        localStorage.getItem("usuarioSesion");



    if(!sesion){


        login.classList.remove("d-none");


        dashboard.classList.add("d-none");


        return;

    }



    const usuario =
        JSON.parse(sesion);



    mostrarDashboard(usuario);


}


// ==========================================================
// ROLES
// ==========================================================

function obtenerNombreRol(rol){


    switch(rol){


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


// ==========================================================
// CERRAR SESIÓN
// ==========================================================

function cerrarSesion(){


    localStorage.removeItem(
        "usuarioSesion"
    );


    document
    .getElementById("dashboardContainer")
    .classList
    .add("d-none");



    document
    .getElementById("loginContainer")
    .classList
    .remove("d-none");



    document.getElementById("usuario").value = "";

    document.getElementById("password").value = "";


}

// ==========================================================
// PERMISOS DE MENÚ
// ==========================================================

function aplicarPermisos(rol){


    const usuarios =
        document.getElementById("menuUsuarios");


    const reportes =
        document.getElementById("menuReportes");


    const pendientes =
        document.getElementById("menuPendientes");


    const evidencias =
        document.getElementById("menuEvidencias");



    // Administrador

   if(rol === 1){

    if(usuarios)
        usuarios.style.display = "flex";

    if(reportes)
        reportes.style.display = "flex";

    if(pendientes)
        pendientes.style.display = "flex";

    if(evidencias)
        evidencias.style.display = "flex";

}



    // Jefe de Área

    if(rol === 2){

        usuarios.style.display = "none";

        reportes.style.display = "flex";

        pendientes.style.display = "flex";

        evidencias.style.display = "flex";

    }



    // Operador

    if(rol === 3){

        usuarios.style.display = "none";

        reportes.style.display = "none";

        pendientes.style.display = "flex";

        evidencias.style.display = "flex";

    }



    // Invitado

    if(rol === 4){

        usuarios.style.display = "none";

        reportes.style.display = "none";

        pendientes.style.display = "none";

        evidencias.style.display = "flex";

    }


}