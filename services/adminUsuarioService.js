/**
 * Servicio Admin: adminUsuarioService.js
 */
// Importa las funciones CRUD de comunicación con la API de usuarios
import { getAllUsers, createUsuario, updateUsuario, deleteUsuario } from '../api/index.js';
// Importa funciones de la UI para gestionar el listado físico y notificaciones
import { armarListaUsuarios, notificarExito, notificarError, mostrarConfirmacion } from '../ui/index.js';

// ==========================================
// ESTADO INTERNO (Fuente de Verdad en Memoria)
// ==========================================
// Almacena la lista completa de usuarios del sistema cargada en la sesión actual
let todosLosUsuarios = [];

// Actualiza masivamente el listado de usuarios local
export const guardarUsuarios = (usuarios) => { todosLosUsuarios = usuarios; };
// Expone una copia del listado de usuarios para evitar mutaciones externas
export const obtenerTodosLosUsuarios = () => [...todosLosUsuarios];

// Inserta un nuevo usuario al final de la lista local
export const agregarUsuarioEstado = (usuario) => { todosLosUsuarios.push(usuario); };

// Busca un usuario por ID y sobreescribe sus datos con la nueva información
export const actualizarUsuarioEnEstado = (id, datos) => {
    const index = todosLosUsuarios.findIndex(u => String(u.id) === String(id));
    if (index !== -1) {
        todosLosUsuarios[index] = { ...todosLosUsuarios[index], ...datos };
    }
};

// Excluye permanentemente a un usuario del listado local basándose en su ID
export const eliminarUsuarioDelEstado = (id) => {
    todosLosUsuarios = todosLosUsuarios.filter(u => String(u.id) !== String(id));
};

// ==========================================
// FUNCIONES DE SERVICIO (Lógica de Negocio)
// ==========================================

/**
 * Carga la totalidad de usuarios y gestiona el feedback visual durante el proceso.
 */
export const cargarTodosLosUsuarios = async (contenedor, renderFn) => {
    // Prepara el contenedor del DOM limpiando contenido previo
    contenedor.replaceChildren();
    // Inserta una notificación de 'Cargando' para mejorar la experiencia de usuario
    const pLoading = document.createElement('p');
    pLoading.className = 'loading-text';
    pLoading.textContent = 'Cargando usuarios...';
    contenedor.appendChild(pLoading);
    try {
        // Ejecuta la petición asíncrona para traer los usuarios del servidor
        const usuarios = await getAllUsers();
        // Persiste los datos descargados en el estado local de la aplicación
        status: guardarUsuarios(usuarios);
        // Define si el renderizado se delega o se realiza de forma directa
        if (renderFn) {
            renderFn();
        } else {
            armarListaUsuarios(contenedor, usuarios);
        }
    } catch (error) {
        // Reporta fallos en la carga tanto en consola como visualmente al usuario
        console.error('Error cargando usuarios:', error);
        notificarError('No se pudieron cargar los usuarios');
    }
};

/**
 * Procesa el registro de un nuevo usuario traduciendo campos si es necesario.
 */
export const procesarCreacionUsuario = async (nuevoUsuario, formulario, renderFn) => {
    try {
        // Crea el usuario en el backend y recibe la confirmación con su nuevo ID
        const usuarioCreado = await createUsuario(nuevoUsuario);
        // Mapea la respuesta a la estructura española que utiliza el frontend localmente
        const usuarioConId = {
            id: usuarioCreado?.id || Date.now(),
            name: usuarioCreado?.name || nuevoUsuario.name || nuevoUsuario.nombre,
            username: usuarioCreado?.username || nuevoUsuario.username,
            email: usuarioCreado?.email || nuevoUsuario.email,
            telefono: usuarioCreado?.telefono || usuarioCreado?.phone || nuevoUsuario.telefono,
            website: usuarioCreado?.website || nuevoUsuario.website
        };
        // Actualiza la memoria local con la nueva incorporación
        agregarUsuarioEstado(usuarioConId);
        // Limpia el formulario web para permitir nuevos ingresos
        formulario.reset();
        // Dispara el re-renderizado visual de la tabla o lista
        if (renderFn) renderFn();
        // Emite mensaje de éxito rotundo
        notificarExito('Usuario registrado correctamente');
        return true;
    } catch (error) {
        // Gestión de errores durante la creación de la cuenta
        console.error('Error al crear usuario:', error);
        notificarError('Hubo un error al registrar el usuario');
        return false;
    }
};

/**
 * Coordina la actualización de datos de un usuario entre servidor, estado local y UI.
 */
export const procesarActualizacionUsuario = async (usuarioId, datosActualizados, helpers) => {
    try {
        // Envía la actualización parcial o total al backend
        const usuarioActualizado = await updateUsuario(usuarioId, datosActualizados);
        // Sincroniza los cambios en el array local manteniéndolo íntegro
        const datosFinal = { ...datosActualizados, id: usuarioId };
        actualizarUsuarioEnEstado(usuarioId, datosFinal);
        // Actualiza físicamente el elemento del DOM que representa al usuario
        helpers.actualizarTarjetaEnDOM(usuarioId, datosFinal);
        // Restablece el formulario a su estado original (ej: salir de modo edición)
        helpers.resetearFormulario();
        // Re-renderiza para aplicar ordenamientos o filtros si fuesen necesarios
        if (helpers.renderFn) helpers.renderFn();
        // Informa del éxito en la modificación
        notificarExito('Usuario actualizado correctamente');
        return true;
    } catch (error) {
        // Maneja y reporta fallos en la actualización de perfil
        console.error('Error actualizando usuario:', error);
        notificarError('Hubo un error al actualizar el usuario');
        return false;
    }
};

/**
 * Gestiona la baja de un usuario verificando la intención antes de proceder.
 */
export const procesarEliminacionUsuario = async (usuarioId, tarjetaDOM, renderFn) => {
    // Solicita una confirmación explícita para evitar borrados accidentales
    const confirmar = await mostrarConfirmacion('¿Deseas eliminar este usuario? Esta acción no se puede deshacer.');
    // Aborta el proceso si el sistema no recibe la confirmación
    if (!confirmar) return;

    try {
        // Ejecuta la eliminación definitiva en la base de datos a través de la API
        const eliminado = await deleteUsuario(usuarioId);
        // Una vez confirmado por el backend
        if (eliminado) {
            // Limpia los restos del usuario en el estado y en la vista física
            eliminarUsuarioDelEstado(usuarioId);
            tarjetaDOM.remove();
            // Notifica y actualiza posibles contadores visuales
            notificarExito('Usuario eliminado correctamente');
            if (renderFn) renderFn();
        } else {
            // Informa si el servidor denegó o falló la eliminación
            notificarError('No se pudo eliminar el usuario');
        }
    } catch (error) {
        // Gestión de errores críticos de red o infraestructura
        console.error('Error eliminando usuario:', error);
        notificarError('Ocurrió un error al eliminar el usuario');
    }
};
