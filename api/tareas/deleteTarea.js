// Importa la configuración con la URL base del servidor
import { BASE_URL } from '../config.js';

// Exporta la función para eliminar una tarea mediante su identificador
export const deleteTarea = async (tareaId) => {
    try {
        // Ejecuta una petición DELETE al endpoint específico de la tarea
        const respuesta = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
            method: 'DELETE',
        });
        
        // Si la respuesta es satisfactoria, retorna true indicando el éxito
        if (respuesta.ok) {
            return true;
        } else {
            // Si falla, imprime el error en consola y retorna false
            console.error("Error al eliminar la tarea en el servidor");
            return false;
        }
    } catch (error) {
        // Captura y maneja errores de red (ej: pérdida de conexión)
        console.error("Error de red al eliminar la tarea:", error);
        return false;
    }
};
