export default class ComponenteArchivo {
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