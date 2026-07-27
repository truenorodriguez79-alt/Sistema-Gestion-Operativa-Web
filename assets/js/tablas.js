/* ==========================================================
   TABLAS Y GRÁFICAS V2
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarModuloTablas);

let datosExcel = [];
let graficaActual = null;

/* ==========================================================
   INICIO
========================================================== */

function iniciarModuloTablas() {

    obtenerUsuario();

    prepararCargaExcel();

    prepararGrafica();

}

/* ==========================================================
   USUARIO
========================================================== */

function obtenerUsuario() {

    const parametros = new URLSearchParams(window.location.search);

    const usuario =
        parametros.get("usuario") ||
        sessionStorage.getItem("usuarioSesionActual") ||
        "Invitado";

    const etiqueta =
        document.getElementById("usuarioActivo");

    if (etiqueta) {

        etiqueta.textContent = usuario;

    }

}

/* ==========================================================
   CARGA DE EXCEL
========================================================== */

function prepararCargaExcel() {

    const input =
        document.getElementById("excelInput");

    if (!input) return;

    input.addEventListener("change", seleccionarArchivo);

}

/* ==========================================================
   SELECCIÓN
========================================================== */

function seleccionarArchivo(evento) {

    const archivo = evento.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function (e) {

        const datos = new Uint8Array(e.target.result);

        const libro = XLSX.read(datos, { type: "array" });

        const primeraHoja = libro.SheetNames[0];

        const hoja = libro.Sheets[primeraHoja];

        const contenido = XLSX.utils.sheet_to_json(hoja, {
            header: 1
        });

datosExcel = contenido;

mostrarTabla(datosExcel);

actualizarEstadisticas(libro, datosExcel);

    };

    lector.readAsArrayBuffer(archivo);

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
