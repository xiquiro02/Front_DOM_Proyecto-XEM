// Importa la URL base del backend
import { BASE_URL } from '../config.js';

// Exporta la función para actualizar la información de un usuario
export const updateUsuario = async (usuarioId, datos) => {
    // Envía una petición PUT con los nuevos datos del usuario en formato JSON
    const respuesta = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
        method: 'PUT',
        // Incluye el ID y el resto de los campos actualizados en el cuerpo
        body: JSON.stringify({ id: usuarioId, ...datos }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });
    // Si el servidor confirma la actualización, retorna el usuario modificado
    if (respuesta.ok) {
        const json = await respuesta.json();
        return json.data;
    } else {
        // Informa al usuario en caso de error durante la actualización
        throw new Error('Hubo un error al actualizar el usuario');
    }
};
