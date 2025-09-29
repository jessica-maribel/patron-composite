import ComponenteArchivo from "./ComponenteArchivo.js";

export default class Carpeta extends ComponenteArchivo {
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