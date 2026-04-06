// Importa la URL base definida en la configuración global
import { BASE_URL } from '../config.js';

// Exporta la función asíncrona para crear una nueva tarea en el servidor
export const createTarea = async (nuevaTarea) => {
    // Diccionario de mapeo de estados del frontend (Inglés) al backend (Español)
    const frontToBack = {
        'pending': 'pendiente',
        'in-progress': 'en proceso',
        'completed': 'completada'
    };

    // Construye el objeto que el servidor backend espera recibir
    const bodyBackend = {
        // Mapea 'title' del frontend al campo 'titulo' del backend
        titulo: nuevaTarea.title,
        // Mapea 'body' del frontend al campo 'descripcion' del backend
        descripcion: nuevaTarea.body || 'Sin descripción',
        // Obtiene el estado traducido o asigna uno por defecto según 'completed'
        estado: frontToBack[nuevaTarea.status] || (nuevaTarea.completed ? 'completada' : 'pendiente'),
        // Incluye la lista de IDs de usuarios asociados a la tarea
        userIds: nuevaTarea.userIds || []
    };

    // Configura las opciones para la petición HTTP fetch
    const opciones = {
        method: 'POST', // Define el método de envío como POST
        body: JSON.stringify(bodyBackend), // Convierte el cuerpo a formato JSON
        headers: {
            'Content-type': 'application/json; charset=UTF-8', // Especifica el tipo de contenido y codificación
        },
    };

    // Realiza la petición fetch al endpoint /tareas
    const respuesta = await fetch(`${BASE_URL}/tareas`, opciones);
    // Evalúa si la respuesta fue exitosa (status 2xx)
    if (respuesta.ok) {
        // Parsea la respuesta JSON y extrae los datos de la tarea creada
        const json = await respuesta.json();
        const t = json.data;
        // Diccionario de traducción inversa para devolver el formato al frontend
        const backToFront = {
            'completada': 'completed',
            'pendiente': 'pending',
            'en proceso': 'in-progress'
        };
        // Retorna el objeto unificado mapeando de nuevo al formato del front (Inglés)
        return {
            ...t,
            title: t.titulo,
            body: t.descripcion,
            status: backToFront[t.estado] || t.estado,
            completed: t.estado === 'completada'
        };
    } else {
        // Lanza una excepción si el servidor respondió con un error
        throw new Error("Hubo un error al guardar la tarea");
    }
}
