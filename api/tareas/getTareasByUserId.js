// Importa la configuración base del servidor
import { BASE_URL } from '../config.js';

// Función que solicita tareas específicas para un usuario por su ID
export const getTareasByUserId = async (idUsuario) => {
    // Ejecuta petición GET filtrando por la ruta de usuario en el backend
    const respuesta = await fetch(`${BASE_URL}/tareas/usuario/${idUsuario}`);
    // Si la respuesta es válida, procesa los datos
    if (respuesta.ok) {
        const json = await respuesta.json();
        // Traduce estados de Español (Backend) a Inglés (Frontend)
        const backToFront = {
            'completada': 'completed',
            'pendiente': 'pending',
            'en proceso': 'in-progress'
        };
        // Mapea y normaliza los resultados para que el frontend los entienda
        return json.data.map(t => ({
            ...t,
            title: t.titulo,
            body: t.descripcion,
            status: backToFront[t.estado] || t.estado,
            completed: t.estado === 'completada'
        }));
    } else {
        // Si falla, informa al usuario mediante una excepción
        throw new Error("No se pudieron cargar las tareas");
    }
}