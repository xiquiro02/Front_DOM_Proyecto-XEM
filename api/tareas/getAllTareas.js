// Importa la URL base del backend desde la configuración
import { BASE_URL } from '../config.js';

// Exporta la función para obtener todas las tareas disponibles
export const getAllTareas = async () => {
    // Realiza una petición GET al endpoint de tareas
    const respuesta = await fetch(`${BASE_URL}/tareas`);
    // Evalúa si el servidor respondió correctamente
    if (respuesta.ok) {
        // Obtiene los datos en formato JSON
        const json = await respuesta.json();
        // Diccionario para traducir estados del backend al frontend
        const backToFront = {
            'completada': 'completed',
            'pendiente': 'pending',
            'en proceso': 'in-progress'
        };
        // Itera sobre las tareas recibidas para adaptar los campos (mapeo)
        return json.data.map(t => ({
            ...t, // Preserva campos originales
            title: t.titulo, // Renombra 'titulo' a 'title'
            body: t.descripcion, // Renombra 'descripcion' a 'body'
            status: backToFront[t.estado] || t.estado, // Traduce el estado actual
            completed: t.estado === 'completada' // Define booleano basado en el estado
        }));
    } else {
        // Lanza error si no se pudo completar la carga
        throw new Error('No se pudieron cargar las tareas');
    }
};
