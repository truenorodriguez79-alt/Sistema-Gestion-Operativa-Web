"use strict";

/* ==========================================================
   SISTEMA DE GESTIÓN OPERATIVA
   CRUD DE PENDIENTES - SUPABASE
========================================================== */

const TABLA_PENDIENTES = "pendientes";

async function obtenerPendientes() {

    const { data, error } = await supabaseClient
        .from(TABLA_PENDIENTES)
        .select("*")
        .order("folio", { ascending: true });

    if (error) {

        console.error(error);

        return [];

    }

    return data;

}

async function obtenerPendientePorId(id) {

    const { data, error } = await supabaseClient
        .from(TABLA_PENDIENTES)
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        console.error(error);

        return null;

    }

    return data;

}

async function crearPendiente(pendiente) {

    const { data, error } = await supabaseClient
        .from(TABLA_PENDIENTES)
        .insert([pendiente])
        .select()
        .single();

    if (error) {

        console.error(error);

        return null;

    }

    return data;

}