/**
 * Archivo Principal: main.js
 * Objetivo: Controlar la lógica de la aplicación, manejar eventos y conectar con la API y Servicios.
 */
import { buscarYMostrarUsuario, procesarCreacionTarea, procesarActualizacionTarea, procesarEliminacionTarea } from "./services/index.js";
import { armarFiltros, armarTareas, notificarError, notificarInfo } from "./ui/index.js";
import { setFiltroEstado, setFiltroUsuario, getFiltroEstado, getFiltroUsuario, obtenerTareasFiltradas, resetearFiltros, setCriterioOrden, setDireccionOrden, getCriterioOrden, getDireccionOrden, resetearOrden } from "./services/index.js";

// ==========================================
// REFERENCIAS AL DOM (HTML)
// ==========================================
const formularioBusqueda = document.getElementById("searchForm");
const entradaIdUsuario = document.getElementById("userId");
const errorIdUsuario = document.getElementById("userIdError");

// Secciones que mostramos u ocultamos
const seccionInfoUsuario = document.getElementById("userInfoSection");
const contenedorInfoUsuario = document.getElementById("userInfoContainer");

const seccionFormularioTarea = document.getElementById("taskFormSection");
const formularioTarea = document.getElementById("taskForm");

const seccionListaTareas = document.getElementById("tasksListSection");
const contenedorTareas = document.getElementById("tasksContainer");

// Sección de filtros
const seccionFiltros = document.getElementById("filterSection");
const contenedorFiltros = document.getElementById("filterContainer");

// ==========================================
// VARIABLES DE ESTADO Y OBJETOS DEL DOM
// ==========================================
let usuarioActual = null;  // Guarda el objeto del usuario logueado actualmente
let modoEdicion = false;   // Bandera: true=editando tarea, false=creando tarea nueva
let tareaActualId = null;  // Guarda el ID de la tarea que se está editando

// Funciones de utilidad y referencias DOM que necesitan los servicios
const domElements = { contenedorInfoUsuario, seccionInfoUsuario, seccionFormularioTarea, seccionListaTareas, errorIdUsuario, contenedorTareas, mostrarError, ocultarSecciones };

// ==========================================
// FUNCIÓN CENTRAL: RENDERIZAR CON FILTROS
// ==========================================

/**
 * Función de re-render central. Lee las tareas desde filterService
 * (ya filtradas según filtros activos) y las dibuja en el contenedor.
 * Actualiza también el badge informativo de resultados.
 */
function renderTareasFiltradas() {
    const tareasFiltradas = obtenerTareasFiltradas();

    // Efecto visual de transición suave
    contenedorTareas.classList.add('filtering');

    setTimeout(() => {
        contenedorTareas.innerHTML = '';
        contenedorTareas.classList.remove('filtering');

        if (tareasFiltradas.length === 0) {
            // Mostrar estado vacío
            const divVacio = document.createElement('div');
            divVacio.className = 'filter-no-results';

            const iconoVacio = document.createElement('div');
            iconoVacio.className = 'filter-no-results__icon';
            iconoVacio.textContent = '🔍';

            const textoVacio = document.createElement('p');
            textoVacio.className = 'filter-no-results__text';
            textoVacio.textContent = 'Sin resultados';

            const subTexto = document.createElement('p');
            subTexto.className = 'filter-no-results__sub';
            subTexto.textContent = 'Ninguna tarea coincide con los filtros seleccionados.';

            divVacio.append(iconoVacio, textoVacio, subTexto);
            contenedorTareas.append(divVacio);
        } else {
            armarTareas(contenedorTareas, tareasFiltradas);
        }

        // Actualizar badge
        actualizarBadge(tareasFiltradas.length);
    }, 120);
}

/**
 * Actualiza el badge de resultados con el conteo actual.
 */
function actualizarBadge(cantidad) {
    const badge = document.getElementById('filterResultsBadge');
    if (!badge) return;

    const hayFiltroActivo = getFiltroEstado() !== 'all' || getFiltroUsuario() !== 'all';

    if (hayFiltroActivo) {
        badge.textContent = `${cantidad} tarea${cantidad !== 1 ? 's' : ''} encontrada${cantidad !== 1 ? 's' : ''}`;
        badge.classList.add('filter-badge--active');
    } else {
        badge.textContent = `${cantidad} tarea${cantidad !== 1 ? 's' : ''} en total`;
        badge.classList.remove('filter-badge--active');
    }
}

// ==========================================
// EVENTO 1: BUSCAR USUARIO
// ==========================================
formularioBusqueda.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const idUsuario = entradaIdUsuario.value;

    if (idUsuario === "") {
        mostrarError("Por favor ingresa un número de ID");
        return;
    }

    // Resetear filtros al buscar un usuario nuevo
    resetearFiltros();

    // Delegamos la lógica al servicio, pasando renderTareasFiltradas como fn de render
    usuarioActual = await buscarYMostrarUsuario(idUsuario, domElements, renderTareasFiltradas);

    // Si se encontró el usuario, construir el panel de filtros
    if (usuarioActual) {
        seccionFiltros.classList.remove("hidden");

        // Armar el panel de filtros + ordenamiento con el usuario actual
        const { selectEstado, selectUsuario, btnLimpiar, selectOrden, btnDireccion } = armarFiltros(contenedorFiltros, [usuarioActual]);

        // Sincronizar los controles con el estado actual
        selectEstado.value = getFiltroEstado();
        selectUsuario.value = getFiltroUsuario();
        selectOrden.value = getCriterioOrden();
        btnDireccion.setAttribute('data-dir', getDireccionOrden());
        btnDireccion.querySelector('.sort-dir-icon').textContent = getDireccionOrden() === 'asc' ? '▲' : '▼';
        btnDireccion.querySelector('.sort-dir-text').textContent = getDireccionOrden() === 'asc' ? 'ASC' : 'DESC';

        // ---- Listener: Filtro por Estado ----
        selectEstado.addEventListener('change', () => {
            setFiltroEstado(selectEstado.value);
            renderTareasFiltradas();
        });

        // ---- Listener: Filtro por Usuario ----
        selectUsuario.addEventListener('change', () => {
            setFiltroUsuario(selectUsuario.value);
            renderTareasFiltradas();
        });

        // ---- Listener: Criterio de Orden ----
        selectOrden.addEventListener('change', () => {
            setCriterioOrden(selectOrden.value);
            renderTareasFiltradas();
        });

        // ---- Listener: Botón Dirección (toggle ▲/▼) ----
        btnDireccion.addEventListener('click', () => {
            const nuevaDir = getDireccionOrden() === 'asc' ? 'desc' : 'asc';
            setDireccionOrden(nuevaDir);
            btnDireccion.setAttribute('data-dir', nuevaDir);
            btnDireccion.querySelector('.sort-dir-icon').textContent = nuevaDir === 'asc' ? '▲' : '▼';
            btnDireccion.querySelector('.sort-dir-text').textContent = nuevaDir === 'asc' ? 'ASC' : 'DESC';
            renderTareasFiltradas();
        });

        // ---- Listener: Botón Limpiar (filtros + orden) ----
        btnLimpiar.addEventListener('click', () => {
            resetearFiltros();
            resetearOrden();
            selectEstado.value = 'all';
            selectUsuario.value = 'all';
            selectOrden.value = 'fecha';
            btnDireccion.setAttribute('data-dir', 'asc');
            btnDireccion.querySelector('.sort-dir-icon').textContent = '▲';
            btnDireccion.querySelector('.sort-dir-text').textContent = 'ASC';
            renderTareasFiltradas();
        });
    }
});

// ==========================================
// EVENTO 2: AGREGAR NUEVA TAREA O EDITAR EXISTENTE
// ==========================================
formularioTarea.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (usuarioActual === null) return;

    const titulo = document.getElementById("taskTitle").value;
    const descripcion = document.getElementById("taskBody").value;
    const estadoSeleccionado = document.getElementById("taskCompleted").value;

    // Mapear el valor del select al status interno
    let statusInterno;
    let estaCompletada;
    if (estadoSeleccionado === 'true') {
        statusInterno = 'completed';
        estaCompletada = true;
    } else if (estadoSeleccionado === 'in-progress') {
        statusInterno = 'in-progress';
        estaCompletada = false;
    } else {
        statusInterno = 'pending';
        estaCompletada = false;
    }

    if (titulo === "") {
        notificarInfo("El título es obligatorio");
        return;
    }

    if (modoEdicion) {
        // ==================== MODO EDICIÓN ====================
        const datosActualizados = {
            title: titulo,
            body: descripcion,
            completed: estaCompletada,
            status: statusInterno
        };

        const helpers = {
            actualizarTarjetaEnDOM,
            resetearFormularioAModoCrear,
            renderFn: renderTareasFiltradas
        };

        await procesarActualizacionTarea(tareaActualId, datosActualizados, helpers);

    } else {
        // ==================== MODO CREACIÓN ====================
        const nuevaTarea = {
            title: titulo,
            body: descripcion,
            completed: estaCompletada,
            status: statusInterno,
            userId: usuarioActual.id,
            createdAt: Date.now()  // marca de tiempo local para ordenar por fecha
        };

        await procesarCreacionTarea(nuevaTarea, contenedorTareas, formularioTarea, renderTareasFiltradas);
    }
});

// ==========================================
// EVENTO 3: EDITAR O ELIMINAR TAREA
// ==========================================
contenedorTareas.addEventListener("click", async (evento) => {

    const idTarea = evento.target.getAttribute("data-id");

    if (!idTarea) return;

    // -------- ELIMINAR --------
    if (evento.target.classList.contains("btn-eliminar-tarea")) {
        const tarjeta = evento.target.closest(".message-card");
        await procesarEliminacionTarea(idTarea, tarjeta, renderTareasFiltradas);
    }

    // -------- EDITAR --------
    if (evento.target.classList.contains("btn-editar-tarea")) {
        const tarjeta = evento.target.closest(".message-card");

        const tituloActual = tarjeta.querySelector(".message-author").textContent;
        const descripcionActual = tarjeta.querySelector(".message-text").textContent;
        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending, .status-in-progress");

        // Determinar estado actual desde el data-status de la tarjeta
        const statusActual = tarjeta.getAttribute('data-status') || 'pending';
        const estaCompletada = statusActual === 'completed';

        const tareaActual = {
            id: idTarea,
            title: tituloActual,
            body: descripcionActual === 'Sin descripción disponible' ? '' : descripcionActual,
            completed: estaCompletada,
            status: statusActual
        };

        modoEdicion = true;
        tareaActualId = idTarea;

        llenarFormularioConTarea(tareaActual);
        document.getElementById("taskFormSection").scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// FUNCIONES DE APOYO (HELPERS)
// ==========================================

/**
 * Llena el formulario con los datos de una tarea existente para editar.
 */
function llenarFormularioConTarea(tarea) {
    document.getElementById("taskTitle").value = tarea.title;
    document.getElementById("taskBody").value = tarea.body || '';

    // Mapear el status al valor del select
    let valorSelect;
    if (tarea.status === 'completed' || tarea.completed) {
        valorSelect = 'true';
    } else if (tarea.status === 'in-progress') {
        valorSelect = 'in-progress';
    } else {
        valorSelect = 'false';
    }
    document.getElementById("taskCompleted").value = valorSelect;

    document.querySelector("#taskFormSection .card__title").textContent = "Editar Tarea";
    document.getElementById("addTaskBtn").querySelector(".btn__text").textContent = "Actualizar Tarea";
}

/**
 * Actualiza una tarjeta específica en el DOM (para el modo edición en vivo).
 */
function actualizarTarjetaEnDOM(tareaId, tareaActualizada) {
    const tarjeta = document.querySelector(`[data-id="${tareaId}"]`).closest(".message-card");

    if (tarjeta) {
        tarjeta.querySelector(".message-author").textContent = tareaActualizada.title;
        const parrafoDescripcion = tarjeta.querySelector(".message-text");
        parrafoDescripcion.textContent = tareaActualizada.body || 'Sin descripción disponible';

        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending, .status-in-progress");
        const statusReal = tareaActualizada.status || (tareaActualizada.completed ? 'completed' : 'pending');

        tarjeta.setAttribute('data-status', statusReal);

        if (statusReal === 'completed') {
            spanEstado.className = 'status-completed';
            spanEstado.textContent = '✅ Completada';
            spanEstado.style.color = 'green';
        } else if (statusReal === 'in-progress') {
            spanEstado.className = 'status-in-progress';
            spanEstado.textContent = '⚡ En proceso';
            spanEstado.style.color = '';
        } else {
            spanEstado.className = 'status-pending';
            spanEstado.textContent = '🕐 Pendiente';
            spanEstado.style.color = 'orange';
        }
    }
}

/**
 * Resetea el formulario al modo de creación.
 */
function resetearFormularioAModoCrear() {
    modoEdicion = false;
    tareaActualId = null;
    formularioTarea.reset();
    document.querySelector("#taskFormSection .card__title").textContent = "Nueva Tarea";
    document.getElementById("addTaskBtn").querySelector(".btn__text").textContent = "Agregar Tarea";
}

function mostrarError(mensaje) {
    errorIdUsuario.textContent = mensaje;
    notificarError(mensaje);
    ocultarSecciones();
}

function ocultarSecciones() {
    seccionInfoUsuario.classList.add("hidden");
    seccionFormularioTarea.classList.add("hidden");
    seccionListaTareas.classList.add("hidden");
    seccionFiltros.classList.add("hidden");

    contenedorInfoUsuario.innerHTML = "";
    contenedorTareas.innerHTML = "";
    contenedorFiltros.innerHTML = "";

    usuarioActual = null;
}