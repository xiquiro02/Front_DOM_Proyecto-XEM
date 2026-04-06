// Exporta funciones de usuarios para centralizar el acceso desde un solo punto
export { getUserById } from './usuarios/getUserById.js';
export { getAllUsers } from './usuarios/getAllUsers.js';
export { createUsuario } from './usuarios/createUsuario.js';
export { updateUsuario } from './usuarios/updateUsuario.js';
export { deleteUsuario } from './usuarios/deleteUsuario.js';

// Exporta funciones de tareas para facilitar su importación en servicios y UI
export { getTareasByUserId } from './tareas/getTareasByUserId.js';
export { createTarea } from './tareas/createTarea.js';
export { deleteTarea } from './tareas/deleteTarea.js';
export { updateTarea } from './tareas/updateTarea.js';
export { getAllTareas } from './tareas/getAllTareas.js';
export { updateTareaStatus } from './tareas/updateTareaStatus.js';