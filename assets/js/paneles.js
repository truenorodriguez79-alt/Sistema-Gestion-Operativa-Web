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
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Elizabeth.jpg",
    tablas: false
},

{
    usuario: "jaso",
    nombre: "Ing. Juan Carlos Rodriguez Jasso",
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Jasso.jpg",
    tablas: true
},

{
    usuario: "enrique",
    nombre: "Ing. Luis Enrique Arredondo Facio",
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Enrique .jpg",
    tablas: true
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

                    ${usuario.tablas ? `
                        <button class="btn-dashboard">
                            <i class="fa-solid fa-table"></i>
                            Tablas
                        </button>
                    ` : ""}

                    <button class="btn-dashboard">
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

    if (!contenedor) return;

 const responsables = [

{
    usuario: "elizabeth",
    nombre: "Lic. Elizabeth Alvarez Hernandez",
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Elizabeth.jpg",
    tablas: false
},

{
    usuario: "jaso",
    nombre: "Ing. Juan Carlos Rodriguez Jasso",
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Jasso.jpg",
    tablas: true
},

{
    usuario: "enrique",
    nombre: "Ing. Luis Enrique Arredondo Facio",
    descripcion: "Agendar pendientes",
    imagen: "assets/img/fondo/apartado Enrique .jpg",
    tablas: true
}
];

    contenedor.innerHTML = "";

    responsables.forEach(usuario => {

        contenedor.innerHTML += `

        <div class="columna-pizarron ${usuario.clase}">

            <div class="cabecera-pizarron">

                <h3>${usuario.nombre}</h3>

                <small>${usuario.area}</small>

            </div>

            <div class="estado-pizarron">

                Orden normal

            </div>

            <div class="lista-pizarron">

                <div class="sin-pendientes">

                    Sin pendientes registrados

                </div>

            </div>

        </div>

        `;

    });

}