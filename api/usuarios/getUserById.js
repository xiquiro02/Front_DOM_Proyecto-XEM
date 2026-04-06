// Importa la configuración con la URL del servidor
import { BASE_URL } from '../config.js';

// Exporta la función para buscar un único usuario por su ID
export const getUserById = async (idUsuario) => {
    // Ejecuta petición GET solicitando los datos del usuario específico
    const respuesta = await fetch(`${BASE_URL}/usuarios/${idUsuario}`);
    // Si el usuario existe y la respuesta es exitosa
    if (respuesta.ok) {
        // Extrae y retorna los datos del usuario encontrado
        const json = await respuesta.json();
        return json.data;
    } else {
        // Lanza excepción si el usuario no fue hallado o hubo error
        throw new Error("Usuario no encontrado");
    }
}
