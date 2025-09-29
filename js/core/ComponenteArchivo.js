export default class ComponenteArchivo {
    constructor(id, nombre) {
        if (new.target === ComponenteArchivo) {
            throw new Error("ComponenteArchivo es abstracto y no puede instanciarse directamente");
        }
        this.id = id;
        this.nombre = nombre;
    }

    esCarpeta() { return false; }
    obtenerTamano() { throw new Error("Método obtenerTamanio() debe ser implementado"); }
    agregar() { throw new Error("No se puede agregar a este elemento"); }
    listarHTML() { throw new Error("Método listarHTML() debe ser implementado"); }
    serializar() { throw new Error("Método serializar() debe ser implementado"); }
}
