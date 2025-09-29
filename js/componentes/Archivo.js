import ComponenteArchivo from "./ComponenteArchivo.js";

export default class Archivo extends ComponenteArchivo {
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