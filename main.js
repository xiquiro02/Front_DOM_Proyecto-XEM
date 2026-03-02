/**
 * Archivo Principal: script.js
 * Objetivo: Controlar la lógica de la aplicación, manejar eventos y conectar con la API.
 */
import { armarUsuario, armarTareas } from "./components/index.js";
import { getUserById, getTareasByUserId, createTarea } from "./api/index.js";

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
// VARIABLES DE ESTADO
// ==========================================
let usuarioActual = null;

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

    try {
        // Uso del USE-CASE para obtener el usuario
        usuarioActual = await getUserById(idUsuario);

        // --- MANIPULACIÓN DEL DOM ---
        armarUsuario(contenedorInfoUsuario, usuarioActual);

        seccionInfoUsuario.classList.remove("hidden");
        seccionFormularioTarea.classList.remove("hidden");
        seccionListaTareas.classList.remove("hidden");

        errorIdUsuario.textContent = "";

        // Cargar las tareas usando otro USE-CASE
        cargarTareasDelUsuario(idUsuario);

    } catch (error) {
        console.error(error);
        mostrarError("Usuario no encontrado en el sistema");
        ocultarSecciones();
    }
});

// ==========================================
// EVENTO 2: AGREGAR NUEVA TAREA
// ==========================================
formularioTarea.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (usuarioActual === null) {
        return;
    }

    const titulo = document.getElementById("taskTitle").value;
    const descripcion = document.getElementById("taskBody").value;
    const estadoSeleccionado = document.getElementById("taskCompleted").value;

    let estaCompletada = (estadoSeleccionado === "true");

    if (titulo === "") {
        alert("El título es obligatorio");
        return;
    }

    const nuevaTarea = {
        title: titulo,
        body: descripcion,
        completed: estaCompletada,
        userId: usuarioActual.id
    };

    try {
        // Uso del USE-CASE para crear la tarea
        const tareaCreada = await createTarea(nuevaTarea);
        console.log("Tarea creada con éxito (simulado):", tareaCreada);

        // Actualizamos la interfaz
        const listaParaAgregar = [tareaCreada];
        armarTareas(contenedorTareas, listaParaAgregar);

        formularioTarea.reset();

    } catch (error) {
        console.error("Error al crear tarea:", error);
        alert("Hubo un error al guardar la tarea");
    }
});

// ==========================================
// FUNCIÓN 3: CARGAR TAREAS EXISTENTES
// ==========================================
async function cargarTareasDelUsuario(idUsuario) {
    contenedorTareas.innerHTML = '';
    try {
        // Uso del USE-CASE para traer las tareas
        const primerasTareas = await getTareasByUserId(idUsuario);
        armarTareas(contenedorTareas, primerasTareas);
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// ==========================================
// FUNCIONES DE APOYO (HELPERS)
// ==========================================

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
