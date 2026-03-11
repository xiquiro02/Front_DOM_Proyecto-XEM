import { getUserById } from "../api/index.js";
import { armarUsuario } from "../ui/index.js";
import { cargarTareasDelUsuario } from "./tareaService.js";

/**
 * Servicio para procesar la búsqueda de un usuario.
 * Coordina la llamada a la API, la actualización de la UI y la carga de tareas.
 * @param {string|number} idUsuario - ID del usuario a buscar.
 * @param {Object} domElements - Referencias al DOM.
 * @param {Function} renderFn - Función de render con filtros para pasarla a cargarTareasDelUsuario.
 */
export const buscarYMostrarUsuario = async (idUsuario, domElements, renderFn) => {
    const {
        contenedorInfoUsuario,
        seccionInfoUsuario,
        seccionFormularioTarea,
        seccionListaTareas,
        errorIdUsuario,
        contenedorTareas,
        mostrarError,
        ocultarSecciones
    } = domElements;

    try {
        // Lógica de API
        const usuario = await getUserById(idUsuario);

        // Lógica de UI
        armarUsuario(contenedorInfoUsuario, usuario);

        seccionInfoUsuario.classList.remove("hidden");
        seccionFormularioTarea.classList.remove("hidden");
        seccionListaTareas.classList.remove("hidden");
        errorIdUsuario.textContent = "";

        // Cargar tareas pasando la función render con filtros
        await cargarTareasDelUsuario(idUsuario, contenedorTareas, renderFn);

        return usuario;
    } catch (error) {
        console.error(error);
        mostrarError("Usuario no encontrado en el sistema");
        ocultarSecciones();
        return null;
    }
};
