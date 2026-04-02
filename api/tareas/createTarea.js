import { BASE_URL } from '../config.js';

export const createTarea = async (nuevaTarea) => {
    const frontToBack = {
        'pending': 'pendiente',
        'in-progress': 'en proceso',
        'completed': 'completada'
    };

    // Mapeo hacia el backend
    const bodyBackend = {
        titulo: nuevaTarea.title,
        descripcion: nuevaTarea.body || 'Sin descripción',
        estado: frontToBack[nuevaTarea.status] || (nuevaTarea.completed ? 'completada' : 'pendiente'),
        userId: nuevaTarea.userId
    };

    const opciones = {
        method: 'POST',
        body: JSON.stringify(bodyBackend),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    };

    const respuesta = await fetch(`${BASE_URL}/tareas`, opciones);
    if (respuesta.ok) {
        const json = await respuesta.json();
        const t = json.data;
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
        throw new Error("Hubo un error al guardar la tarea");
    }
}
