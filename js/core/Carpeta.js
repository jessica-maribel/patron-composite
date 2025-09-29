import ComponenteArchivo from "./ComponenteArchivo.js";
import Archivo from "./Archivo.js";

export default class Carpeta extends ComponenteArchivo {
    constructor(id, nombre) {
        super(id, nombre);
        this.hijos = [];
    }

    esCarpeta() { return true; }

    agregar(elemento) { this.hijos.push(elemento); }

    obtenerTamano() {
        return this.hijos.reduce((total, h) => total + (h?.obtenerTamano?.() ?? 0), 0);
    }

    listarHTML() {
        let html = `<div class="carpeta">📁 ${this.nombre} (${this.obtenerTamano()} KB)</div>`;
        html += `<div class="sub-elemento">`;
        this.hijos.forEach(h => html += h.listarHTML());
        html += `</div>`;
        return html;
    }

    buscarPorId(id) {
        if (this.id === id) return this;
        for (const h of this.hijos) {
            if (h.id === id) return h;
            if (h.esCarpeta && h.esCarpeta()) {
                const r = h.buscarPorId(id);
                if (r) return r;
            }
        }
        return null;
    }

    eliminarPorId(id) {
        const i = this.hijos.findIndex(h => h.id === id);
        if (i >= 0) {
            this.hijos.splice(i, 1);
            return true;
        }
        for (const h of this.hijos) {
            if (h.esCarpeta && h.esCarpeta()) {
                if (h.eliminarPorId(id)) return true;
            }
        }
        return false;
    }

    serializar() {
        return {
            tipo: "carpeta",
            id: this.id,
            nombre: this.nombre,
            hijos: this.hijos.map(h => h.serializar()),
        };
    }

    static desdeObjeto(o) {
        const c = new Carpeta(o.id, o.nombre);
        if (Array.isArray(o.hijos)) {
            for (const h of o.hijos) {
                if (h.tipo === "carpeta") c.agregar(Carpeta.desdeObjeto(h));
                else c.agregar(Archivo.desdeObjeto(h));
            }
        }
        return c;
    }
}
