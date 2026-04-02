/**
 * Servicio Admin: adminUsuarioService.js
 * Objetivo: Coordinar las llamadas a la API de usuarios con las notificaciones y el render de la UI.
 * Mismo patrón que tareaService.js pero para la gestión de usuarios del panel admin.
 */
import { getAllUsers, createUsuario, updateUsuario, deleteUsuario } from '../api/index.js';
import { armarListaUsuarios, notificarExito, notificarError, mostrarConfirmacion } from '../ui/index.js';

// ==========================================
// ESTADO INTERNO (fuente de verdad)
// ==========================================
let todosLosUsuarios = [];

export const guardarUsuarios = (usuarios) => { todosLosUsuarios = usuarios; };
export const obtenerTodosLosUsuarios = () => [...todosLosUsuarios];

export const agregarUsuarioEstado = (usuario) => { todosLosUsuarios.push(usuario); };

export const actualizarUsuarioEnEstado = (id, datos) => {
    const index = todosLosUsuarios.findIndex(u => String(u.id) === String(id));
    if (index !== -1) {
        todosLosUsuarios[index] = { ...todosLosUsuarios[index], ...datos };
    }
};

export const eliminarUsuarioDelEstado = (id) => {
    todosLosUsuarios = todosLosUsuarios.filter(u => String(u.id) !== String(id));
};

// ==========================================
// SERVICIOS
// ==========================================

/**
 * Carga todos los usuarios desde la API y los renderiza.
 */
export const cargarTodosLosUsuarios = async (contenedor, renderFn) => {
    contenedor.replaceChildren();
    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.textContent = 'Cargando usuarios...';
    contenedor.appendChild(pLoading);
    try {
        const usuarios = await getAllUsers();
        guardarUsuarios(usuarios);
        if (renderFn) {
            renderFn();
        } else {
            armarListaUsuarios(contenedor, usuarios);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        notificarError('No se pudieron cargar los usuarios');
    }
};

/**
 * Registra un nuevo usuario.
 */
export const procesarCreacionUsuario = async (nuevoUsuario, formulario, renderFn) => {
    try {
        const usuarioCreado = await createUsuario(nuevoUsuario);
        // El backend devuelve name, phone (inglés), transformamos a español para el estado
        const usuarioConId = {
            id: usuarioCreado?.id || Date.now(),
            name: usuarioCreado?.name || nuevoUsuario.name || nuevoUsuario.nombre,
            username: usuarioCreado?.username || nuevoUsuario.username,
            email: usuarioCreado?.email || nuevoUsuario.email,
            telefono: usuarioCreado?.telefono || usuarioCreado?.phone || nuevoUsuario.telefono,
            website: usuarioCreado?.website || nuevoUsuario.website
        };
        agregarUsuarioEstado(usuarioConId);
        formulario.reset();
        if (renderFn) renderFn();
        notificarExito('Usuario registrado correctamente');
        return true;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        notificarError('Hubo un error al registrar el usuario');
        return false;
    }
};

/**
 * Actualiza un usuario existente.
 */
export const procesarActualizacionUsuario = async (usuarioId, datosActualizados, helpers) => {
    try {
        const usuarioActualizado = await updateUsuario(usuarioId, datosActualizados);
        // Combinar con los datos locales para no perder campos que la API no devuelve
        const datosFinal = { ...datosActualizados, id: usuarioId };
        actualizarUsuarioEnEstado(usuarioId, datosFinal);
        helpers.actualizarTarjetaEnDOM(usuarioId, datosFinal);
        helpers.resetearFormulario();
        if (helpers.renderFn) helpers.renderFn();
        notificarExito('Usuario actualizado correctamente');
        return true;
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        notificarError('Hubo un error al actualizar el usuario');
        return false;
    }
};

/**
 * Elimina un usuario del sistema.
 */
export const procesarEliminacionUsuario = async (usuarioId, tarjetaDOM, renderFn) => {
    const confirmar = await mostrarConfirmacion('¿Deseas eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    try {
        const eliminado = await deleteUsuario(usuarioId);
        if (eliminado) {
            eliminarUsuarioDelEstado(usuarioId);
            tarjetaDOM.remove();
            notificarExito('Usuario eliminado correctamente');
            if (renderFn) renderFn();
        } else {
            notificarError('No se pudo eliminar el usuario');
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        notificarError('Ocurrió un error al eliminar el usuario');
    }
};
