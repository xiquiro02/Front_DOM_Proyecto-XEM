/**
 * Archivo: user_logic.js
 * Objetivo: Controlar qué se muestra en la pantalla del usuario.
 */

// Importamos las herramientas necesarias de otros archivos para gestionar tareas y filtros
import { cargarTareasDelUsuario, procesarActualizacionTarea, setFiltroEstado, obtenerTareasFiltradas, resetearFiltros, obtenerTodasLasTareas } from "../../services/index.js";
// Importamos funciones de interfaz para dibujar las tareas y mostrar avisos de éxito o error
import { armarTareasUsuario, notificarExito, notificarError } from "../../ui/index.js";
// Importamos la dirección base para las peticiones al servidor
import { BASE_URL } from "../../api/config.js";

// Variable para guardar el identificador del usuario que ha iniciado sesión tras la búsqueda
let usuarioActualId = null;

// Referencias para la búsqueda de usuario y la cabecera dinámica
// Cuadro de texto donde el usuario escribe su nombre
const searchInput = document.getElementById("searchUserId");
// Botón que dispara el proceso de búsqueda en el servidor
const searchBtn = document.getElementById("btnSearchUser");
// Etiqueta para mostrar mensajes de error cuando no se encuentra un usuario
const searchError = document.getElementById("searchUserError");
// Título de bienvenida que muestra el nombre del usuario
const welcomeTitle = document.getElementById("welcomeTitle");
// Subtítulo que muestra el nombre de usuario del sistema
const welcomeSubtitle = document.getElementById("welcomeSubtitle");
// Elemento imagen para mostrar el avatar generado del usuario
const userAvatar = document.getElementById("userAvatar");

// Guardamos en variables los lugares de la página que vamos a cambiar dinámicamente
// Espacio principal donde se apilarán las tarjetas de tareas
const contenedorTareas = document.getElementById("task-container");
// Colección de botones de filtrado lateral (Pendientes, En Proceso, Completadas)
const filtroBotones = document.querySelectorAll(".filter-btn");

// Guardamos los lugares donde van los números indicadores en la parte superior (estadísticas)
// Valor numérico para el total de tareas asignadas
const statTotales = document.querySelector(".stats-grid .stat-card:nth-child(1) .stat-value");
// Valor numérico para las tareas que están siendo ejecutadas
const statProgreso = document.querySelector(".stats-grid .stat-card:nth-child(2) .stat-value");
// Valor numérico para las tareas finalizadas con éxito
const statCompletas = document.querySelector(".stats-grid .stat-card:nth-child(3) .stat-value");

/**
 * Esta función es la que dibuja la lista de tareas en la pantalla del usuario.
 */
function renderUserTasks() {
    // Obtenemos las tareas que cumplen con los criterios de filtrado seleccionados
    const tareasFiltradas = obtenerTareasFiltradas();

    // Limpiamos lo que haya en el contenedor de tareas para empezar desde una base limpia
    contenedorTareas.replaceChildren();

    // Si no hay ninguna tarea para mostrar tras aplicar el filtro, creamos un mensaje amigable
    if (tareasFiltradas.length === 0) {
        // Creamos un contenedor central para el mensaje de "No hay resultados"
        const divMensaje = document.createElement('div');
        divMensaje.style.textAlign = 'center';
        divMensaje.style.padding = '40px';
        divMensaje.style.color = 'var(--color-text-tertiary)';

        // Creamos el elemento visual del icono decorativo
        const icono = document.createElement('span');
        icono.style.fontSize = '40px';
        icono.style.display = 'block';
        icono.style.marginBottom = '10px';
        icono.textContent = '📄';

        // Creamos la descripción textual de la ausencia de tareas
        const texto = document.createElement('p');
        texto.textContent = 'No se encontraron tareas con este filtro.';

        // Ensamblamos la estructura del mensaje y la inyectamos en el centro de la pantalla
        divMensaje.appendChild(icono);
        divMensaje.appendChild(texto);
        contenedorTareas.appendChild(divMensaje);
    } else {
        // Si existen tareas, invocamos el constructor de UI para pintarlas con sus acciones
        armarTareasUsuario(contenedorTareas, tareasFiltradas, handleStatusChange);
    }

    // Al finalizar el renderizado, recalculamos las estadísticas superiores
    actualizarEstadisticas();
}

/**
 * Función que suma las tareas y pone los resultados en los cuadros de mando de arriba.
 */
function actualizarEstadisticas() {
    // Obtenemos la lista íntegra de todas las tareas vinculadas al usuario
    const todas = obtenerTodasLasTareas();

    // Actualiza el indicador visual con el número total de registros
    statTotales.textContent = todas.length;

    // Inicializa el contador para las tareas que están en ejecución
    let contadorProgreso = 0;
    // Bucle para recorrer la colección (hace lo mismo que un filter pero manual)
    for (let i = 0; i < todas.length; i++) {
        // Comprueba si el estado coincide exactamente con "en progreso"
        if (todas[i].status === 'in-progress') {
            // Incrementa el contador acumulativo
            contadorProgreso = contadorProgreso + 1;
        }
    }
    // Muestra el resultado final en el cuadro correspondiente de la UI
    statProgreso.textContent = contadorProgreso;

    // Inicializa el contador para las tareas concluidas
    let contadorHechas = 0;
    // Bucle para procesar las tareas completadas (hace lo mismo que el bucle anterior con otra condición)
    for (let j = 0; j < todas.length; j++) {
        const t = todas[j];
        // Comprueba si el estado es completado o si la bandera booleana es verdadera
        if (t.status === 'completed' || t.completed === true) {
            // Incrementa el acumulador de tareas terminadas
            contadorHechas = contadorHechas + 1;
        }
    }
    // Refleja el total de tareas finalizadas en el panel estadístico
    statCompletas.textContent = contadorHechas;
}

/**
 * Esta función se encarga de guardar el nuevo estado de una tarea cuando el usuario interactúa.
 */
async function handleStatusChange(idTarea, nuevoEstado) {
    // Preparamos el objeto de datos para la sincronización con el servidor remoto
    const datosActualizados = {
        status: nuevoEstado,
        // Marca la propiedad lógica según el estado seleccionado (hace lo mismo que en tareas_admin.js)
        completed: nuevoEstado === 'completed'
    };

    // Configuramos los disparadores de respuesta automática para la interfaz
    const helpers = {
        actualizarTarjetaEnDOM: () => { }, // No es necesaria aquí porque redibujamos todo el bloque
        resetearFormularioAModoCrear: () => { }, // No aplicable en la vista simplificada del usuario
        renderFn: renderUserTasks // Función que se ejecutará tras el éxito de la actualización
    };

    // Intenta realizar la comunicación con el servicio de backend
    try {
        await procesarActualizacionTarea(idTarea, datosActualizados, helpers);
    } catch (error) {
        // En caso de fallo técnico, dispara una notificación de error visual
        notificarError("Error al actualizar la tarea");
    }
}

/**
 * Esta función busca al usuario por nombre/apodo y activa su sesión visual de tareas.
 */
async function manejarBusquedaUsuario() {
    // Captura y limpia el texto ingresado por el usuario en el buscador
    const nombreBuscado = searchInput.value.trim().toLowerCase();
    // Validación de entrada para evitar búsquedas vacías
    if (!nombreBuscado) {
        searchError.style.display = "block";
        searchError.textContent = "Ingrese un nombre válido.";
        return;
    }

    // Configura el estado visual de "Cargando" para dar feedback al usuario
    searchError.style.display = "none";
    welcomeTitle.textContent = "Buscando...";
    welcomeSubtitle.textContent = "Por favor espera.";
    // Limpia el visor de tareas previo
    contenedorTareas.replaceChildren();

    // Crea un indicador de carga textual y lo inyecta en el contenedor principal
    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.style.textAlign = 'center';
    pLoading.style.padding = '2rem';
    pLoading.style.color = '#6b7280';
    pLoading.textContent = 'Cargando...';

    contenedorTareas.appendChild(pLoading);

    // Registro del intento de búsqueda para depuración
    console.log(`Buscando usuario por nombre: ${nombreBuscado}`);
    try {
        // Llama a la API general de usuarios para encontrar el perfil
        const respuesta = await fetch(`${BASE_URL}/usuarios`);
        // Verifica si la comunicación con el servidor fue exitosa
        if (!respuesta.ok) {
            console.warn(`Respuesta no OK buscando usuarios:`, respuesta.status);
            throw new Error("No se pudo conectar");
        }

        // Procesa la respuesta JSON y extrae la colección de usuarios
        const json = await respuesta.json();
        const todosLosUsuarios = json.data;

        // Implementa lógica de búsqueda flexible por nombre real o apodo
        const usuarioEncontrado = todosLosUsuarios.find(u =>
            u.name.toLowerCase().includes(nombreBuscado) ||
            u.username.toLowerCase().includes(nombreBuscado)
        );

        // Si no se halla ninguna coincidencia, interrumpe el flujo con un error específico
        if (!usuarioEncontrado) {
            throw new Error("No encontrado");
        }

        // Confirma los datos del usuario localizado en consola
        console.log("Datos recibidos del backend:", usuarioEncontrado);
        const usuario = usuarioEncontrado;
        // Establece el ID global del usuario para el resto de peticiones de la sesión
        usuarioActualId = usuario.id;

        // Personaliza la cabecera con el primer nombre y el alias del usuario
        welcomeTitle.textContent = `¡Hola, ${usuario.name.split(' ')[0]}! 👋`;
        welcomeSubtitle.textContent = `Aquí tienes un resumen de tus cosas, ${usuario.username}.`;
        // Genera un avatar dinámico basado en las iniciales del nombre real
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.name)}&background=4f46e5&color=fff`;

        // Restablece el sistema de filtrado a su estado inicial de fábrica
        resetearFiltros();
        // Limpia la marca visual de selección de todos los botones de filtro lateral
        filtroBotones.forEach(b => b.classList.remove("active"));
        // Marca el primer botón ("Todas") como el filtro activo por defecto (hace lo mismo que en init)
        if (filtroBotones[0]) filtroBotones[0].classList.add("active");

        // Dispara la carga asíncrona de las tareas específicas para este usuario
        await cargarTareasDelUsuario(usuarioActualId, contenedorTareas, renderUserTasks);

    } catch (error) {
        // Captura y gestiona cualquier error ocurrido durante la búsqueda o carga
        console.error("Error en manejarBusquedaUsuario:", error);
        // Activa el mensaje de error visual y lo personaliza según la causa (hace lo mismo)
        searchError.style.display = "block";
        searchError.textContent = `Error: ${error.message === 'No encontrado' ? 'Usuario no encontrado' : 'Error de conexión con el servidor'}`;
        // Restaura los textos de bienvenida genéricos
        welcomeTitle.textContent = "¡Hola, Usuario! 👋";
        welcomeSubtitle.textContent = "Busca tu nombre para ver tus tareas.";
        // Vacia el contenedor de tareas para evitar inconsistencias visuales
        contenedorTareas.replaceChildren(); 

        // Resetea los indicadores estadísticos a cero (hace lo mismo que en actualizarEstadisticas pero para error)
        statTotales.textContent = "0";
        statProgreso.textContent = "0";
        statCompletas.textContent = "0";
    }
}

/**
 * Función que arranca las configuraciones iniciales al cargar la página por primera vez.
 */
async function init() {
    // Aviso de inicio de carga del panel en la consola del navegador
    console.log("Cargando el panel del usuario...");

    // Registra los disparadores de búsqueda tanto por clic como por tecla Enter
    searchBtn.addEventListener("click", manejarBusquedaUsuario);
    searchInput.addEventListener("keypress", (e) => {
        // Comprueba si la tecla pulsada es el retorno de carro
        if (e.key === "Enter") manejarBusquedaUsuario();
    });

    // Inyecta un mensaje de bienvenida instructivo en el centro de la pantalla
    contenedorTareas.replaceChildren();
    const pInit = document.createElement('p');
    pInit.className = 'loading-text';
    pInit.style.textAlign = 'center';
    pInit.style.padding = '2rem';
    pInit.style.color = '#6b7280';
    pInit.textContent = 'Busca tu nombre de usuario en el panel izquierdo.';
    contenedorTareas.appendChild(pInit);

    // Configura la lógica interactiva para los botones del panel de filtrado lateral
    filtroBotones.forEach(btn => {
        // Escucha clics individuales en cada botón de categoría (Pendientes, Hechas, etc)
        btn.addEventListener("click", () => {
            // Elimina la decoración de "activo" de todos los hermanos (hace lo mismo que en manejarBusquedaUsuario)
            filtroBotones.forEach(b => b.classList.remove("active"));
            // Aplica el estilo destacado al botón que recibió el clic
            btn.classList.add("active");

            // Recupera el identificador de estado guardado en el atributo personalizado del botón
            const filtroElegido = btn.getAttribute("data-filter");
            // Ordena al servicio de filtrado cambiar el estado de visualización global
            setFiltroEstado(filtroElegido);

            // Redibuja las tareas en pantalla aplicando inmediatamente el nuevo filtro
            renderUserTasks();
        });
    });
}

// Vincula la ejecución de la lógica de arranque al evento de finalización de carga del DOM
document.addEventListener("DOMContentLoaded", init);
