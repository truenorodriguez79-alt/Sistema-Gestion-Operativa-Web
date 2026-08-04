/* ==========================================================
   USUARIOS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarUsuariosActivos();

});

async function cargarUsuariosActivos() {

    const contenedor =
        document.getElementById("listaUsuariosActivos");

    if (!contenedor) return;

    contenedor.innerHTML = "Cargando usuarios...";

    const { data, error } =
        await supabaseClient
            .from("usuarios")
            .select("*")
            .order("nombre");

    if (error) {

        console.error(error);

        contenedor.innerHTML =
            "Error al cargar usuarios";

        return;

    }

    contenedor.innerHTML = "";

    data

        .filter(usuario => {

            const nombre =
                (usuario.nombre || "").toLowerCase();

            // Ocultar Administrador
            if (nombre.includes("augusto")) return false;

            // Ocultar Invitado
            if (nombre.includes("invitado")) return false;

            return true;

        })

        .forEach(usuario => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "usuario-activo-card";

let foto = "assets/img/usuarios/default.png";

switch ((usuario.usuario || "").toLowerCase()) {

    case "elizabeth":
        foto = "assets/img/fondo/elizabeth.png";
        break;

    case "jasso":
        foto = "assets/img/fondo/apartado Jasso.jpg";
        break;

    case "enrique":
        foto = "assets/img/fondo/apartado Enrique.jpg";
        break;

}

            tarjeta.innerHTML = `
                <img
src="${foto}"
                    class="usuario-avatar"
                    alt="${usuario.nombre}">

                <div class="usuario-datos">

                    <h4>${usuario.nombre}</h4>

                    <span class="estado ${usuario.estado ? "conectado" : "desconectado"}">

                        <i class="fa-solid fa-circle"></i>

                        ${usuario.estado ? "Conectado" : "Desconectado"}

                    </span>

                </div>
            `;

            contenedor.appendChild(tarjeta);

        });

}