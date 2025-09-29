// ==========================
// USO DE PATRÓN COMPOSITE


// Componente base ===========
class ComponenteArchivo {
    constructor(nombre) {
        this.nombre = nombre;
    }
    obtenerNombre() {
        return this.nombre;
    }
    obtenerTamanio() {
        throw new Error("Método obtenerTamanio() debe ser implementado");
    }
    agregar() {
        throw new Error("No se puede agregar a este elemento");
    }
    listarHTML() {
        throw new Error("Método listarHTML() debe ser implementado");
    }
}

// Hoja: Archivo
class Archivo extends ComponenteArchivo {
    constructor(nombre, tamanio) {
        super(nombre);
        this.tamanio = parseInt(tamanio);
    }
    obtenerTamanio() {
        return this.tamanio;
    }
    listarHTML() {
        return `<div class="archivo">📄 ${this.nombre} (${this.tamanio} KB)</div>`;
    }
}

// Composite: Carpeta ======
class Carpeta extends ComponenteArchivo {
    constructor(nombre) {
        super(nombre);
        this.elementos = [];
    }
    agregar(elemento) {
        this.elementos.push(elemento);
    }
    obtenerTamanio() {
        return this.elementos.reduce((total, elem) => total + elem.obtenerTamanio(), 0);
    }
    listarHTML() {
        let html = `<div class="carpeta">📁 ${this.nombre} (${this.obtenerTamanio()} KB)</div>`;
        html += `<div class="sub-elemento">`;
        this.elementos.forEach(e => html += e.listarHTML());
        html += `</div>`;
        return html;
    }
}

// LÓGICA DE LA APLICACIÓN ===========

const nombreElemento = document.getElementById('nombreElemento');
const tipoElemento = document.getElementById('tipoElemento');
const tamanioElemento = document.getElementById('tamanioElemento');
const carpetaPadre = document.getElementById('carpetaPadre');
const vistaEstructura = document.getElementById('vistaEstructura');
const tamanoTotal = document.getElementById('tamanoTotal');
const btnAgregar = document.getElementById('btnAgregar');
const btnLimpiar = document.getElementById('btnLimpiar');
const campoTamanio = document.getElementById('campoTamanio');

let raiz = new Carpeta("Raíz");

// Cargar datos de LocalStorage  ================
function cargarDesdeLocal() {
    const datos = localStorage.getItem("estructuraArchivos");
    if (datos) {
        raiz = reconstruir(JSON.parse(datos));
    }
    actualizarVista();
}

// Reconstrucción de objetos desde JSON ==============
function reconstruir(obj) {
    if (obj.tipo === "carpeta") {
        let carpeta = new Carpeta(obj.nombre);
        obj.elementos.forEach(el => carpeta.agregar(reconstruir(el)));
        return carpeta;
    } else {
        return new Archivo(obj.nombre, obj.tamanio);
    }
}

// Guardar en LocalStorage =============
function guardarEnLocal() {
    localStorage.setItem("estructuraArchivos", JSON.stringify(serializar(raiz)));
}

// Serializar para guardar  =============
function serializar(obj) {
    if (obj instanceof Carpeta) {
        return {
            tipo: "carpeta",
            nombre: obj.nombre,
            elementos: obj.elementos.map(el => serializar(el))
        };
    } else {
        return {
            tipo: "archivo",
            nombre: obj.nombre,
            tamanio: obj.tamanio
        };
    }
}

// Actualiza la vista HTML ============
function actualizarVista() {
    vistaEstructura.innerHTML = raiz.listarHTML();
    tamanoTotal.textContent = raiz.obtenerTamanio();
    actualizarOpcionesCarpeta();
}

// Llena el select de carpetas disponibles ==========
function actualizarOpcionesCarpeta() {
    carpetaPadre.innerHTML = "";
    const opciones = obtenerRutasCarpetas(raiz, "Raíz");
    opciones.forEach(op => {
        const opt = document.createElement("option");
        opt.value = op.ruta;
        opt.textContent = op.ruta;
        carpetaPadre.appendChild(opt);
    });
}

// Obtiene rutas de carpetas para el select ========
function obtenerRutasCarpetas(carpeta, rutaActual) {
    let rutas = [{ carpeta, ruta: rutaActual }];
    carpeta.elementos.forEach(el => {
        if (el instanceof Carpeta) {
            rutas = rutas.concat(obtenerRutasCarpetas(el, `${rutaActual}/${el.nombre}`));
        }
    });
    return rutas;
}

// Buscar carpeta por ruta =============
function buscarCarpetaPorRuta(carpeta, ruta) {
    if (ruta === "Raíz") return carpeta;
    const partes = ruta.split("/").slice(1);
    let actual = carpeta;
    for (let p of partes) {
        actual = actual.elementos.find(e => e instanceof Carpeta && e.nombre === p);
    }
    return actual;
}

// Evento para ocultar/mostrar tamano en archivos ============
tipoElemento.addEventListener('change', () => {
    campoTamanio.style.display = (tipoElemento.value === 'carpeta') ? 'none' : 'block';
});

// Agregar nuevo elemento  ===============
btnAgregar.addEventListener('click', () => {
    const nombre = nombreElemento.value.trim();
    const tipo = tipoElemento.value;
    const tamanio = tamanioElemento.value || 0;
    const ruta = carpetaPadre.value;

    if (!nombre) {
        alert("Debe ingresar un nombre");
        return;
    }

    const carpetaDestino = buscarCarpetaPorRuta(raiz, ruta);

    if (tipo === "carpeta") {
        carpetaDestino.agregar(new Carpeta(nombre));
    } else {
        carpetaDestino.agregar(new Archivo(nombre, tamanio));
    }

    guardarEnLocal();
    actualizarVista();
    nombreElemento.value = "";
    tamanioElemento.value = 0;
});

// Limpiar todo  ===========
btnLimpiar.addEventListener('click', () => {
    if (confirm("¿Seguro que desea eliminar toda la estructura?")) {
        raiz = new Carpeta("Raíz");
        localStorage.removeItem("estructuraArchivos");
        actualizarVista();
    }
});

// Inicializar ==============
cargarDesdeLocal();

