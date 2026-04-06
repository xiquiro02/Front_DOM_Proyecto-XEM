// Importa las funciones de comunicación con el servidor backend para tareas
import { getTareasByUserId, createTarea, deleteTarea, updateTarea } from "../api/index.js";
// Importa utilitarios de la interfaz de usuario para renderizado y notificaciones
import { armarTareas, notificarExito, notificarError, mostrarConfirmacion } from "../ui/index.js";
// Importa funciones para gestionar el estado local (memoria) y el filtrado de datos
import { guardarTareas, agregarTarea, actualizarTareaEnEstado, eliminarTareaDelEstado, obtenerTareasFiltradas, obtenerTodasLasTareas } from "./filterService.js";

/**
 * Servicio para cargar y mostrar tareas de un usuario.
 */
export const cargarTareasDelUsuario = async (idUsuario, contenedorTareas, renderFn) => {
    // Limpia el contenedor de tareas en el DOM antes de llenarlo
    contenedorTareas.replaceChildren();
    try {
        // Solicita las tareas del usuario a la API de forma asíncrona
        const tareas = await getTareasByUserId(idUsuario);
        // Almacena las tareas obtenidas en el estado local de filterService
        guardarTareas(tareas);
        // Renderiza las tareas: usa renderFn si existe (filtros) o armarTareas directamente
        if (renderFn) {
            renderFn();
        } else {
            armarTareas(contenedorTareas, tareas);
        }
    } catch (error) {
        // Registra cualquier error ocurrido durante el proceso de carga
        console.error("Error cargando tareas:", error);
    }
};

/**
 * Servicio para procesar la creación de una nueva tarea.
 */
export const procesarCreacionTarea = async (nuevaTarea, contenedorTareas, formularioTarea, renderFn) => {
    try {
        // Envía la nueva tarea al servidor y espera la confirmación/creación
        const tareaCreada = await createTarea(nuevaTarea);
        // Asegura que el status sea correcto ('completed' si terminó, o el original)
        tareaCreada.status = nuevaTarea.status || (tareaCreada.completed ? 'completed' : 'pending');
        // Agrega la nueva tarea creada al estado local de la aplicación
        agregarTarea(tareaCreada);
        // Limpia los campos del formulario de creación en la UI
        formularioTarea.reset();
        // Actualiza la lista de tareas mostrada para incluir la nueva entrada
        if (renderFn) {
            renderFn();
        } else {
            armarTareas(contenedorTareas, [tareaCreada]);
        }
        // Notifica al usuario que la operación fue exitosa
        notificarExito("Tarea creada correctamente");
        return true;
    } catch (error) {
        // Maneja errores informando al usuario y registrando el fallo
        console.error("Error al crear tarea:", error);
        notificarError("Hubo un error al guardar la tarea");
        return false;
    }
};

/**
 * Servicio para procesar la actualización de los datos de una tarea.
 */
export const procesarActualizacionTarea = async (tareaActualId, datosActualizados, helpers) => {
    try {
        // Obtiene el listado completo de tareas actuales desde la memoria
        const tareasGuardadas = obtenerTodasLasTareas();
        // Busca los datos previos de la tarea para combinarlos con los nuevos
        const tareaPrev = tareasGuardadas.find(t => String(t.id) === String(tareaActualId)) || {};
        const datosCompletos = { ...tareaPrev, ...datosActualizados };

        // Envía la actualización al servidor backend
        const tareaActualizada = await updateTarea(tareaActualId, datosCompletos);
        // Mantiene el status coherente después de la respuesta del servidor
        tareaActualizada.status = datosActualizados.status || (tareaActualizada.completed ? 'completed' : 'pending');
        // Actualiza los datos de la tarea en el estado global local
        actualizarTareaEnEstado(tareaActualId, tareaActualizada);
        // Refleja los cambios en la interfaz sin recargar toda la lista
        helpers.actualizarTarjetaEnDOM(tareaActualId, tareaActualizada);
        helpers.resetearFormularioAModoCrear();
        // Si existe una función de renderizado con filtros, la ejecuta de nuevo
        if (helpers.renderFn) {
            helpers.renderFn();
        }
        // Notifica éxito en la actualización
        notificarExito("Tarea actualizada correctamente");
        return true;
    } catch (error) {
        // En caso de error, informa al usuario y retorna fallo
        console.error("Error actualizando tarea:", error);
        notificarError("Hubo un error al actualizar la tarea");
        return false;
    }
};

/**
 * Servicio para gestionar la eliminación de una tarea.
 */
export const procesarEliminacionTarea = async (idTarea, tarjetaDOM, renderFn) => {
    // Muestra un cuadro de diálogo para confirmar la eliminación deliberada
    const confirmar = await mostrarConfirmacion("¿Deseas eliminar esta tarea? Esta acción no se puede deshacer.");
    // Detiene el proceso si el administrador cancela la confirmación
    if (!confirmar) return;

    try {
        // Llama a la API para eliminar el registro del servidor
        const eliminado = await deleteTarea(idTarea);
        // Si el servidor confirmó el borrado satisfactorio
        if (eliminado) {
            // Remueve la tarea del estado local y de la interfaz física
            eliminarTareaDelEstado(idTarea);
            tarjetaDOM.remove();
            // Notifica al usuario final
            notificarExito("Tarea eliminada correctamente");
            // Dispara el re-renderizado si es necesario (ej: actualizar contadores)
            if (renderFn) {
                renderFn();
            }
        } else {
            // Informa si el servidor no pudo completar la operación
            notificarError("No se pudo eliminar la tarea");
        }
    } catch (error) {
        // Captura y reporta problemas Graves durante la eliminación
        console.error("Error eliminando tarea:", error);
        notificarError("Ocurrió un error al eliminar la tarea");
    }
};
