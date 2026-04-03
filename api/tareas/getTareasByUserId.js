
import { BASE_URL } from '../config.js';

export const getTareasByUserId = async (idUsuario) => {
    const respuesta = await fetch(`${BASE_URL}/tareas/usuario/${idUsuario}`);
    if (respuesta.ok) {
        const json = await respuesta.json();
        const backToFront = {
            'completada': 'completed',
            'pendiente': 'pending',
            'en proceso': 'in-progress'
        };
        return json.data.map(t => ({
            ...t,
            title: t.titulo,
            body: t.descripcion,
            status: backToFront[t.estado] || t.estado,
            completed: t.estado === 'completada'
        }));
    } else {
        throw new Error("No se pudieron cargar las tareas");
    }
}