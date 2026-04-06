/**
 * Módulo: filterService.js
 * Objetivo: Gestionar el estado global de las tareas, el filtrado y el ordenamiento.
 */

// ==========================================
// ESTADO INTERNO (privado al módulo)
// ==========================================
// Almacena la lista maestra de tareas sin ningún filtro aplicado
let todasLasTareas = [];
// Define el criterio actual de filtrado por estado ('all' por defecto)
let filtroEstado = 'all';
// Define el criterio actual de filtrado por usuario ('all' por defecto)
let filtroUsuario = 'all';

// Establece el campo por el cual se ordenarán los resultados (fecha, nombre, estado)
let criterioOrden = 'fecha';
// Define si el orden es ascendente ('asc') o descendente ('desc')
let direccionOrden = 'asc';

// ==========================================
// GESTIÓN DE TAREAS
// ==========================================

/**
 * Reemplaza el listado completo de tareas en la memoria interna.
 */
export const guardarTareas = (tareas) => {
    // Actualiza la fuente de verdad con los nuevos datos recibidos
    todasLasTareas = tareas;
};

/**
 * Agrega una nueva tarea al final del listado actual.
 */
export const agregarTarea = (tarea) => {
    // Inserta un objeto de tarea individual en el array maestro
    todasLasTareas.push(tarea);
};

/**
 * Busca y actualiza los datos de una tarea específica por su ID.
 */
export const actualizarTareaEnEstado = (id, datos) => {
    // Localiza el índice de la tarea comparando IDs como strings para evitar errores de tipo
    const index = todasLasTareas.findIndex(t => String(t.id) === String(id));
    // Si la tarea existe, combina los datos actuales con los nuevos valores
    if (index !== -1) {
        todasLasTareas[index] = { ...todasLasTareas[index], ...datos };
    }
};

/**
 * Remueve una tarea de la lista maestra basándose en su ID.
 */
export const eliminarTareaDelEstado = (id) => {
    // Filtra el array para excluir la tarea que coincide con el ID proporcionado
    todasLasTareas = todasLasTareas.filter(t => String(t.id) !== String(id));
};

/**
 * Proporciona una copia superficial de todas las tareas almacenadas.
 */
export const obtenerTodasLasTareas = () => [...todasLasTareas];

// ==========================================
// GESTIÓN DE FILTROS
// ==========================================

/**
 * Actualiza el filtro de estado activo en el sistema.
 */
export const setFiltroEstado = (valor) => {
    // Cambia el valor del filtro de estado ('all', 'pending', etc.)
    filtroEstado = valor;
};

/**
 * Actualiza el filtro de usuario para discriminar tareas.
 */
export const setFiltroUsuario = (valor) => {
    // Establece el ID del usuario como criterio de filtrado
    filtroUsuario = valor;
};

/**
 * Obtiene el valor actual del filtro por estado.
 */
export const getFiltroEstado = () => filtroEstado;

/**
 * Obtiene el valor actual del filtro por usuario.
 */
export const getFiltroUsuario = () => filtroUsuario;

/**
 * Restablece ambos filtros a sus valores predeterminados ('all').
 */
export const resetearFiltros = () => {
    // Limpia los criterios de selección para mostrar todo de nuevo
    filtroEstado = 'all';
    filtroUsuario = 'all';
};

// ==========================================
// GESTIÓN DE ORDENAMIENTO
// ==========================================

/** Define la propiedad de la tarea sobre la cual aplicar el orden */
export const setCriterioOrden = (valor) => { criterioOrden = valor; };

/** Define el sentido del ordenamiento (ascendente o descendente) */
export const setDireccionOrden = (valor) => { direccionOrden = valor; };

/** Recupera el criterio de ordenamiento que está siendo aplicado */
export const getCriterioOrden = () => criterioOrden;

/** Recupera el sentido del ordenamiento actual */
export const getDireccionOrden = () => direccionOrden;

/** Regresa el ordenamiento a su configuración inicial (Fecha/Asc) */
export const resetearOrden = () => {
    // Configura los valores iniciales para el sistema de ordenado
    criterioOrden = 'fecha';
    direccionOrden = 'asc';
};

// ==========================================
// LÓGICA DE FILTRADO Y ORDENAMIENTO
// ==========================================

// Define un peso numérico para cada estado para permitir ordenamiento lógico
const PRIORIDAD_ESTADO = { 'pending': 1, 'in-progress': 2, 'completed': 3 };

/**
 * Retorna un nuevo array procesado con los filtros y el orden aplicados.
 */
export const obtenerTareasFiltradas = () => {
    // --- PROCESO DE FILTRADO ---
    const filtradas = todasLasTareas.filter(tarea => {
        let pasaEstado = true;
        // Evalúa si la tarea cumple con el estado seleccionado en el filtro
        if (filtroEstado !== 'all') {
            const estadoTarea = tarea.status || (tarea.completed ? 'completed' : 'pending');
            pasaEstado = estadoTarea === filtroEstado;
        }

        let pasaUsuario = true;
        // Verifica si algun usuario asociado a la tarea coincide con el filtro de usuario
        if (filtroUsuario !== 'all') {
            pasaUsuario = Array.isArray(tarea.usuarios)
                && tarea.usuarios.some(u => String(u.id) === String(filtroUsuario));
        }

        return pasaEstado && pasaUsuario;
    });

    // --- PROCESO DE ORDENAMIENTO ---
    // Multiplicador de dirección: 1 para ascendente, -1 para descendente
    const dir = direccionOrden === 'asc' ? 1 : -1;

    return [...filtradas].sort((a, b) => {
        // Ordenamiento alfabético insensible a mayúsculas por el título de la tarea
        if (criterioOrden === 'nombre') {
            return dir * a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
        }

        // Ordenamiento por importancia de estado según el mapa de PRIORIDAD_ESTADO
        if (criterioOrden === 'estado') {
            const pa = PRIORIDAD_ESTADO[a.status || (a.completed ? 'completed' : 'pending')] || 1;
            const pb = PRIORIDAD_ESTADO[b.status || (b.completed ? 'completed' : 'pending')] || 1;
            return dir * (pa - pb);
        }

        // Ordenamiento temporal: usa el timestamp de creación o el ID como respaldo
        const fa = a.createdAt || a.id;
        const fb = b.createdAt || b.id;
        return dir * (fa - fb);
    });
};
