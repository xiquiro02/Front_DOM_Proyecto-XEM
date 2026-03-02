/**
 * Archivo Principal: script.js
 * Objetivo: Controlar la lógica de la aplicación, manejar eventos y conectar con la API y Servicios.
 */
import { buscarYMostrarUsuario, procesarCreacionTarea, procesarActualizacionTarea, procesarEliminacionTarea } from "./services/index.js";

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

// ==========================================
// VARIABLES DE ESTADO Y OBJETOS DEL DOM
// ==========================================
let usuarioActual = null; // Guarda el objeto del usuario logueado actualmente
let modoEdicion = false; // Bandera: true=editando tarea, false=creando tarea nueva
let tareaActualId = null; // Guarda el ID de la tarea que se está editando

// Funciones de utilidad y referencias DOM que necesitan los servicios
const domElements = {contenedorInfoUsuario,seccionInfoUsuario,seccionFormularioTarea,seccionListaTareas,errorIdUsuario,contenedorTareas,mostrarError,ocultarSecciones};

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

    // Delegamos la lógica al servicio
    usuarioActual = await buscarYMostrarUsuario(idUsuario, domElements);
});

// ==========================================
// EVENTO 2: AGREGAR NUEVA TAREA O EDITAR EXISTENTE
// ==========================================
formularioTarea.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // Verificamos que haya un usuario logueado antes de continuar
    if (usuarioActual === null) {
        return; // Si no hay usuario, no hacemos nada
    }

    // Extraemos los valores de los campos del formulario
    const titulo = document.getElementById("taskTitle").value;
    const descripcion = document.getElementById("taskBody").value;
    const estadoSeleccionado = document.getElementById("taskCompleted").value;

    // Convertimos el string del select a booleano
    let estaCompletada = (estadoSeleccionado === "true");

    // Validación: el título es obligatorio
    if (titulo === "") {
        alert("El título es obligatorio");
        return;
    }

    // VERIFICAMOS EN QUÉ MODO ESTAMOS (CREAR O EDITAR)
    if (modoEdicion) {
        // ==================== MODO EDICIÓN ====================
        const datosActualizados = {
            title: titulo,
            body: descripcion,
            completed: estaCompletada
        };

        const helpers = {
            actualizarTarjetaEnDOM,
            resetearFormularioAModoCrear
        };

        // Delegar lógica de actualización
        await procesarActualizacionTarea(tareaActualId, datosActualizados, helpers);

    } else {
        // ==================== MODO CREACIÓN ====================
        const nuevaTarea = {
            title: titulo,
            body: descripcion,
            completed: estaCompletada,
            userId: usuarioActual.id
        };

        // Delegar lógica de creación
        await procesarCreacionTarea(nuevaTarea, contenedorTareas, formularioTarea);
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
        await procesarEliminacionTarea(idTarea, tarjeta);
    }

    // -------- EDITAR --------
    if (evento.target.classList.contains("btn-editar-tarea")) {
        // PASO 1: Obtener referencia a la tarjeta completa donde se hizo clic
        const tarjeta = evento.target.closest(".message-card");

        // PASO 2: Extraer datos visuales actuales de la tarea
        const tituloActual = tarjeta.querySelector(".message-author").textContent;
        const descripcionActual = tarjeta.querySelector(".message-text").textContent;
        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending");
        const estadoActual = spanEstado.classList.contains("status-completed");

        const tareaActual = {
            id: idTarea,
            title: tituloActual,
            body: descripcionActual === 'Sin descripción disponible' ? '' : descripcionActual,
            completed: estadoActual
        };

        // Activar el modo edición
        modoEdicion = true;
        tareaActualId = idTarea;

        // Llenar el formulario con los datos extraídos
        llenarFormularioConTarea(tareaActual);

        // Hacer scroll suave hacia el formulario
        document.getElementById("taskFormSection").scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// FUNCIONES DE APOYO (HELPERS)
// ==========================================

/**
 * Llena el formulario con los datos de una tarea existente para editar
 */
function llenarFormularioConTarea(tarea) {
    document.getElementById("taskTitle").value = tarea.title;
    document.getElementById("taskBody").value = tarea.body || '';
    document.getElementById("taskCompleted").value = tarea.completed ? 'true' : 'false';
    document.querySelector("#taskFormSection .card__title").textContent = "Editar Tarea";
    document.getElementById("addTaskBtn").querySelector(".btn__text").textContent = "Actualizar Tarea";
}

/**
 * Actualiza una tarjeta específica en el DOM
 */
function actualizarTarjetaEnDOM(tareaId, tareaActualizada) {
    const tarjeta = document.querySelector(`[data-id="${tareaId}"]`).closest(".message-card");

    if (tarjeta) {
        tarjeta.querySelector(".message-author").textContent = tareaActualizada.title;
        const parrafoDescripcion = tarjeta.querySelector(".message-text");
        parrafoDescripcion.textContent = tareaActualizada.body || 'Sin descripción disponible';

        const spanEstado = tarjeta.querySelector(".status-completed, .status-pending");
        if (tareaActualizada.completed) {
            spanEstado.className = 'status-completed';
            spanEstado.textContent = 'Completada';
            spanEstado.style.color = 'green';
        } else {
            spanEstado.className = 'status-pending';
            spanEstado.textContent = 'Pendiente';
            spanEstado.style.color = 'orange';
        }
    }
}

/**
 * Resetea el formulario al modo de creación
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
    ocultarSecciones();
}

function ocultarSecciones() {
    seccionInfoUsuario.classList.add("hidden");
    seccionFormularioTarea.classList.add("hidden");
    seccionListaTareas.classList.add("hidden");

    contenedorInfoUsuario.innerHTML = "";
    contenedorTareas.innerHTML = "";

    usuarioActual = null;
}