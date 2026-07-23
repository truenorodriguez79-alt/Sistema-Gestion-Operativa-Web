/* ==========================================================
   LOADING SCREEN
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const loading = document.getElementById("loadingScreen");

    if (!loading) return;

    setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {

            loading.style.display = "none";

        }, 500);

    }, 1500);

});