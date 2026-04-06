// Importa la dirección base del servidor
import { BASE_URL } from '../config.js';

// Función asíncrona para recuperar todos los usuarios registrados
export const getAllUsers = async () => {
    // Realiza una petición GET al endpoint /usuarios
    const respuesta = await fetch(`${BASE_URL}/usuarios`);
    // Verifica si el servidor devolvió una respuesta exitosa
    if (respuesta.ok) {
        // Convierte la respuesta a JSON y retorna el listado de usuarios
        const json = await respuesta.json();
        return json.data;
    } else {
        // Lanza un mensaje de error si no se pueden cargar los datos
        throw new Error('No se pudieron cargar los usuarios');
    }
};
