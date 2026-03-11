import { getTareasByUserId, createTarea, deleteTarea, updateTarea } from "../api/index.js";
import { armarTareas, notificarExito, notificarError, mostrarConfirmacion } from "../ui/index.js";
import { guardarTareas, agregarTarea, actualizarTareaEnEstado, eliminarTareaDelEstado, obtenerTareasFiltradas } from "./filterService.js";

/**
 * Servicio para cargar y mostrar tareas.
 * Almacena las tareas en filterService (fuente de verdad) y delega el render.
 */
export const cargarTareasDelUsuario = async (idUsuario, contenedorTareas, renderFn) => {
    contenedorTareas.innerHTML = '';
    try {
        const tareas = await getTareasByUserId(idUsuario);
        guardarTareas(tareas);          // guardar en filterService
        if (renderFn) {
            renderFn();                 // usar la función de render con filtros activos
        } else {
            armarTareas(contenedorTareas, tareas);
        }
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
};

/**
 * Servicio para crear una nueva tarea.
 * Agrega la tarea al estado de filterService y re-renderiza.
 */
export const procesarCreacionTarea = async (nuevaTarea, contenedorTareas, formularioTarea, renderFn) => {
    try {
        const tareaCreada = await createTarea(nuevaTarea);
        // Preservar el status (en-proceso si fue seleccionado)
        tareaCreada.status = nuevaTarea.status || (tareaCreada.completed ? 'completed' : 'pending');
        agregarTarea(tareaCreada);      // agregar a filterService
        formularioTarea.reset();
        if (renderFn) {
            renderFn();                 // re-renderizar con filtros activos
        } else {
            armarTareas(contenedorTareas, [tareaCreada]);
        }
        notificarExito("Tarea creada correctamente");
        return true;
    } catch (error) {
        console.error("Error al crear tarea:", error);
        notificarError("Hubo un error al guardar la tarea");
        return false;
    }
};

/**
 * Servicio para actualizar una tarea existente.
 */
export const procesarActualizacionTarea = async (tareaActualId, datosActualizados, helpers) => {
    try {
        const tareaActualizada = await updateTarea(tareaActualId, datosActualizados);
        // Preservar el status personalizado si viene en datosActualizados
        tareaActualizada.status = datosActualizados.status || (tareaActualizada.completed ? 'completed' : 'pending');
        actualizarTareaEnEstado(tareaActualId, tareaActualizada); // actualizar en filterService
        helpers.actualizarTarjetaEnDOM(tareaActualId, tareaActualizada);
        helpers.resetearFormularioAModoCrear();
        // Re-renderizar para aplicar filtros actuales
        if (helpers.renderFn) {
            helpers.renderFn();
        }
        notificarExito("Tarea actualizada correctamente");
        return true;
    } catch (error) {
        console.error("Error actualizando tarea:", error);
        notificarError("Hubo un error al actualizar la tarea");
        return false;
    }
};

/**
 * Servicio para eliminar una tarea.
 */
export const procesarEliminacionTarea = async (idTarea, tarjetaDOM, renderFn) => {
    const confirmar = await mostrarConfirmacion("¿Deseas eliminar esta tarea? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
        const eliminado = await deleteTarea(idTarea);
        if (eliminado) {
            eliminarTareaDelEstado(idTarea); // eliminar de filterService
            tarjetaDOM.remove();
            notificarExito("Tarea eliminada correctamente");
            if (renderFn) {
                renderFn();                  // re-renderizar badge de conteo
            }
        } else {
            notificarError("No se pudo eliminar la tarea");
        }
    } catch (error) {
        console.error("Error eliminando tarea:", error);
        notificarError("Ocurrió un error al eliminar la tarea");
    }
};
