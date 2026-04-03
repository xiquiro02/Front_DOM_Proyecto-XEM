import { BASE_URL } from '../config.js';

export const updateTarea = async (tareaId, tarea) => {
    const frontToBack = {
        'pending': 'pendiente',
        'in-progress': 'en proceso',
        'completed': 'completada'
    };

    // Mapeamos los campos del frente (Inglés) a los del backend (Español)
    const bodyBackend = {
        titulo: tarea.title,
        descripcion: tarea.body,
        estado: frontToBack[tarea.status] || (tarea.completed ? 'completada' : 'pendiente')
    };

    try {
        const respuesta = await fetch(`${BASE_URL}/tareas/${tareaId}`, {
            method: 'PUT', // Usamos PUT ya que el backend original lo requiere
            body: JSON.stringify(bodyBackend),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (respuesta.ok) {
            const json = await respuesta.json();
            const t = json.data;
            // Mapeamos de vuelta para que el frontend siga funcionando igual
            const backToFront = {
                'completada': 'completed',
                'pendiente': 'pending',
                'en proceso': 'in-progress'
            };
            // Mapeo de vuelta para el front
            return {
                ...t,
                title: t.titulo,
                body: t.descripcion,
                status: backToFront[t.estado] || t.estado,
                completed: t.estado === 'completada'
            };
        } else {
            throw new Error('Error al actualizar la tarea');
        }
    } catch (error) {
        console.error("Error en la petición de actualización:", error);
        throw error;
    }
};
