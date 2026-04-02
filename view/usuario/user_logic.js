/**
 * Archivo: user_logic.js
 * Objetivo: Controlar qué se muestra en la pantalla del usuario.
 */

// Importamos las herramientas necesarias de otros archivos
import { cargarTareasDelUsuario, procesarActualizacionTarea, setFiltroEstado, obtenerTareasFiltradas, resetearFiltros, obtenerTodasLasTareas } from "../../services/index.js";
import { armarTareasUsuario, notificarExito, notificarError } from "../../ui/index.js";
import { BASE_URL } from "../../api/config.js";

// Variable para guardar el usuario actual tras la búsqueda
let usuarioActualId = null;

// Referencias para la búsqueda de usuario y la cabecera
const searchInput = document.getElementById("searchUserId");
const searchBtn = document.getElementById("btnSearchUser");
const searchError = document.getElementById("searchUserError");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeSubtitle = document.getElementById("welcomeSubtitle");
const userAvatar = document.getElementById("userAvatar");

// Guardamos en variables los lugares de la página que vamos a cambiar
const contenedorTareas = document.getElementById("task-container");
const filtroBotones = document.querySelectorAll(".filter-btn");

// Guardamos los lugares donde van los números de arriba (las estadísticas)
const statTotales = document.querySelector(".stats-grid .stat-card:nth-child(1) .stat-value");
const statProgreso = document.querySelector(".stats-grid .stat-card:nth-child(2) .stat-value");
const statCompletas = document.querySelector(".stats-grid .stat-card:nth-child(3) .stat-value");

/**
 * Esta función es la que dibuja la lista de tareas en la pantalla.
 */
function renderUserTasks() {
    // Obtenemos las tareas que cumplen con los filtros actuales
    const tareasFiltradas = obtenerTareasFiltradas();

    // Limpiamos lo que haya en el contenedor de tareas para empezar de cero
    contenedorTareas.replaceChildren();

    // Si no hay ninguna tarea para mostrar, creamos un mensaje amigable
    if (tareasFiltradas.length === 0) {
        // Creamos un div central
        const divMensaje = document.createElement('div');
        divMensaje.style.textAlign = 'center';
        divMensaje.style.padding = '40px';
        divMensaje.style.color = 'var(--color-text-tertiary)';

        // Creamos el icono de papel
        const icono = document.createElement('span');
        icono.style.fontSize = '40px';
        icono.style.display = 'block';
        icono.style.marginBottom = '10px';
        icono.textContent = '📄';

        // Creamos el texto del mensaje
        const texto = document.createElement('p');
        texto.textContent = 'No se encontraron tareas con este filtro.';

        // Metemos todo dentro del div y el div en la pantalla
        divMensaje.appendChild(icono);
        divMensaje.appendChild(texto);
        contenedorTareas.appendChild(divMensaje);
    } else {
        // Si sí hay tareas, usamos nuestra función para dibujarlas una por una
        armarTareasUsuario(contenedorTareas, tareasFiltradas, handleStatusChange);
    }

    // Al final, actualizamos los números de arriba
    actualizarEstadisticas();
}

/**
 * Función que suma las tareas y pone los resultados en los cuadros de arriba.
 */
function actualizarEstadisticas() {
    // Obtenemos la lista completa de todas las tareas del usuario
    const todas = obtenerTodasLasTareas();

    // Ponemos el total
    statTotales.textContent = todas.length;

    // Contamos cuántas están en proceso usando un filtro simple
    let contadorProgreso = 0;
    for (let i = 0; i < todas.length; i++) {
        if (todas[i].status === 'in-progress') {
            contadorProgreso = contadorProgreso + 1;
        }
    }
    statProgreso.textContent = contadorProgreso;

    // Contamos cuántas están hechas (completas)
    let contadorHechas = 0;
    for (let j = 0; j < todas.length; j++) {
        const t = todas[j];
        if (t.status === 'completed' || t.completed === true) {
            contadorHechas = contadorHechas + 1;
        }
    }
    statCompletas.textContent = contadorHechas;
}

/**
 * Esta función se encarga de guardar el nuevo estado de una tarea cuando haces clic.
 */
async function handleStatusChange(idTarea, nuevoEstado) {
    // Preparamos los datos que vamos a enviar a la API
    const datosActualizados = {
        status: nuevoEstado,
        // Si el estado es 'completed', marcamos la propiedad completed como verdadero
        completed: nuevoEstado === 'completed'
    };

    // Estas herramientas ayudan a que la pantalla se vuelva a dibujar sola
    const helpers = {
        actualizarTarjetaEnDOM: () => { }, // Función vacía porque vamos a redibujar todo
        resetearFormularioAModoCrear: () => { },
        renderFn: renderUserTasks // Le decimos que use nuestra función de renderizar
    };

    // Intentamos actualizar la información
    try {
        await procesarActualizacionTarea(idTarea, datosActualizados, helpers);
    } catch (error) {
        // Si algo sale mal, avisamos al usuario
        notificarError("Error al actualizar la tarea");
    }
}

/**
 * Esta función busca al usuario por ID y luego carga sus tareas.
 */
async function manejarBusquedaUsuario() {
    const nombreBuscado = searchInput.value.trim().toLowerCase();
    if (!nombreBuscado) {
        searchError.style.display = "block";
        searchError.textContent = "Ingrese un nombre válido.";
        return;
    }

    // Estado de carga inicial
    searchError.style.display = "none";
    welcomeTitle.textContent = "Buscando...";
    welcomeSubtitle.textContent = "Por favor espera.";
    contenedorTareas.replaceChildren();

    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.style.textAlign = 'center';
    pLoading.style.padding = '2rem';
    pLoading.style.color = '#6b7280';
    pLoading.textContent = 'Cargando...';

    contenedorTareas.appendChild(pLoading);

    console.log(`Buscando usuario por nombre: ${nombreBuscado}`);
    try {
        const respuesta = await fetch(`${BASE_URL}/usuarios`);
        if (!respuesta.ok) {
            console.warn(`Respuesta no OK buscando usuarios:`, respuesta.status);
            throw new Error("No se pudo conectar");
        }

        const json = await respuesta.json();
        const todosLosUsuarios = json.data;

        // Buscamos coincidencia en el nombre o en el nombre de usuario
        const usuarioEncontrado = todosLosUsuarios.find(u =>
            u.name.toLowerCase().includes(nombreBuscado) ||
            u.username.toLowerCase().includes(nombreBuscado)
        );

        if (!usuarioEncontrado) {
            throw new Error("No encontrado");
        }

        console.log("Datos recibidos del backend:", usuarioEncontrado);
        const usuario = usuarioEncontrado;
        usuarioActualId = usuario.id;

        // Actualizamos cabecera dinámica
        welcomeTitle.textContent = `¡Hola, ${usuario.name.split(' ')[0]}! 👋`;
        welcomeSubtitle.textContent = `Aquí tienes un resumen de tus cosas, ${usuario.username}.`;
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.name)}&background=4f46e5&color=fff`;

        // Limpiamos los filtros y marcamos el primero ("Todas") como activo
        resetearFiltros();
        filtroBotones.forEach(b => b.classList.remove("active"));
        if (filtroBotones[0]) filtroBotones[0].classList.add("active");

        // Cargamos las tareas dinámicamente
        await cargarTareasDelUsuario(usuarioActualId, contenedorTareas, renderUserTasks);

    } catch (error) {
        console.error("Error en manejarBusquedaUsuario:", error);
        searchError.style.display = "block";
        searchError.textContent = `Error: ${error.message === 'No encontrado' ? 'Usuario no encontrado' : 'Error de conexión con el servidor'}`;
        welcomeTitle.textContent = "¡Hola, Usuario! 👋";
        welcomeSubtitle.textContent = "Busca tu nombre para ver tus tareas.";
        contenedorTareas.replaceChildren(); // Limpiamos las tareas

        statTotales.textContent = "0";
        statProgreso.textContent = "0";
        statCompletas.textContent = "0";
    }
}

/**
 * Función que arranca todo cuando abres la página.
 */
async function init() {
    console.log("Cargando el panel del usuario...");

    // Configuramos los eventos de búsqueda
    searchBtn.addEventListener("click", manejarBusquedaUsuario);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") manejarBusquedaUsuario();
    });

    // Limpiamos la pantalla inicial
    contenedorTareas.replaceChildren();
    const pInit = document.createElement('p');
    pInit.className = 'loading-text';
    pInit.style.textAlign = 'center';
    pInit.style.padding = '2rem';
    pInit.style.color = '#6b7280';
    pInit.textContent = 'Busca tu nombre de usuario en el panel izquierdo.';
    contenedorTareas.appendChild(pInit);

    // Configuramos qué pasa cuando haces clic en los botones de "Pendientes", "Hechas", etc.
    filtroBotones.forEach(btn => {
        btn.addEventListener("click", () => {
            // Quitamos la marca azul a todos los botones
            filtroBotones.forEach(b => b.classList.remove("active"));
            // Ponemos la marca azul solo al botón que presionamos
            btn.classList.add("active");

            // Le decimos al sistema qué filtro aplicar (el nombre guardado en data-filter)
            const filtroElegido = btn.getAttribute("data-filter");
            setFiltroEstado(filtroElegido);

            // Volvemos a dibujar las tareas solo con ese filtro
            renderUserTasks();
        });
    });
}

// Llamamos a nuestra función 'init' cuando la página termine de cargarse
document.addEventListener("DOMContentLoaded", init);
