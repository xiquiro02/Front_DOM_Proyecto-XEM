// Importa la URL base desde la configuración
import { BASE_URL } from '../config.js';

// Exporta la función para actualizar únicamente el estado de una tarea
export const updateTareaStatus = async (id, status) => {
    // Mapeo de estados entre frontend (Inglés) y backend (Español)
    const mapping = {
        'completed': 'completada',
        'pending': 'pendiente',
        'in-progress': 'en proceso'
    };
    
    // Busca la traducción del estado o usa el valor original
    const estadoBackend = mapping[status] || status;

    try {
        // Petición PUT para actualizar solo el campo 'estado' en el servidor
        const respuesta = await fetch(`${BASE_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: estadoBackend })
        });
        
        // Si la respuesta es exitosa, procesa los nuevos datos
        if (respuesta.ok) {
            const json = await respuesta.json();
            const t = json.data;
            // Diccionario de traducción inversa (Back -> Front)
            const backToFront = {
                'completada': 'completed',
                'pendiente': 'pending',
                'en proceso': 'in-progress'
            };
            // Retorna el objeto adaptado para el funcionamiento del frontend
            return {
                ...t,
                title: t.titulo,
                body: t.descripcion,
                status: backToFront[t.estado] || t.estado,
                completed: t.estado === 'completada'
            };
        } else {
            // Lanza error si el servidor falla al actualizar el estado
            throw new Error('Error al actualizar el estado de la tarea en el servidor');
        }
    } catch (error) {
        // Captura y propaga errores ocurridos durante la petición
        console.error("Error en la petición de cambio de estado:", error);
        throw error;
    }
};
