"use strict";

/* ==========================================================
   BITÁCORA
   SISTEMA DE GESTIÓN OPERATIVA
========================================================== */

console.log("======================================");
console.log("📘 Módulo Bitácora iniciado");
console.log("======================================");

/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let movimientos = [];

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener("DOMContentLoaded", iniciarBitacora);

async function iniciarBitacora() {

    console.log("Inicializando Bitácora...");

    await limpiarBitacora();

    await cargarBitacora();

    activarRealtime();

}

/* ==========================================================
   REGISTRAR MOVIMIENTO
========================================================== */

async function registrarMovimiento({

    usuario,

    accion,

    descripcion,

    folio = null,

    icono = "fa-circle-info"

}) {

    try {

        const { error } = await supabaseClient

            .from("bitacora")

            .insert({

                usuario,

                accion,

                descripcion,

                folio,

                icono

            });

        if (error) throw error;

        console.log("Movimiento registrado.");

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   CARGAR BITÁCORA
========================================================== */

async function cargarBitacora() {

    const { data, error } = await supabaseClient

        .from("bitacora")

        .select("*")

        .order("created_at", {

            ascending: false

        })

        .limit(20);

    if (error) {

        console.error(error);

        return;

    }

   movimientos = data || [];

mostrarBitacora();

console.table(movimientos);

}

/* ==========================================================
   MOSTRAR BITÁCORA
========================================================== */

function mostrarBitacora() {

    const contenedor =
        document.getElementById("listaBitacora");

    if (!contenedor) return;

    if (movimientos.length === 0) {

        contenedor.innerHTML = `

            <div class="sin-bitacora">

                Sin movimientos recientes

            </div>

        `;

        return;

    }

    contenedor.innerHTML = "";

    movimientos.forEach(movimiento => {

        const fecha = new Date(movimiento.created_at);

        const hora = fecha.toLocaleTimeString("es-MX", {

            hour: "2-digit",
            minute: "2-digit"

        });

        const item = document.createElement("div");

        item.className = "bitacora-item";

        item.innerHTML = `

            <div class="bitacora-icono">

                <i class="fa-solid ${movimiento.icono}"></i>

            </div>

            <div class="bitacora-info">

                <strong>

                    ${movimiento.usuario}

                </strong>

                <p>

                    ${movimiento.descripcion}

                </p>

                <small>

                    ${hora}

                </small>

            </div>

        `;

        contenedor.appendChild(item);

    });

}

/* ==========================================================
   LIMPIAR BITÁCORA
========================================================== */

async function limpiarBitacora() {

    try {

        await supabaseClient.rpc(

            "limpiar_bitacora"

        );

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   REALTIME
========================================================== */

function activarRealtime() {

    supabaseClient

        .channel("bitacora-dashboard")

        .on(

            "postgres_changes",

            {

                event: "*",

                schema: "public",

                table: "bitacora"

            },

            async () => {

                await cargarBitacora();

            }

        )

        .subscribe();

}

/* ==========================================================
   FUNCIONES PÚBLICAS
========================================================== */

window.registrarMovimiento =
    registrarMovimiento;

window.cargarBitacora =
    cargarBitacora;

window.limpiarBitacora =
    limpiarBitacora;

/* ==========================================================
   FIN
========================================================== */

console.log("======================================");
console.log("✅ bitacora.js listo");
console.log("======================================");