/**
 * Servicio: asignarTareaService.js
 */
// Importa la función de API necesaria para crear tareas individuales
import { createTarea } from '../api/index.js';
// Importa los componentes de UI para emitir notificaciones visuales sobre el proceso
import { notificarExito, notificarError, notificarInfo } from '../ui/index.js';

/**
 * Asigna una misma tarea a una colección de usuarios mediante peticiones asíncronas.
 */
export const asignarTareaAVariosUsuarios = async (datosTarea, idsUsuarios) => {
    // Valida preventivamente si la lista de destinatarios no está vacía
    if (!idsUsuarios || idsUsuarios.length === 0) {
        notificarInfo('Debes seleccionar al menos un usuario.');
        return { exitosos: 0, fallidos: 0 };
    }

    try {
        // Ejecuta la creación de una tarea pasando el array de IDs de usuarios asociados
        await createTarea({
            ...datosTarea, // Propaga los datos comunes de la tarea (título, descripción, etc)
            userIds: idsUsuarios, // Incluye la nómina de usuarios seleccionados
            createdAt: Date.now(), // Estampa la fecha actual como marca de tiempo para el registro
        });
        // Informa al usuario de la asignación exitosa indicando la cantidad procesada
        notificarExito(`Tarea asignada correctamente a ${idsUsuarios.length} usuario${idsUsuarios.length !== 1 ? 's' : ''}.`);
        return { exitosos: idsUsuarios.length, fallidos: 0 };
    } catch (error) {
        // Gestiona el fallo en la asignación reportando el error a la interfaz
        notificarError('No se pudo asignar la tarea.');
        return { exitosos: 0, fallidos: idsUsuarios.length };
    }
};
