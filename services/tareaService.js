import { getTareasByUserId, createTarea, deleteTarea, updateTarea } from "../api/index.js";
import { armarTareas } from "../ui/index.js";

/**
 * Servicio para cargar y mostrar tareas
 */
export const cargarTareasDelUsuario = async (idUsuario, contenedorTareas) => {
    contenedorTareas.innerHTML = '';
    try {
        const primerosTareas = await getTareasByUserId(idUsuario);
        armarTareas(contenedorTareas, primerosTareas);
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
};

/**
 * Servicio para crear una nueva tarea
 */
export const procesarCreacionTarea = async (nuevaTarea, contenedorTareas, formularioTarea) => {
    try {
        const tareaCreada = await createTarea(nuevaTarea);
        armarTareas(contenedorTareas, [tareaCreada]);
        formularioTarea.reset();
        return true;
    } catch (error) {
        console.error("Error al crear tarea:", error);
        alert("Hubo un error al guardar la tarea");
        return false;
    }
};

/**
 * Servicio para actualizar una tarea existente
 */
export const procesarActualizacionTarea = async (tareaActualId, datosActualizados, helpers) => {
    try {
        const tareaActualizada = await updateTarea(tareaActualId, datosActualizados);
        helpers.actualizarTarjetaEnDOM(tareaActualId, tareaActualizada);
        helpers.resetearFormularioAModoCrear();
        return true;
    } catch (error) {
        console.error("Error actualizando tarea:", error);
        alert("Hubo un error al actualizar la tarea");
        return false;
    }
};

/**
 * Servicio para eliminar una tarea
 */
export const procesarEliminacionTarea = async (idTarea, tarjetaDOM) => {
    const confirmar = confirm("¿Estás segura de que deseas eliminar esta tarea?");
    if (!confirmar) return;

    try {
        const eliminado = await deleteTarea(idTarea);
        if (eliminado) {
            tarjetaDOM.remove();
        } else {
            alert("No se pudo eliminar la tarea");
        }
    } catch (error) {
        console.error("Error eliminando tarea:", error);
        alert("Ocurrió un error al eliminar la tarea");
    }
};
