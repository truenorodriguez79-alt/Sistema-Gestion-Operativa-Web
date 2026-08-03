/* ==========================================================
   VARIABLES GLOBALES V3
========================================================== */

let libroExcel = null;

let hojaActual = "";

let nombresHojas = [];

let datosExcel = [];

let graficaActual = null;

let archivoActual = null;

/* ==========================================================
   INICIO
========================================================== */

function iniciarModuloTablas() {

    obtenerUsuario();

    prepararCargaExcel();

    prepararGrafica();

}

/* ==========================================================
   IMPORTAR EXCEL V3
========================================================== */

async function seleccionarArchivo(evento){

    const archivo = evento.target.files[0];

    if(!archivo) return;

    archivoActual = archivo;

    const extension = archivo.name
        .split(".")
        .pop()
        .toLowerCase();

    if(!["xlsx","xls","csv"].includes(extension)){

        alert("Formato de archivo no compatible.");

        return;

    }

    try{

        const buffer = await archivo.arrayBuffer();

        libroExcel = XLSX.read(buffer,{

            type:"array"

        });

        nombresHojas = [...libroExcel.SheetNames];

        hojaActual = nombresHojas[0];

        cargarHoja(hojaActual);

        construirPanelHojas();

    }

    catch(error){

        console.error(error);

        alert("Error al leer el archivo.");

    }

}

/* ==========================================================
   CARGAR HOJA
========================================================== */

function cargarHoja(nombreHoja){

    hojaActual = nombreHoja;

    const hoja = libroExcel.Sheets[nombreHoja];

    datosExcel = XLSX.utils.sheet_to_json(hoja,{

        header:1,

        defval:""

    });

    mostrarTabla(datosExcel);

    actualizarEstadisticas(libroExcel,datosExcel);

}

function mostrarTabla(datos) {

    const contenedor =
        document.getElementById("contenidoResultados");

    if (!contenedor) return;

    if (!datos.length) {

        contenedor.innerHTML =
            "<p>No hay datos para mostrar.</p>";

        return;

    }

    let html = `
        <div class="table-responsive">
        <table class="table table-bordered table-hover">
    `;

    datos.forEach((fila, indice) => {

        html += "<tr>";

        fila.forEach(columna => {

            if (indice === 0) {

                html += `<th>${columna ?? ""}</th>`;

            } else {

                html += `<td>${columna ?? ""}</td>`;

            }

        });

        html += "</tr>";

    });

    html += "</table></div>";

    contenedor.innerHTML = html;

}

/* ==========================================================
   ESTADÍSTICAS
========================================================== */

function actualizarEstadisticas(libro, datos) {

    document.getElementById("statArchivos").textContent = "1";

    document.getElementById("statHojas").textContent =
        libro.SheetNames.length;

    document.getElementById("statRegistros").textContent =
        Math.max(datos.length - 1, 0);

    let suma = 0;
    let cantidad = 0;

    datos.slice(1).forEach(fila => {

        fila.forEach(valor => {

            if (!isNaN(valor) && valor !== "") {

                suma += Number(valor);
                cantidad++;

            }

        });

    });

    const promedio =
        cantidad ? (suma / cantidad).toFixed(2) : "0";

    document.getElementById("statPromedio").textContent =
        promedio;

}

/* ==========================================================
   GRÁFICAS
========================================================== */

function prepararGrafica() {

    const boton = document.getElementById("btnGenerarGrafica");

    if (!boton) return;

    boton.addEventListener("click", generarGrafica);

}

function generarGrafica() {

    if (datosExcel.length < 2) {

        alert("Primero carga un archivo Excel.");

        return;

    }

    const tipo =
        document.getElementById("tipoGrafica").value;

    const etiquetas = [];
    const valores = [];

    datosExcel.slice(1).forEach(fila => {

        etiquetas.push(fila[0]);

        valores.push(Number(fila[1]) || 0);

    });

    const ctx =
        document.getElementById("graficaPrincipal");

    if (graficaActual) {

        graficaActual.destroy();

    }

    graficaActual = new Chart(ctx, {

        type: tipo,

        data: {

            labels: etiquetas,

            datasets: [

                {

                    label: "Datos",

                    data: valores,

                    borderWidth: 2

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true

        }

    });

}
