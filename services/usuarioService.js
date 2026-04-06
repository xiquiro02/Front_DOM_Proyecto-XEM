// Importa la función de API para obtener los datos de un usuario mediante su ID
import { getUserById } from "../api/index.js";
// Importa el generador de UI para crear la visualización del perfil del usuario
import { armarUsuario } from "../ui/index.js";
// Importa el servicio encargado de gestionar y mostrar la lista de tareas del usuario
import { cargarTareasDelUsuario } from "./tareaService.js";

/**
 * Servicio para coordinar la búsqueda, visualización y carga de datos de un usuario.
 */
export const buscarYMostrarUsuario = async (idUsuario, domElements, renderFn) => {
    // Realiza la desestructuración de los elementos del DOM recibidos como parámetros
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
        // Realiza la petición asíncrona a la API para traer los datos del usuario
        const usuario = await getUserById(idUsuario);

        // Llama a la función de UI para inyectar los datos del usuario en el contenedor
        armarUsuario(contenedorInfoUsuario, usuario);

        // Muestra las secciones principales de la aplicación removiendo la clase 'hidden'
        seccionInfoUsuario.classList.remove("hidden");
        seccionFormularioTarea.classList.remove("hidden");
        seccionListaTareas.classList.remove("hidden");
        // Borra cualquier mensaje de error previo que pudiera existir en la pantalla
        errorIdUsuario.textContent = "";

        // Dispara la carga y visualización de las tareas pertenecientes a este usuario
        await cargarTareasDelUsuario(idUsuario, contenedorTareas, renderFn);

        // Retorna el objeto de usuario cargado para posibles usos adicionales
        return usuario;
    } catch (error) {
        // En caso de error (ej: usuario inexistente), gestiona la UI para informar al usuario
        console.error(error);
        mostrarError("Usuario no encontrado en el sistema");
        ocultarSecciones(); // Oculta las áreas de tareas que no corresponden a un usuario válido
        return null; // Indica que la búsqueda falló retornando null
    }
};
