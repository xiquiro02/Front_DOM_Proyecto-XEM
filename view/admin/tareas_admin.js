/**
 * Lógica para la vista Global de Tareas del Administrador
 */
// Importaciones de la API para operaciones CRUD sobre las tareas del sistema
import { getAllTareas, createTarea, deleteTarea, updateTarea, updateTareaStatus } from '../../api/index.js';
// Importación específica para obtener el listado de todos los usuarios registrados
import { getAllUsers } from '../../api/usuarios/getAllUsers.js';
// Importaciones de componentes de UI para renderizado, avisos y confirmaciones visuales
import { armarTareas, notificarExito, notificarError, mostrarConfirmacion } from '../../ui/index.js';

// Referencias a los elementos del DOM para la gestión de tareas
// Contenedor principal donde se inyectará el listado de tareas globales
const tasksContainer = document.getElementById('tasksContainer');
// Botón para iniciar el proceso de carga de tareas desde el servidor
const btnLoadTasks = document.getElementById('loadTasksBtn');
// Indicador visual que muestra el número total de tareas filtradas
const badgeStatus = document.getElementById('totalTasksBadge');
// Barra de búsqueda de texto para filtrar tareas por título
const searchTask = document.getElementById('searchTask');
// Selector desplegable para filtrar tareas por el usuario asignado
const filterUserSelect = document.getElementById('filterUserSelect');
// Contenedor para la lista de selección múltiple de usuarios al crear tareas
const usersChecklistContainer = document.getElementById('usersChecklistContainer');
// Formulario de entrada para la creación o edición de tareas
const taskForm = document.getElementById('taskForm');
// Campo de texto para el título descriptivo de la tarea
const taskTitle = document.getElementById('taskTitle');
// Área de texto para la descripción detallada de la actividad
const taskDescription = document.getElementById('taskDescription');

// Estado local del módulo de tareas
// Almacena el listado original de todas las tareas recuperadas del servidor
let todasLasTareas = [];
// Almacena el listado de todos los usuarios para alimentar los selectores
let todosLosUsuarios = [];
// Variable centinela para gestionar el modo de edición por ID
let editandoId = null; // Para saber si estamos editando

/**
 * Función de arranque que inicializa los datos y configura los escuchadores de eventos
 */
async function init() {
    // Cargar usuarios para los filtros y checkboxes de asignación
    try {
        // Solicita el listado completo de usuarios a la API
        todosLosUsuarios = await getAllUsers();
        // Genera la lista de selección múltiple para el formulario de tareas
        renderUserCheckboxes(todosLosUsuarios);
        // Pobla el selector de filtrado superior con los usuarios disponibles
        renderUserDropdown(todosLosUsuarios);
    } catch (error) {
        // Manejo de errores en caso de fallo en la carga de usuarios
        console.error("Error al cargar usuarios", error);
        // Limpia el contenedor y muestra un mensaje de advertencia visual
        usersChecklistContainer.replaceChildren();
        const pError = document.createElement('p');
        pError.className = 'loading-text';
        pError.textContent = 'Error al cargar usuarios.';
        usersChecklistContainer.appendChild(pError);
    }

    // Configura los eventos de interacción del administrador
    // Vincular la carga de tareas al botón correspondiente
    btnLoadTasks.addEventListener('click', loadAndRenderTasks);
    // Activa el filtrado instantáneo al escribir en la barra de búsqueda
    searchTask.addEventListener('input', applyFilters);
    // Activa el filtrado por usuario al cambiar la opción seleccionada
    filterUserSelect.addEventListener('change', applyFilters);

    // Manejador del envío del formulario de tareas (Creación/Edición)
    taskForm.addEventListener('submit', handleSubmitTask);

    // Delegación de eventos para capturar acciones en la lista dinámica (editar/eliminar)
    tasksContainer.addEventListener('click', handleTaskAction);
}

/**
 * Genera dinámicamente los elementos checkbox para cada usuario disponible
 */
function renderUserCheckboxes(usuarios) {
    // Si no existen usuarios registrados, muestra un mensaje informativo
    if (usuarios.length === 0) {
        usersChecklistContainer.replaceChildren();
        const pNoUsers = document.createElement('p');
        pNoUsers.className = 'loading-text';
        pNoUsers.textContent = 'No hay usuarios disponibles.';
        usersChecklistContainer.appendChild(pNoUsers);
        return;
    }

    // Limpia el contenedor antes de inyectar las nuevas opciones
    usersChecklistContainer.replaceChildren();
    // Itera sobre el array de usuarios para construir cada fila de selección
    usuarios.forEach(u => {
        // Etiqueta contenedora para mejorar el área de clic
        const label = document.createElement('label');
        // Control de selección de tipo checkbox
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'assignedUsers';
        input.value = u.id;

        // Texto informativo con el nombre y nickname del usuario
        const texto = document.createTextNode(` ${u.name} (@${u.username})`);

        // Ensambla el control y el texto dentro de la etiqueta
        label.appendChild(input);
        label.appendChild(texto);
        // Agrega la fila al contenedor visual de la UI
        usersChecklistContainer.appendChild(label);
    });
}

/**
 * Rellena el selector desplegable de filtrado con los nombres de usuario
 */
function renderUserDropdown(usuarios) {
    // Itera para crear cada opción del selector de búsqueda (hace lo mismo que el bucle anterior pero para select)
    usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name} (@${u.username})`;
        // Inyecta la opción en el elemento select del DOM
        filterUserSelect.appendChild(opt);
    });
}

/**
 * Solicita las tareas al servidor y orquestador su visualización
 */
async function loadAndRenderTasks() {
    // Prepara el contenedor con un indicador de estado de carga
    tasksContainer.replaceChildren();
    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.textContent = 'Cargando tareas...';
    tasksContainer.appendChild(pLoading);
    try {
        // Recupera el universo completo de tareas del sistema
        todasLasTareas = await getAllTareas();
        // Ejecuta el motor de filtrado para mostrar los resultados actuales
        applyFilters();
    } catch (e) {
        // Notifica el fallo al administrador mediante una alerta visual
        notificarError("No se pudieron cargar las tareas globales");
        // Limpia el estado de carga y muestra el mensaje de error persistente (hace lo mismo)
        tasksContainer.replaceChildren();
        const pError = document.createElement('p');
        pError.className = 'loading-text';
        pError.style.color = 'var(--color-danger)';
        pError.textContent = 'Error al cargar.';
        tasksContainer.appendChild(pError);
    }
}

/**
 * Filtra el listado de tareas en baso a los criterios de búsqueda y usuario
 */
function applyFilters() {
    // Normaliza el texto de búsqueda para comparaciones seguras
    const searchVal = searchTask.value.toLowerCase();
    // Obtiene el identificador del usuario seleccionado en el filtro
    const userIdVal = filterUserSelect.value;

    // Aplica el filtro por título sobre la colección completa
    let filtradas = todasLasTareas.filter(t => t.title.toLowerCase().includes(searchVal));

    // Si hay un usuario seleccionado, aplica un segundo nivel de filtrado
    if (userIdVal) {
        filtradas = filtradas.filter(t =>
            // Verifica que la tarea tenga usuarios asignados y coincida con el ID buscado
            Array.isArray(t.usuarios) && t.usuarios.some(u => String(u.id) === String(userIdVal))
        );
    }

    // Actualiza el indicador visual de resultados encontrados
    badgeStatus.textContent = `${filtradas.length} tareas`;

    // Gestiona la vista según el número de coincidencias halladas
    if (filtradas.length === 0) {
        // Limpia el área y muestra un aviso de búsqueda fallida
        tasksContainer.replaceChildren();
        const pNoTasks = document.createElement('p');
        pNoTasks.className = 'loading-text';
        pNoTasks.textContent = 'No se encontraron tareas con estos filtros.';
        tasksContainer.appendChild(pNoTasks);
    } else {
        // Limpia el contenedor y delega el renderizado de tarjetas a la capa UI (hace lo mismo que en main.js)
        tasksContainer.replaceChildren(); // Limpiar
        armarTareas(tasksContainer, filtradas, handleStatusChange);
    }
}

/**
 * Controla el proceso de guardado (Crear o Actualizar) de una tarea
 */
async function handleSubmitTask(e) {
    // Evita el comportamiento predeterminado de envío del navegador
    e.preventDefault();
    // Obtiene y valida el contenido del título
    const titulo = taskTitle.value.trim();
    if (!titulo) return notificarError("El título es obligatorio");
    // Obtiene el cuerpo opcional de la tarea
    const descripcion = taskDescription.value.trim();

    // Recopila los identificadores de los usuarios seleccionados en los checkboxes
    const checkedBoxes = document.querySelectorAll('input[name="assignedUsers"]:checked');
    const assignedUserIds = Array.from(checkedBoxes).map(cb => cb.value);

    // Validación: Al menos un destinatario debe ser elegido
    if (assignedUserIds.length === 0) {
        return notificarError("Debe seleccionar al menos un usuario.");
    }

    // Alterna la lógica según si estamos editando o registrando una nueva tarea
    if (editandoId) {
        // --------- MODO EDICION ---------
        try {
            // Prepara el paquete de datos para la actualización parcial
            const datosActualizados = {
                title: titulo,
                body: descripcion,
                userIds: assignedUserIds.map(Number)
            };
            // Envía la petición de modificación a la API
            const respondida = await updateTarea(editandoId, datosActualizados);

            // Sincroniza la respuesta del servidor en el listado local de tareas
            const idx = todasLasTareas.findIndex(t => String(t.id) === String(editandoId));
            if (idx !== -1) {
                // Fusiona los datos antiguos con los nuevos valores confirmados
                todasLasTareas[idx] = { ...todasLasTareas[idx], ...respondida };
            }

            // Limpia la interfaz y refresca la lista visualmente
            resetForm();
            applyFilters();
            notificarExito("Tarea actualizada correctamente");
        } catch (err) {
            // Notifica fallos de red o de validación del servidor
            notificarError("Error al actualizar tarea");
        }
    } else {
        // --------- MODO CREACION ---------
        // Define los parámetros iniciales para el nuevo registro de tarea
        const newTaskParams = {
            title: titulo,
            body: descripcion,
            completed: false,
            status: 'pending',
            userIds: assignedUserIds.map(Number)
        };

        try {
            // Crea la nueva tarea y añade metadatos complementarios a la respuesta
            const created = await createTarea(newTaskParams);
            created.assignedUsers = assignedUserIds;
            created.status = 'pending';
            // Inserta el nuevo registro al inicio de la colección local
            todasLasTareas.unshift(created);
            // Actualiza la pantalla, limpia el formulario y avisa del éxito (hace lo mismo)
            applyFilters();
            resetForm();
            notificarExito("Tarea global creada");
        } catch (err) {
            // Notifica errores críticos durante la fase de creación
            notificarError("Error creando tarea global");
        }
    }
}

/**
 * Restaura el formulario a su estado virginal de creación
 */
function resetForm() {
    // Vacía todos los campos nativos del formulario
    taskForm.reset();
    // Elimina el rastreo del ID de edición
    editandoId = null;
    // Limpia explícitamente los campos de texto
    taskTitle.value = "";
    taskDescription.value = "";
    // Restaura la etiqueta del botón de confirmación
    taskForm.querySelector('button[type="submit"]').textContent = "Crear Tarea";
    // Desmarca todos los checks de selección de usuarios (hace lo mismo que en el búcle de checkboxes)
    document.querySelectorAll('input[name="assignedUsers"]').forEach(cb => cb.checked = false);
}

/**
 * Procesa los cambios de estado (Pendiente/Proceso/Hecho) solicitados desde las tarjetas
 */
async function handleStatusChange(idTarea, nuevoEstado) {
    try {
        // Localiza la tarea objetivo en la base de datos local
        const idx = todasLasTareas.findIndex(t => String(t.id) === String(idTarea));
        if (idx !== -1) {
            const tareaExistente = todasLasTareas[idx];
            // Construye el objeto de actualización con el nuevo estado lógico
            const datosParaActualizar = {
                ...tareaExistente,
                status: nuevoEstado,
                completed: (nuevoEstado === 'completed')
            };
            // Sincroniza el cambio con el servidor
            const respondida = await updateTarea(idTarea, datosParaActualizar);

            // Sustituye los datos locales por la versión definitiva del backend
            todasLasTareas[idx] = respondida;
            // Refresca la interfaz de usuario para reflejar el cambio (hace lo mismo)
            applyFilters();
            notificarExito("Estado actualizado");
        }
    } catch (e) {
        // Notifica errores si la actualización del estado falla
        notificarError("Error al actualizar estado");
    }
}

/**
 * Orquestador de acciones críticas disparadas desde el listado de tareas
 */
async function handleTaskAction(e) {
    // Obtiene el identificador de la tarea vinculada al elemento clicado
    const id = e.target.getAttribute('data-id');
    // Aborta si se hizo clic fuera de los controles interactivos de tarea
    if (!id) return;

    // Lógica para la eliminación confirmada de tareas
    if (e.target.classList.contains('btn-eliminar-tarea')) {
        // Solicita confirmación explícita al administrador mediante un modal
        const conf = await mostrarConfirmacion("¿Eliminar tarea globalmente?");
        // Aborta la operación si el usuario cancela el diálogo
        if (!conf) return;
        try {
            // Petición de borrado físico a la API
            const success = await deleteTarea(id);
            if (success) {
                // Remueve la tarea del listado local tras confirmar la baja en el servidor
                todasLasTareas = todasLasTareas.filter(t => String(t.id) !== String(id));
                // Refresca la vista y notifica al usuario (hace lo mismo)
                applyFilters();
                notificarExito("Tarea eliminada");
            } else {
                notificarError("Error al eliminar (Server err)");
            }
        } catch (err) {
            // Gestión de errores de red en el proceso de baja
            notificarError("Error al eliminar tarea");
        }
    // Lógica para preparar la interfaz en modo edición
    } else if (e.target.classList.contains('btn-editar-tarea')) {
        // Transfiere los datos de la tarea al formulario administrativo
        prepararEdicion(id);
    }
}

/**
 * Carga los datos de una tarea específica en los controles del formulario
 */
function prepararEdicion(id) {
    // Busca la información completa en el estado local del módulo
    const tarea = todasLasTareas.find(t => String(t.id) === String(id));
    if (!tarea) return;

    // Configura el ID de edición y rellena los campos de texto básicos
    editandoId = id;
    taskTitle.value = tarea.title;
    taskDescription.value = tarea.body || "";

    // Mapea los usuarios asignados para marcar los checkboxes correspondientes
    const idsAsignados = Array.isArray(tarea.usuarios)
        ? tarea.usuarios.map(u => String(u.id))
        : [];
    // Itera sobre la lista de checks del DOM para sincronizar su estado visual (hace lo mismo que en resetForm pero para marcar)
    document.querySelectorAll('input[name="assignedUsers"]').forEach(cb => {
        cb.checked = idsAsignados.includes(String(cb.value));
    });

    // Actualiza la visualización del botón y el foco del administrador
    taskForm.querySelector('button[type="submit"]').textContent = "Actualizar Tarea";
    taskTitle.focus();
    // Posiciona la pantalla suavemente en el área del formulario (hace lo mismo que en main.js)
    taskForm.scrollIntoView({ behavior: 'smooth' });
}

// Inicia el ciclo de vida del módulo una vez que el documento está listo
document.addEventListener('DOMContentLoaded', init);
