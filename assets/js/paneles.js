console.log("paneles.js cargado");

document.addEventListener("DOMContentLoaded", () => {

    crearPanelPendientes();

    crearPizarronPendientes();

});
function crearPanelPendientes() {

    const contenedor = document.getElementById("pendientesUsuarios");

    if (!contenedor) {

        console.error("No existe el contenedor #pendientesUsuarios");

        return;

    }


const responsables = [

{
    usuario: "elizabeth",
    nombre: "Lic. Elizabeth Alvarez Hernandez",
    area: "Control Financiero",
    clase: "tema-elizabeth",
    imagen: "assets/img/fondo/apartado Elizabeth.jpg"
},

{
    usuario: "jaso",
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
    contenedor.innerHTML = "";

    responsables.forEach(usuario => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "tarjeta-pendiente";

        tarjeta.innerHTML = `

            <img
                src="${usuario.imagen}"
                class="tarjeta-imagen"
                alt="${usuario.nombre}">

            <div class="tarjeta-info">

                <h3>${usuario.nombre}</h3>

                <p>${usuario.descripcion}</p>

                <div class="tarjeta-botones">

                    <button
    class="btn-dashboard"
    onclick="window.location.href='pendientes.html?usuario=${usuario.usuario}'">

    <i class="fa-solid fa-list-check"></i>
    Pendiente

</button>

                 <button
    class="btn-dashboard"
    onclick="window.location.href='tablas.html?usuario=${usuario.usuario}'">

    <i class="fa-solid fa-table"></i>
    Tablas y Gráficas

</button>

                   <button
    class="btn-dashboard"
    onclick="window.location.href='grafica_pastel.html?usuario=${usuario.usuario}'">

    <i class="fa-solid fa-chart-pie"></i>

    Gráfica Pastel

</button>

                </div>

            </div>

        `;

        contenedor.appendChild(tarjeta);

    });

    console.log("Panel de pendientes creado correctamente.");

}

function crearPizarronPendientes() {

    const contenedor = document.getElementById("pizarronPendientes");

    console.log("=== PIZARRÓN ===");
console.log(contenedor);

    if (!contenedor) return;

    const responsables = [

        {
            usuario: "elizabeth",
            nombre: "Lic. Elizabeth Alvarez Hernandez",
            area: "Control Financiero",
            clase: "tema-elizabeth"
        },

        {
            usuario: "jaso",
            nombre: "Ing. Juan Carlos Rodriguez Jasso",
            area: "Asuntos Contenciosos",
            clase: "tema-jaso"
        },

        {
            usuario: "enrique",
            nombre: "Ing. Luis Enrique Arredondo Facio",
            area: "Gestión Operativa",
            clase: "tema-enrique"
        }

    ];

    const pendientes =
        JSON.parse(localStorage.getItem("pendientes")) || [];

        console.log("Pendientes:", pendientes);

    contenedor.innerHTML = "";

console.log("Voy a crear las columnas");

    responsables.forEach(usuario => {

        const listaUsuario = pendientes.filter(p => {

            if (p.finalizado) return false;

            return (
                p.usuario === usuario.usuario ||
                p.responsable === usuario.usuario ||
                p.asignado === usuario.usuario
            );

        });

        contenedor.innerHTML += `

        <div class="columna-pizarron ${usuario.clase}">

            <div class="cabecera-pizarron">

                <h3>${usuario.nombre}</h3>

                <small>${usuario.area}</small>

            </div>

            <div class="estado-pizarron">

                ${listaUsuario.length} pendiente(s)

            </div>

            <div class="lista-pizarron">

                ${
                    listaUsuario.length
                    ?

                    listaUsuario.map(p => `

                        <div class="item-pizarron">

                            ${p.titulo || p.pendiente || p.descripcion}

                        </div>

                    `).join("")

                    :

                    `<div class="sin-pendientes">

                        Sin pendientes registrados

                    </div>`
                }

            </div>

        </div>

        `;

    });

}