import ComponenteArchivo from "./ComponenteArchivo.js";

export default class Archivo extends ComponenteArchivo {
    constructor(id, nombre, formato, tamanioKB) {
        super(id, nombre);
        this.formato = formato || "";
        this.tamanoKB = Number(tamanioKB) || 0;
    }

    obtenerTamano() { return this.tamanoKB; }

    listarHTML() {
        return `<div class="archivo">📄 ${this.nombre} (${this.tamanoKB} KB)</div>`;
    }

    serializar() {
        return {
            tipo: "archivo",
            id: this.id,
            nombre: this.nombre,
            formato: this.formato,
            tamanoKB: this.tamanoKB,
        };
    }

    static desdeObjeto(o) {
        return new Archivo(o.id, o.nombre, o.formato, o.tamanoKB);
    }
}
