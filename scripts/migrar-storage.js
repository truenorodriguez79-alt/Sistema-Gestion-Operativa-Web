const fs = require("fs");
const path = require("path");

const EXTENSIONES = [".html", ".js"];

const PATRONES = [
    "localStorage.getItem",
    "localStorage.setItem",
    "localStorage.removeItem",
    "localStorage.clear",
    "sessionStorage.getItem",
    "sessionStorage.setItem",
    "sessionStorage.removeItem",
    "sessionStorage.clear"
];

let total = 0;

function recorrer(directorio){

    const elementos = fs.readdirSync(directorio);

    for(const elemento of elementos){

        const ruta = path.join(directorio, elemento);

        const stat = fs.statSync(ruta);

        if(stat.isDirectory()){

            if(
                elemento === ".git" ||
                elemento === "node_modules"
            ){
                continue;
            }

            recorrer(ruta);

            continue;

        }

        if(!EXTENSIONES.includes(path.extname(ruta)))
            continue;

        const contenido = fs.readFileSync(ruta,"utf8");

        let encontrados = [];

        for(const patron of PATRONES){

            const coincidencias =
                contenido.match(
                    new RegExp(
                        patron.replace(/\./g,"\\."),
                        "g"
                    )
                );

            if(coincidencias){

                encontrados.push({
                    patron,
                    cantidad: coincidencias.length
                });

                total += coincidencias.length;

            }

        }

        if(encontrados.length){

            console.log("\n================================");
            console.log(ruta);

            encontrados.forEach(e=>{

                console.log(
                    `${e.patron}  -> ${e.cantidad}`
                );

            });

        }

    }

}

recorrer(process.cwd());

console.log("\n===============================");
console.log("TOTAL ENCONTRADOS:",total);
console.log("===============================");