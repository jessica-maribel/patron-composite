import Carpeta from "./core/Carpeta.js";
import Archivo from "./core/Archivo.js";
import { generarId } from "./utils/id.js";
import { guardarEnStorage, cargarDesdeStorage, limpiarStorage } from "./services/storage.js";

// --- Estado inicial ---
let raiz = cargarDesdeStorage();
if (!raiz) {
  raiz = new Carpeta("root", "Raíz");

  const c1 = new Carpeta(generarId(), "Documentos");
  c1.agregar(new Archivo(generarId(), "Curriculum.pdf", "pdf", 120));
  c1.agregar(new Archivo(generarId(), "Datos.xlsx", "xlsx", 340));

  const c2 = new Carpeta(generarId(), "Proyectos");
  c2.agregar(new Archivo(generarId(), "Informe.docx", "docx", 80));

  c1.agregar(c2);
  raiz.agregar(c1);

  guardarEnStorage(raiz);
}

// --- Cache de DOM ---
const selectTipoCrear   = document.getElementById("tipo-crear");
const opcionesArchivo   = document.getElementById("opciones-archivo");
const nombreCrear       = document.getElementById("nombre-crear");
const formatoCrear      = document.getElementById("formato-crear");
const tamanoCrear       = document.getElementById("tamano-crear");
const padreCrear        = document.getElementById("padre-crear");
const btnCrear          = document.getElementById("btn-crear");
const arbolContenedor   = document.getElementById("arbol-contenedor");
const detalles          = document.getElementById("detalles");
const btnExpandirTodos  = document.getElementById("btn-expandir-todos");
const btnColapsarTodos  = document.getElementById("btn-colapsar-todos");
const btnLimpiar        = document.getElementById("btn-limpiar");

// --- UI lógica ---
selectTipoCrear.addEventListener("change", () => {
  if (selectTipoCrear.value === "archivo") opcionesArchivo.classList.remove("oculto");
  else opcionesArchivo.classList.add("oculto");
});

function construirOpcionesPadre() {
  padreCrear.innerHTML = "";

  const optRaiz = document.createElement("option");
  optRaiz.value = raiz.id;
  optRaiz.textContent = `${raiz.nombre} (Raíz)`;
  padreCrear.appendChild(optRaiz);

  (function recorrer(c, p = "") {
    for (const h of c.hijos) {
      if (h.esCarpeta && h.esCarpeta()) {
        const o = document.createElement("option");
        o.value = h.id;
        o.textContent = p + h.nombre;
        padreCrear.appendChild(o);
        recorrer(h, p + "— ");
      }
    }
  })(raiz, "");
}

function crearNodoVisual(c) {
  const li = document.createElement("li");

  const fila = document.createElement("div");
  fila.className = "elemento";
  fila.dataset.id = c.id;

  const icono = document.createElement("span");
  icono.className = "icono";
  icono.textContent = c.esCarpeta && c.esCarpeta() ? "📁" : "📄";

  const nombre = document.createElement("span");
  nombre.className = "nombre";
  nombre.textContent = c.nombre;

  const detallePeq = document.createElement("span");
  detallePeq.className = "detalle-peq";

  const tam = c.obtenerTamano();
  detallePeq.textContent = (c.esCarpeta && c.esCarpeta())
    ? `${tam} KB`
    : `${tam} KB • ${c.formato ? c.formato.toUpperCase() : ""}`;

  fila.appendChild(icono);
  fila.appendChild(nombre);
  fila.appendChild(detallePeq);

  fila.addEventListener("click", (e) => {
    e.stopPropagation();
    mostrarDetalles(c.id);
    if (li.querySelector("ul")) {
      const ulh = li.querySelector("ul");
      ulh.style.display = ulh.style.display !== "none" ? "none" : "block";
    }
  });

  li.appendChild(fila);

  if (c.esCarpeta && c.esCarpeta() && c.hijos.length > 0) {
    const ul = document.createElement("ul");
    for (const h of c.hijos) ul.appendChild(crearNodoVisual(h));
    li.appendChild(ul);
  }

  return li;
}

function renderizarArbol() {
  arbolContenedor.innerHTML = "";
  const ul = document.createElement("ul");
  ul.appendChild(crearNodoVisual(raiz));
  arbolContenedor.appendChild(ul);
  construirOpcionesPadre();
}

function mostrarDetalles(id) {
  const s = raiz.buscarPorId(id);
  if (!s) {
    detalles.innerHTML = "<p>No se encontró el elemento.</p>";
    return;
  }

  detalles.innerHTML = "";

  const t = document.createElement("p");
  t.innerHTML = `<strong>Nombre:</strong> ${s.nombre}`;
  detalles.appendChild(t);

  const tipo = document.createElement("p");
  tipo.innerHTML = `<strong>Tipo:</strong> ${s.esCarpeta && s.esCarpeta() ? "Carpeta" : "Archivo"}`;
  detalles.appendChild(tipo);

  const tam = document.createElement("p");
  tam.innerHTML = `<strong>Tamaño:</strong> ${s.obtenerTamano()} KB`;
  detalles.appendChild(tam);

  const inputRen = document.createElement("input");
  inputRen.value = s.nombre;
  detalles.appendChild(inputRen);

  const divAcc = document.createElement("div");
  divAcc.className = "acciones-detalles";

  const btnRen = document.createElement("button");
  btnRen.textContent = "Renombrar";
  btnRen.addEventListener("click", () => {
    const n = inputRen.value.trim();
    if (!n) return alert("El nombre no puede estar vacío.");
    s.nombre = n;
    guardarEnStorage(raiz);
    renderizarArbol();
    mostrarDetalles(s.id);
  });

  const btnEl = document.createElement("button");
  btnEl.className = "secondary";
  btnEl.textContent = "Eliminar";
  btnEl.addEventListener("click", () => {
    if (s.id === raiz.id) {
      if (!confirm("¿Deseas eliminar TODO el contenido y resetear la raíz?")) return;
      raiz = new Carpeta("root", "Raíz");
      guardarEnStorage(raiz);
      renderizarArbol();
      detalles.innerHTML = "<p>Raíz reseteada.</p>";
      return;
    }

    if (!confirm(`¿Eliminar "${s.nombre}"? Esta acción es irreversible.`)) return;

    const e = raiz.eliminarPorId(s.id);
    if (e) {
      guardarEnStorage(raiz);
      renderizarArbol();
      detalles.innerHTML = "<p>Elemento eliminado.</p>";
    } else {
      detalles.innerHTML = "<p>No se pudo eliminar el elemento.</p>";
    }
  });

  if (s.esCarpeta && s.esCarpeta()) {
    const btnCrearSub = document.createElement("button");
    btnCrearSub.textContent = "Crear archivo en esta carpeta";
    btnCrearSub.addEventListener("click", () => {
      selectTipoCrear.value = "archivo";
      opcionesArchivo.classList.remove("oculto");
      nombreCrear.focus();
      padreCrear.value = s.id;
    });
    divAcc.appendChild(btnCrearSub);
  }

  divAcc.appendChild(btnRen);
  divAcc.appendChild(btnEl);
  detalles.appendChild(divAcc);
}

// --- Crear elementos ---
btnCrear.addEventListener("click", () => {
  const t = selectTipoCrear.value;
  const n = nombreCrear.value.trim();
  const idP = padreCrear.value;

  if (!n) return alert("El nombre es obligatorio.");

  const p = raiz.buscarPorId(idP);
  if (!p || !(p.esCarpeta && p.esCarpeta())) return alert("Carpeta padre no válida.");

  if (t === "carpeta") {
    p.agregar(new Carpeta(generarId(), n));
  } else {
    const f = formatoCrear.value;
    const tam = Math.max(1, Number(tamanoCrear.value) || 1);
    p.agregar(new Archivo(generarId(), n, f, tam));
  }

  guardarEnStorage(raiz);
  renderizarArbol();
  nombreCrear.value = "";
  tamanoCrear.value = 10;
});

btnExpandirTodos.addEventListener("click", () => {
  arbolContenedor.querySelectorAll("ul").forEach(u => (u.style.display = "block"));
});

btnColapsarTodos.addEventListener("click", () => {
  arbolContenedor.querySelectorAll("ul").forEach((u) => {
    const raizUl = arbolContenedor.querySelector("ul");
    if (u.parentElement !== raizUl) u.style.display = "none";
  });
});

btnLimpiar.addEventListener("click", () => {
  if (!confirm("¿Eliminar todo el contenido? Esto reseteará la raíz.")) return;
  limpiarStorage();
  raiz = new Carpeta("root", "Raíz");
  guardarEnStorage(raiz);
  renderizarArbol();
  detalles.innerHTML = "<p>Raíz reseteada.</p>";
});

// --- Primera renderización ---
renderizarArbol();
mostrarDetalles(raiz.id);
