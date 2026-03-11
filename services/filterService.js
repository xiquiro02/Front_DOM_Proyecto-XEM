/**
 * Módulo: filterService.js
 * Objetivo: Gestionar el estado global de las tareas, el filtrado y el ordenamiento.
 *
 * Actúa como fuente de verdad centralizada para todas las tareas cargadas,
 * permitiendo filtrarlas por estado y/o usuario, y ordenarlas por fecha, nombre
 * o estado, de forma combinada y sin recargar la página.
 */

// ==========================================
// ESTADO INTERNO (privado al módulo)
// ==========================================
let todasLasTareas = [];        // Array con TODAS las tareas del usuario (sin filtrar)
let filtroEstado = 'all';       // 'all' | 'pending' | 'in-progress' | 'completed'
let filtroUsuario = 'all';      // 'all' | '1' | '2' | ...

// ---- Ordenamiento ----
let criterioOrden = 'fecha';    // 'fecha' | 'nombre' | 'estado'
let direccionOrden = 'asc';     // 'asc' | 'desc'

// ==========================================
// GESTIÓN DE TAREAS
// ==========================================

/**
 * Reemplaza el array completo de tareas (se usa al cargar).
 * @param {Array} tareas - Lista de tareas traídas de la API.
 */
export const guardarTareas = (tareas) => {
    todasLasTareas = tareas;
};

/**
 * Añade una tarea individual al array (se usa al crear).
 * @param {Object} tarea - Objeto de la nueva tarea.
 */
export const agregarTarea = (tarea) => {
    todasLasTareas.push(tarea);
};

/**
 * Actualiza una tarea existente en el array por su id.
 * @param {string|number} id - ID de la tarea a actualizar.
 * @param {Object} datos - Datos actualizados de la tarea.
 */
export const actualizarTareaEnEstado = (id, datos) => {
    const index = todasLasTareas.findIndex(t => String(t.id) === String(id));
    if (index !== -1) {
        todasLasTareas[index] = { ...todasLasTareas[index], ...datos };
    }
};

/**
 * Elimina una tarea del array por su id.
 * @param {string|number} id - ID de la tarea a eliminar.
 */
export const eliminarTareaDelEstado = (id) => {
    todasLasTareas = todasLasTareas.filter(t => String(t.id) !== String(id));
};

/**
 * Retorna una copia del array completo sin filtrar.
 */
export const obtenerTodasLasTareas = () => [...todasLasTareas];

// ==========================================
// GESTIÓN DE FILTROS
// ==========================================

/**
 * Establece el filtro de estado.
 * @param {string} valor - 'all' | 'pending' | 'in-progress' | 'completed'
 */
export const setFiltroEstado = (valor) => {
    filtroEstado = valor;
};

/**
 * Establece el filtro de usuario.
 * @param {string} valor - 'all' | id del usuario como string
 */
export const setFiltroUsuario = (valor) => {
    filtroUsuario = valor;
};

/**
 * Retorna el valor actual del filtro de estado.
 */
export const getFiltroEstado = () => filtroEstado;

/**
 * Retorna el valor actual del filtro de usuario.
 */
export const getFiltroUsuario = () => filtroUsuario;

/**
 * Resetea los filtros a su valor por defecto.
 */
export const resetearFiltros = () => {
    filtroEstado = 'all';
    filtroUsuario = 'all';
};

// ==========================================
// GESTIÓN DE ORDENAMIENTO
// ==========================================

/** Establece el criterio de orden: 'fecha' | 'nombre' | 'estado' */
export const setCriterioOrden = (valor) => { criterioOrden = valor; };

/** Establece la dirección de orden: 'asc' | 'desc' */
export const setDireccionOrden = (valor) => { direccionOrden = valor; };

/** Retorna el criterio de orden activo */
export const getCriterioOrden = () => criterioOrden;

/** Retorna la dirección de orden activa */
export const getDireccionOrden = () => direccionOrden;

/** Resetea el orden a los valores por defecto */
export const resetearOrden = () => {
    criterioOrden = 'fecha';
    direccionOrden = 'asc';
};

// ==========================================
// LÓGICA DE FILTRADO
// ==========================================

// Mapa de prioridad de estado para ordenar por estado
const PRIORIDAD_ESTADO = { 'pending': 1, 'in-progress': 2, 'completed': 3 };

/**
 * Retorna las tareas filtradas Y ordenadas según los criterios activos.
 * Primero filtra por estado y usuario, luego aplica el ordenamiento.
 * @returns {Array} - Array de tareas que cumplen el filtrado, ya ordenadas.
 */
export const obtenerTareasFiltradas = () => {
    // --- 1. FILTRADO ---
    const filtradas = todasLasTareas.filter(tarea => {
        let pasaEstado = true;
        if (filtroEstado !== 'all') {
            const estadoTarea = tarea.status || (tarea.completed ? 'completed' : 'pending');
            pasaEstado = estadoTarea === filtroEstado;
        }

        let pasaUsuario = true;
        if (filtroUsuario !== 'all') {
            pasaUsuario = String(tarea.userId) === String(filtroUsuario);
        }

        return pasaEstado && pasaUsuario;
    });

    // --- 2. ORDENAMIENTO ---
    const dir = direccionOrden === 'asc' ? 1 : -1;

    return [...filtradas].sort((a, b) => {
        if (criterioOrden === 'nombre') {
            // Orden alfabético por título
            return dir * a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
        }

        if (criterioOrden === 'estado') {
            // Orden por prioridad de estado: pendiente → en proceso → completada
            const pa = PRIORIDAD_ESTADO[a.status || (a.completed ? 'completed' : 'pending')] || 1;
            const pb = PRIORIDAD_ESTADO[b.status || (b.completed ? 'completed' : 'pending')] || 1;
            return dir * (pa - pb);
        }

        // Por defecto: orden por fecha (usando createdAt si existe, o id como proxy)
        const fa = a.createdAt || a.id;
        const fb = b.createdAt || b.id;
        return dir * (fa - fb);
    });
};
