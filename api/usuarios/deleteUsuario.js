// Importa la constante BASE_URL de la configuración
import { BASE_URL } from '../config.js';

// Exporta la función para eliminar un usuario por su identificador
export const deleteUsuario = async (usuarioId) => {
    // Ejecuta una petición DELETE al endpoint del usuario específico
    const respuesta = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
        method: 'DELETE',
    });
    // Retorna true si la eliminación fue exitosa, o false en caso contrario
    if (respuesta.ok) {
        return true;
    } else {
        return false;
    }
};
