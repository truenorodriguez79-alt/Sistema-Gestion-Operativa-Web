"use strict";

/* ==========================================================
   TABLAS + SUPABASE
========================================================== */

/**
 * Guarda un registro en historial_excel
 */
async function guardarHistorialExcel(info){

    try{

        const { error } = await window.supabaseClient

            .from("historial_excel")

            .insert([info]);

        if(error){

            console.error("Error al guardar historial:",error);

            return false;

        }

        console.log("✅ Historial guardado");

        return true;

    }

    catch(err){

        console.error(err);

        return false;

    }

}


/**
 * Obtiene el historial completo
 */
async function cargarHistorialExcel(){

    try{

        const { data,error } = await window.supabaseClient

            .from("historial_excel")

            .select("*")

            .order("created_at",{ascending:false});

        if(error){

            console.error(error);

            return [];

        }

        return data;

    }

    catch(err){

        console.error(err);

        return [];

    }

}