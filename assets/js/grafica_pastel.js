/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let datosExcel = [];

let zonasVerdes = [];

let zonasAmarillas = [];

let zonasRojas = [];

let graficaPastel = null;

/* ===========================
   COMPARACIÓN DE MESES
=========================== */

let libroExcel = null;

let graficaMes1 = null;

let graficaMes2 = null;


/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarGraficaPastel
);


/* ==========================================================
   INICIAR MÓDULO
========================================================== */

function iniciarGraficaPastel() {

    prepararCargaExcel();

    prepararBotonGenerar();

    prepararBotonComparar();

}

/* ==========================================================
   PREPARAR EXCEL
========================================================== */

function prepararCargaExcel() {

    const input =
        document.getElementById("archivoExcel");

    if (!input) return;

    input.addEventListener(
        "change",
        leerArchivoExcel
    );

}


/* ==========================================================
   PREPARAR BOTÓN
========================================================== */

function prepararBotonGenerar() {

    const boton =
        document.getElementById("btnGenerarGrafica");

    if (!boton) return;

    boton.addEventListener(
        "click",
        generarGraficaPastel
    );

}

/* ==========================================================
   GENERAR
========================================================== */

function generarGraficaPastel() {

    if (datosExcel.length === 0) {

        alert("Selecciona primero un archivo de Excel.");

        return;

    }

    clasificarDatos();

}

/* ==========================================================
   LEER EXCEL
========================================================== */

function leerArchivoExcel(evento) {

    const archivo = evento.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(e) {

        const datos = new Uint8Array(e.target.result);

       const libro = XLSX.read(datos, {
    type: "array"
});

libroExcel = libro;

llenarSelectMeses();

const hoja =
    libro.Sheets[
        libro.SheetNames[0]
    ];

        const filas =
            XLSX.utils.sheet_to_json(
                hoja,
                {
                    header: 1
                }
            );

        procesarExcel(filas);

    };

    lector.readAsArrayBuffer(archivo);

}

/* ==========================================================
   PROCESAR EXCEL
========================================================== */

function procesarExcel(filas){

    datosExcel = [];

    for(let i=1; i<filas.length; i++){

        const fila = filas[i];

        if(!fila || fila.length < 2)
            continue;

        const zona =
            String(fila[0]).trim();

        let porcentaje =
            String(fila[1]);

        porcentaje =
            porcentaje.replace("%","");

        porcentaje =
            parseFloat(porcentaje);

        if(isNaN(porcentaje))
            continue;

        datosExcel.push({

            zona,

            porcentaje

        });

    }

  const datosMes1 =
    obtenerDatosHoja(mes1);

const datosMes2 =
    obtenerDatosHoja(mes2);

console.clear();

console.log("Mes 1");

console.table(datosMes1);

console.log("Mes 2");

console.table(datosMes2);

}

/* ==========================================================
   CLASIFICAR DATOS
========================================================== */

function clasificarDatos() {

    zonasVerdes = [];

    zonasAmarillas = [];

    zonasRojas = [];

    for (const dato of datosExcel) {

        if (dato.porcentaje === 100) {

            zonasVerdes.push(dato);

        }

        else if (dato.porcentaje >= 80 && dato.porcentaje < 100) {

            zonasAmarillas.push(dato);

        }

        else {

            zonasRojas.push(dato);

        }

    }

    ordenarZonas();

    mostrarResultados();

    crearGrafica();

}

/* ==========================================================
   ORDENAR ZONAS
========================================================== */

function ordenarZonas() {

    const ordenar = (a, b) => {

        if (b.porcentaje !== a.porcentaje) {

            return b.porcentaje - a.porcentaje;

        }

        return a.zona.localeCompare(b.zona);

    };

    zonasVerdes.sort(ordenar);

    zonasAmarillas.sort(ordenar);

    zonasRojas.sort(ordenar);

    console.clear();

    console.log("===== VERDES =====");

    console.table(zonasVerdes);

    console.log("===== AMARILLAS =====");

    console.table(zonasAmarillas);

    console.log("===== ROJAS =====");

    console.table(zonasRojas);

}

/* ==========================================================
   MOSTRAR RESULTADOS
========================================================== */

function mostrarResultados() {

    llenarLista(
        "listaVerdes",
        zonasVerdes,
        "success"
    );

    llenarLista(
        "listaAmarillas",
        zonasAmarillas,
        "warning"
    );

    llenarLista(
        "listaRojas",
        zonasRojas,
        "danger"
    );

}


/* ==========================================================
   LLENAR LISTA
========================================================== */

function llenarLista(id, datos, color) {

    const contenedor =
        document.getElementById(id);

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (datos.length === 0) {

        contenedor.innerHTML =
            "<p class='text-muted'>Sin registros</p>";

        return;

    }

    datos.forEach(item => {

        contenedor.innerHTML += `

            <div class="d-flex justify-content-between align-items-center border rounded p-2 mb-2">

                <strong>${item.zona}</strong>

                <span class="badge bg-${color}">
                    ${item.porcentaje}%
                </span>

            </div>

        `;

    });

}

/* ==========================================================
   CREAR GRÁFICA
========================================================== */

function crearGrafica() {

    const canvas = document.getElementById("graficaPastel");

    if (!canvas) return;

    if (graficaPastel) {

        graficaPastel.destroy();

    }

    const etiquetas = datosExcel.map(d => d.zona);

    const valores = datosExcel.map(d => d.porcentaje);

    const colores = datosExcel.map(d => {

        if (d.porcentaje === 100)
            return "#1b5e55";

        if (d.porcentaje >= 80)
            return "#c99800";

        return "#7b1638";

    });

    graficaPastel = new Chart(canvas, {

        type: "pie",

        data: {

            labels: etiquetas,

            datasets: [{

                data: valores,

                backgroundColor: colores,

                borderColor: "#ffffff",

                borderWidth: 4,

               hoverOffset: 35,

               offset: 15

            }]

        },

        plugins: [ChartDataLabels],

        options: {

            responsive: true,

            maintainAspectRatio: true,

            animation: {

                animateRotate: true,

                animateScale: true,

                duration: 1800,

                easing: "easeOutQuart"

            },

            layout: {

                padding: 20

            },

            plugins: {

            legend: {

    position: "bottom",

    align: "center",

    labels: {

        usePointStyle: true,

        pointStyle: "rectRounded",

        boxWidth: 18,

        boxHeight: 18,

        padding: 25,

        color: "#212529",

        font: {

            size: 16,

            weight: "bold"

        }

    }

},
                tooltip: {

                    callbacks: {

                        label: function(context){

                            return context.label + ": " +
                                   context.raw + "%";

                        }

                    }

                },

datalabels: {

    color: "#ffffff",

    align: "end",

anchor: "center",

    offset: -2,

    font: {

        weight: "bold",

        size: 20

    },

    formatter: function(value, context){

        return context.chart.data.labels[
            context.dataIndex
        ] + "\n" + value + "%";

    },

    textAlign: "center",

    textStrokeColor: "#000",

    textStrokeWidth: 4,

    clamp: true

}
            }

        }

    });

}

function llenarSelectMeses() {

    if (!libroExcel) return;

    const select1 =
        document.getElementById("mesComparacion1");

    const select2 =
        document.getElementById("mesComparacion2");

    if (!select1 || !select2) return;

    select1.innerHTML = "";
    select2.innerHTML = "";

    libroExcel.SheetNames.forEach((nombre) => {

        const opcion1 = document.createElement("option");
        opcion1.value = nombre;
        opcion1.textContent = nombre;
        select1.appendChild(opcion1);

        const opcion2 = document.createElement("option");
        opcion2.value = nombre;
        opcion2.textContent = nombre;
        select2.appendChild(opcion2);

    });

    if (libroExcel.SheetNames.length > 1) {

        select2.selectedIndex = 1;

    }

}

/* ==========================================================
   PREPARAR BOTÓN COMPARAR
========================================================== */

function prepararBotonComparar() {

    const boton =
        document.getElementById("btnCompararMeses");

    if (!boton) return;

    boton.addEventListener(
        "click",
        compararMeses
    );

}

/* ==========================================================
   COMPARAR MESES
========================================================== */

function compararMeses() {

    const mes1 =
        document.getElementById("mesComparacion1").value;

    const mes2 =
        document.getElementById("mesComparacion2").value;

    if (!mes1 || !mes2) {

        alert("Selecciona dos meses.");

        return;

    }

    console.clear();

    console.log("Mes 1:", mes1);

    console.log("Mes 2:", mes2);

}

/* ==========================================================
   OBTENER DATOS DE UNA HOJA
========================================================== */

function obtenerDatosHoja(nombreHoja) {

    const hoja =
        libroExcel.Sheets[nombreHoja];

    const filas =
        XLSX.utils.sheet_to_json(
            hoja,
            {
                header: 1
            }
        );

    const datos = [];

    for (let i = 1; i < filas.length; i++) {

        const fila = filas[i];

        if (!fila || fila.length < 2)
            continue;

        const zona =
            String(fila[0]).trim();

        let porcentaje =
            String(fila[1]);

        porcentaje =
            porcentaje.replace("%", "");

        porcentaje =
            parseFloat(porcentaje);

        if (isNaN(porcentaje))
            continue;

        datos.push({

            zona,

            porcentaje

        });

    }

    return datos;

}