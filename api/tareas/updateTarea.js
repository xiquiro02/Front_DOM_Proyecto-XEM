// Importa la URL base desde la configuración
import { BASE_URL } from '../config.js';

// Exporta la función para actualizar una tarea existente por su ID
export const updateTarea = async (tareaId, tarea) => {
    // Diccionario para traducir estados del front (Inglés) al back (Español)
    const frontToBack = {
        'pending': 'pendiente',
        'in-progress': 'en proceso',
        'completed': 'completada'
    };

    // Prepara el cuerpo de la petición mapeando campos al formato del backend
    const bodyBackend = {
        titulo: tarea.title,
        descripcion: tarea.body,
        estado: frontToBack[tarea.status] || (tarea.completed ? 'completada' : 'pendiente')
    };

    try {
        // Ejecuta una petición PUT con el cuerpo JSON y las cabeceras adecuadas
        const respuesta = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
            method: 'PUT', // Método requerido por el backend para actualizaciones
            body: JSON.stringify(bodyBackend),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        // Verifica si la actualización fue exitosa
        if (respuesta.ok) {
            const json = await respuesta.json();
            const t = json.data;
            // Diccionario para traducir de vuelta del back (Español) al front (Ingés)
            const backToFront = {
                'completada': 'completed',
                'pendiente': 'pending',
                'en proceso': 'in-progress'
            };
            // Retorna los datos actualizados adaptados para el frontend
            return {
                ...t,
                title: t.titulo,
                body: t.descripcion,
                status: backToFront[t.estado] || t.estado,
                completed: t.estado === 'completada'
            };
        } else {
            // Lanza error si el servidor no pudo procesar la actualización
            throw new Error('Error al actualizar la tarea');
        }
    } catch (error) {
        // Registra y propaga cualquier error de red o de proceso
        console.error("Error en la petición de actualización:", error);
        throw error;
    }
};
