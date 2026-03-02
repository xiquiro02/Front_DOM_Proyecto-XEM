import { getUserById } from "../api/index.js";
import { armarUsuario } from "../ui/index.js";
import { cargarTareasDelUsuario } from "./tareaService.js";

/**
 * Servicio para procesar la búsqueda de un usuario
 * Coordina la llamada a la API y la actualización de la UI
 */
export const buscarYMostrarUsuario = async (idUsuario, domElements) => {
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

        // Lógica intermedia para cargar tareas
        await cargarTareasDelUsuario(idUsuario, contenedorTareas);

        return usuario;
    } catch (error) {
        console.error(error);
        mostrarError("Usuario no encontrado en el sistema");
        ocultarSecciones();
        return null;
    }
};
