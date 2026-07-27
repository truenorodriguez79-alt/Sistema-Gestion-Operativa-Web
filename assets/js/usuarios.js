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

    data.forEach(usuario => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "usuario-activo-card";

        tarjeta.innerHTML = `
            <img
                src="${usuario.foto || "assets/img/usuarios/default.png"}"
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