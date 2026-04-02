/**
 * Archivo Principal Admin: main.js
 * Objetivo: Controlar el módulo de administración de usuarios.
 *           Maneja eventos, estado y conecta con servicios y UI.
 */
import {
    cargarTodosLosUsuarios,
    procesarCreacionUsuario,
    procesarActualizacionUsuario,
    procesarEliminacionUsuario,
    obtenerTodosLosUsuarios,
    asignarTareaAVariosUsuarios,
    guardarUsuarios
} from '../../services/index.js';
import { armarListaUsuarios, notificarError, notificarInfo } from '../../ui/index.js';

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
const formulario = document.getElementById('userForm');
const inputNombre = document.getElementById('userName');
const inputUsername = document.getElementById('userUsername');
const inputEmail = document.getElementById('userEmail');
const inputPhone = document.getElementById('userPhone');
const btnSubmit = document.getElementById('submitUserBtn');
const btnCancelar = document.getElementById('cancelEditBtn');
const formTitulo = document.getElementById('formTitle');
const contenedorUsuarios = document.getElementById('usersContainer');
const inputBusqueda = document.getElementById('searchUser');
const btnCargar = document.getElementById('loadUsersBtn');
const totalBadge = document.getElementById('totalBadge');
const userNameError = document.getElementById('userNameError');
const userUsernameError = document.getElementById('userUsernameError');
const userEmailError = document.getElementById('userEmailError');
const userPhoneError = document.getElementById('userPhoneError');

// ==========================================
// ESTADO LOCAL
// ==========================================
let modoEdicion = false;
let usuarioActualId = null;

// ==========================================
// FUNCIÓN CENTRAL: RENDERIZAR LISTA
// ==========================================
function renderUsuarios(lista) {
    const usuarios = lista ?? obtenerTodosLosUsuarios();
    armarListaUsuarios(contenedorUsuarios, usuarios);
    actualizarTotal(usuarios.length);

    // Si es una búsqueda sin resultados y hay término de búsqueda, mostrar mensaje específico
    const terminoBusqueda = inputBusqueda.value.trim();
    if (usuarios.length === 0 && terminoBusqueda !== '') {
        contenedorUsuarios.innerHTML = `
            <div class="filter-no-results">
                <div class="filter-no-results__icon">🔍</div>
                <p class="filter-no-results__text">No se encontraron usuarios</p>
                <p class="filter-no-results__sub">No hay resultados para "${terminoBusqueda}"</p>
            </div>
        `;
    }
}

function actualizarTotal(cantidad) {
    if (!totalBadge) return;
    totalBadge.textContent = `${cantidad} usuario${cantidad !== 1 ? 's' : ''} en total`;
}

// ==========================================
// EVENTO 1: CARGAR TODOS LOS USUARIOS
// ==========================================
btnCargar.addEventListener('click', async () => {
    await cargarTodosLosUsuarios(contenedorUsuarios, () => renderUsuarios());
});

// ==========================================
// EVENTO 2: BUSCAR USUARIO EN TIEMPO REAL (API)
// ==========================================
let debounceTimer;
inputBusqueda.addEventListener('input', async () => {
    const termino = inputBusqueda.value.trim().toLowerCase();

    // Limpiar timer anterior
    clearTimeout(debounceTimer);

    if (termino === '') {
        // Si está vacío, mostrar todos los usuarios cargados o mensaje inicial
        const todos = obtenerTodosLosUsuarios();
        renderUsuarios(todos.length > 0 ? todos : []);
        return;
    }

    // Mostrar estado de búsqueda
    contenedorUsuarios.innerHTML = '<p class="loading-text">Buscando usuarios...</p>';

    // Debounce para no saturar la API
    debounceTimer = setTimeout(async () => {
        try {
            // Importar getAllUsers directamente para buscar en API
            const { getAllUsers } = await import('../../api/index.js');
            const todosUsuarios = await getAllUsers();

            // Filtrar localmente los resultados
            const filtrados = todosUsuarios.filter(u =>
                u.name?.toLowerCase().includes(termino) ||
                u.username?.toLowerCase().includes(termino) ||
                u.email?.toLowerCase().includes(termino)
            );

            // Guardar resultados en el estado local para que las acciones funcionen
            guardarUsuarios(filtrados);

            renderUsuarios(filtrados);

            // Actualizar contador
            actualizarTotal(filtrados.length);

        } catch (error) {
            console.error('Error buscando usuarios:', error);
            contenedorUsuarios.innerHTML = `
                <div class="filter-no-results">
                    <div class="filter-no-results__icon">❌</div>
                    <p class="filter-no-results__text">Error al buscar usuarios</p>
                    <p class="filter-no-results__sub">Intenta de nuevo más tarde</p>
                </div>
            `;
        }
    }, 300); // 300ms de debounce
});

// ==========================================
// EVENTO 3: CREAR O ACTUALIZAR USUARIO
// ==========================================
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // Limpiar errores previos
    const inputs = [inputNombre, inputUsername, inputEmail, inputPhone];
    inputs.forEach(input => input.classList.remove('error'));
    userNameError.textContent = '';
    userUsernameError.textContent = '';
    userEmailError.textContent = '';
    userPhoneError.textContent = '';

    const datos = {
        name: inputNombre.value.trim(),
        username: inputUsername.value.trim(),
        email: inputEmail.value.trim(),
        telefono: inputPhone.value.trim(),
    };

    let esValido = true;

    if (!datos.name) {
        inputNombre.classList.add('error');
        userNameError.textContent = 'El nombre completo es obligatorio';
        esValido = false;
    }

    if (!datos.username) {
        inputUsername.classList.add('error');
        userUsernameError.textContent = 'El nombre de usuario es obligatorio';
        esValido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email) {
        inputEmail.classList.add('error');
        userEmailError.textContent = 'El correo electrónico es obligatorio';
        esValido = false;
    } else if (!emailRegex.test(datos.email)) {
        inputEmail.classList.add('error');
        userEmailError.textContent = 'Introduce un correo válido';
        esValido = false;
    }

    if (!datos.telefono) {
        inputPhone.classList.add('error');
        userPhoneError.textContent = 'El teléfono es obligatorio';
        esValido = false;
    }

    if (!esValido) {
        notificarError('Por favor, corrige los errores en el formulario');
        return;
    }

    if (modoEdicion) {
        // --------- MODO EDICIÓN ---------
        const helpers = {
            actualizarTarjetaEnDOM,
            resetearFormulario,
            renderFn: () => renderUsuarios(),
        };
        await procesarActualizacionUsuario(usuarioActualId, datos, helpers);

    } else {
        // --------- MODO CREACIÓN ---------
        await procesarCreacionUsuario(datos, formulario, () => renderUsuarios());
    }
});

// ==========================================
// EVENTO 4: CLICK EN LA LISTA (editar/eliminar)
// ==========================================
contenedorUsuarios.addEventListener('click', async (evento) => {
    const id = evento.target.getAttribute('data-id');
    if (!id) return;

    // -------- ELIMINAR --------
    if (evento.target.classList.contains('btn-eliminar-usuario')) {
        const tarjeta = evento.target.closest('.user-card');
        await procesarEliminacionUsuario(id, tarjeta, () => renderUsuarios());
    }

    // -------- EDITAR --------
    if (evento.target.classList.contains('btn-editar-usuario')) {
        const tarjeta = evento.target.closest('.user-card');

        const nombre = tarjeta.querySelector('.message-author')?.textContent ?? '';
        const username = tarjeta.querySelector('.user-username')?.textContent.replace(/.*:\s*/, '') ?? '';
        const email = tarjeta.querySelector('.user-email')?.textContent.replace(/.*:\s*/, '') ?? '';
        const phone = tarjeta.querySelector('.user-phone')?.textContent.replace(/.*:\s*/, '') ?? '';

        modoEdicion = true;
        usuarioActualId = id;

        inputNombre.value = nombre;
        inputUsername.value = username;
        inputEmail.value = email;
        inputPhone.value = phone;

        formTitulo.textContent = 'Editar Usuario';
        btnSubmit.querySelector('.btn__text').textContent = 'Actualizar Usuario';
        btnCancelar.classList.remove('hidden');

        document.getElementById('userFormSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// EVENTO 5: CANCELAR EDICIÓN
// ==========================================
btnCancelar.addEventListener('click', resetearFormulario);

// ==========================================
// HELPERS
// ==========================================

/**
 * Actualiza los datos visibles en una tarjeta del DOM sin re-renderizar todo.
 */
function actualizarTarjetaEnDOM(id, datos) {
    const tarjeta = document.querySelector(`.user-card[data-id="${id}"]`);
    if (!tarjeta) return;

    const upd = (clase, valor) => {
        const el = tarjeta.querySelector(`.${clase}`);
        // En lugar de reemplazo innerHTML, asumimos que la estructura es texto simple o usamos textContent
        if (el && valor) {
            const currentText = el.textContent || "";
            el.textContent = currentText.replace(/:\s.*/, `: ${valor}`);
        }
    };

    tarjeta.querySelector('.message-author').textContent = datos.name;
    upd('user-username', datos.username);
    upd('user-email', datos.email);
    upd('user-phone', datos.telefono);
}

/**
 * Resetea el formulario al modo de creación.
 */
function resetearFormulario() {
    modoEdicion = false;
    usuarioActualId = null;
    formulario.reset();
    
    // Limpiar errores al cancelar/resetear
    const inputs = [inputNombre, inputUsername, inputEmail, inputPhone];
    inputs.forEach(input => input.classList.remove('error'));
    if (userNameError) userNameError.textContent = '';
    if (userUsernameError) userUsernameError.textContent = '';
    if (userEmailError) userEmailError.textContent = '';
    if (userPhoneError) userPhoneError.textContent = '';

    formTitulo.textContent = 'Registrar Nuevo Usuario';
    btnSubmit.querySelector('.btn__text').textContent = 'Registrar Usuario';
    btnCancelar.classList.add('hidden');
}
