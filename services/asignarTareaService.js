/**
 * Servicio: asignarTareaService.js
 * Objetivo: Asignar la misma tarea a múltiples usuarios en paralelo.
 * Reutiliza la API de createTarea sin depender directamente de ella.
 */
import { createTarea } from '../api/index.js';
import { notificarExito, notificarError, notificarInfo } from '../ui/index.js';

/**
 * Asigna la misma tarea (mismos datos) a una lista de usuarios.
 * Realiza las peticiones en paralelo con Promise.allSettled para que
 * un fallo individual no cancele las demás asignaciones.
 *
 * @param {Object} datosTarea  - Campos comunes: title, body, completed, status.
 * @param {number[]} idsUsuarios - IDs de los usuarios que recibirán la tarea.
 * @returns {Promise<{exitosos: number, fallidos: number}>}
 */
export const asignarTareaAVariosUsuarios = async (datosTarea, idsUsuarios) => {
    if (!idsUsuarios || idsUsuarios.length === 0) {
        notificarInfo('Debes seleccionar al menos un usuario.');
        return { exitosos: 0, fallidos: 0 };
    }

    try {
        await createTarea({
            ...datosTarea,
            userIds: idsUsuarios,
            createdAt: Date.now(),
        });
        notificarExito(`Tarea asignada correctamente a ${idsUsuarios.length} usuario${idsUsuarios.length !== 1 ? 's' : ''}.`);
        return { exitosos: idsUsuarios.length, fallidos: 0 };
    } catch (error) {
        notificarError('No se pudo asignar la tarea.');
        return { exitosos: 0, fallidos: idsUsuarios.length };
    }
};
