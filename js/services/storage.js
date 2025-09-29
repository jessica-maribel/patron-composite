import Carpeta from "../core/Carpeta.js";

const CLAVE_STORAGE = "sistema_archivos";

export function guardarEnStorage(raiz) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(raiz.serializar()));
}

export function cargarDesdeStorage() {
  const t = localStorage.getItem(CLAVE_STORAGE);
  if (!t) return null;
  try {
    const o = JSON.parse(t);
    return Carpeta.desdeObjeto(o);
  } catch {
    return null;
  }
}

export function limpiarStorage() {
  localStorage.removeItem(CLAVE_STORAGE);
}
