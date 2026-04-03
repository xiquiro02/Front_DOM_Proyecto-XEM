/**
 * Lógica para la vista Global de Tareas del Administrador
 */
import { getAllTareas, createTarea, deleteTarea, updateTarea, updateTareaStatus } from '../../api/index.js';
import { getAllUsers } from '../../api/usuarios/getAllUsers.js';
import { armarTareas, notificarExito, notificarError, mostrarConfirmacion } from '../../ui/index.js';

const tasksContainer = document.getElementById('tasksContainer');
const btnLoadTasks = document.getElementById('loadTasksBtn');
const badgeStatus = document.getElementById('totalTasksBadge');
const searchTask = document.getElementById('searchTask');
const filterUserSelect = document.getElementById('filterUserSelect');
const usersChecklistContainer = document.getElementById('usersChecklistContainer');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');

let todasLasTareas = [];
let todosLosUsuarios = [];
let editandoId = null; // Para saber si estamos editando

async function init() {
    // Cargar usuarios para los filtros y checkboxes
    try {
        todosLosUsuarios = await getAllUsers();
        renderUserCheckboxes(todosLosUsuarios);
        renderUserDropdown(todosLosUsuarios);
    } catch (error) {
        console.error("Error al cargar usuarios", error);
        usersChecklistContainer.replaceChildren();
        const pError = document.createElement('p');
        pError.className = 'loading-text';
        pError.textContent = 'Error al cargar usuarios.';
        usersChecklistContainer.appendChild(pError);
    }

    btnLoadTasks.addEventListener('click', loadAndRenderTasks);
    searchTask.addEventListener('input', applyFilters);
    filterUserSelect.addEventListener('change', applyFilters);

    taskForm.addEventListener('submit', handleSubmitTask);

    tasksContainer.addEventListener('click', handleTaskAction);
}

function renderUserCheckboxes(usuarios) {
    if (usuarios.length === 0) {
        usersChecklistContainer.replaceChildren();
        const pNoUsers = document.createElement('p');
        pNoUsers.className = 'loading-text';
        pNoUsers.textContent = 'No hay usuarios disponibles.';
        usersChecklistContainer.appendChild(pNoUsers);
        return;
    }

    usersChecklistContainer.replaceChildren();
    usuarios.forEach(u => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'assignedUsers';
        input.value = u.id;

        const texto = document.createTextNode(` ${u.name} (@${u.username})`);

        label.appendChild(input);
        label.appendChild(texto);
        usersChecklistContainer.appendChild(label);
    });
}

function renderUserDropdown(usuarios) {
    usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name} (@${u.username})`;
        filterUserSelect.appendChild(opt);
    });
}

async function loadAndRenderTasks() {
    tasksContainer.replaceChildren();
    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.textContent = 'Cargando tareas...';
    tasksContainer.appendChild(pLoading);
    try {
        todasLasTareas = await getAllTareas();
        applyFilters();
    } catch (e) {
        notificarError("No se pudieron cargar las tareas globales");
        tasksContainer.replaceChildren();
        const pError = document.createElement('p');
        pError.className = 'loading-text';
        pError.style.color = 'var(--color-danger)';
        pError.textContent = 'Error al cargar.';
        tasksContainer.appendChild(pError);
    }
}

function applyFilters() {
    const searchVal = searchTask.value.toLowerCase();
    const userIdVal = filterUserSelect.value;

    let filtradas = todasLasTareas.filter(t => t.title.toLowerCase().includes(searchVal));

    if (userIdVal) {
        filtradas = filtradas.filter(t =>
            Array.isArray(t.usuarios) && t.usuarios.some(u => String(u.id) === String(userIdVal))
        );
    }

    badgeStatus.textContent = `${filtradas.length} tareas`;

    if (filtradas.length === 0) {
        tasksContainer.replaceChildren();
        const pNoTasks = document.createElement('p');
        pNoTasks.className = 'loading-text';
        pNoTasks.textContent = 'No se encontraron tareas con estos filtros.';
        tasksContainer.appendChild(pNoTasks);
    } else {
        tasksContainer.replaceChildren(); // Limpiar
        armarTareas(tasksContainer, filtradas, handleStatusChange);
    }
}

async function handleSubmitTask(e) {
    e.preventDefault();
    const titulo = taskTitle.value.trim();
    if (!titulo) return notificarError("El título es obligatorio");
    const descripcion = taskDescription.value.trim();

    const checkedBoxes = document.querySelectorAll('input[name="assignedUsers"]:checked');
    const assignedUserIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (assignedUserIds.length === 0) {
        return notificarError("Debe seleccionar al menos un usuario.");
    }

    if (editandoId) {
        // MODO EDICION
        try {
            const datosActualizados = {
                title: titulo,
                body: descripcion,
                userIds: assignedUserIds.map(Number)
            };
            const respondida = await updateTarea(editandoId, datosActualizados);

            // Actualizar en el estado local
            const idx = todasLasTareas.findIndex(t => String(t.id) === String(editandoId));
            if (idx !== -1) {
                todasLasTareas[idx] = { ...todasLasTareas[idx], ...respondida };
            }

            resetForm();
            applyFilters();
            notificarExito("Tarea actualizada correctamente");
        } catch (err) {
            notificarError("Error al actualizar tarea");
        }
    } else {
        // MODO CREACION
        const newTaskParams = {
            title: titulo,
            body: descripcion,
            completed: false,
            status: 'pending',
            userIds: assignedUserIds.map(Number)
        };

        try {
            const created = await createTarea(newTaskParams);
            created.assignedUsers = assignedUserIds;
            created.status = 'pending';
            todasLasTareas.unshift(created);
            applyFilters();
            resetForm();
            notificarExito("Tarea global creada");
        } catch (err) {
            notificarError("Error creando tarea global");
        }
    }
}

function resetForm() {
    taskForm.reset();
    editandoId = null;
    taskTitle.value = "";
    taskDescription.value = "";
    taskForm.querySelector('button[type="submit"]').textContent = "Crear Tarea";
    // Desmarcar checkboxes
    document.querySelectorAll('input[name="assignedUsers"]').forEach(cb => cb.checked = false);
}

async function handleStatusChange(idTarea, nuevoEstado) {
    try {
        const idx = todasLasTareas.findIndex(t => String(t.id) === String(idTarea));
        if (idx !== -1) {
            const tareaExistente = todasLasTareas[idx];
            const datosParaActualizar = {
                ...tareaExistente,
                status: nuevoEstado,
                completed: (nuevoEstado === 'completed')
            };
            const respondida = await updateTarea(idTarea, datosParaActualizar);

            // Actualizar estado local usando los datos procesados en backend
            todasLasTareas[idx] = respondida;
            applyFilters();
            notificarExito("Estado actualizado");
        }
    } catch (e) {
        notificarError("Error al actualizar estado");
    }
}

async function handleTaskAction(e) {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    if (e.target.classList.contains('btn-eliminar-tarea')) {
        const conf = await mostrarConfirmacion("¿Eliminar tarea globalmente?");
        if (!conf) return;
        try {
            const success = await deleteTarea(id);
            if (success) {
                todasLasTareas = todasLasTareas.filter(t => String(t.id) !== String(id));
                applyFilters();
                notificarExito("Tarea eliminada");
            } else {
                notificarError("Error al eliminar (Server err)");
            }
        } catch (err) {
            notificarError("Error al eliminar tarea");
        }
    } else if (e.target.classList.contains('btn-editar-tarea')) {
        prepararEdicion(id);
    }
}

function prepararEdicion(id) {
    const tarea = todasLasTareas.find(t => String(t.id) === String(id));
    if (!tarea) return;

    editandoId = id;
    taskTitle.value = tarea.title;
    taskDescription.value = tarea.body || "";

    // Marcar los checkboxes de usuarios asignados
    const idsAsignados = Array.isArray(tarea.usuarios)
        ? tarea.usuarios.map(u => String(u.id))
        : [];
    document.querySelectorAll('input[name="assignedUsers"]').forEach(cb => {
        cb.checked = idsAsignados.includes(String(cb.value));
    });

    taskForm.querySelector('button[type="submit"]').textContent = "Actualizar Tarea";
    taskTitle.focus();
    // Scroll hacia el formulario
    taskForm.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', init);
