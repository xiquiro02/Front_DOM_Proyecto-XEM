/**
 * Archivo Principal Admin: main.js
 * Objetivo: Controlar el módulo de administración de usuarios.
 *           Maneja eventos, estado y conecta con servicios y UI.
 */
// Importación de funciones del servicio para gestionar usuarios y tareas
import {
    cargarTodosLosUsuarios,
    procesarCreacionUsuario,
    procesarActualizacionUsuario,
    procesarEliminacionUsuario,
    obtenerTodosLosUsuarios,
    asignarTareaAVariosUsuarios,
    guardarUsuarios
} from '../../services/index.js';
// Importación de componentes de la interfaz de usuario para renderizado y avisos
import { armarListaUsuarios, notificarError, notificarInfo } from '../../ui/index.js';

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
// Referencia al formulario de entrada de datos del usuario
const formulario = document.getElementById('userForm');
// Campo de texto para capturar el nombre real del usuario
const inputNombre = document.getElementById('userName');
// Campo de texto para el identificador único o nickname
const inputUsername = document.getElementById('userUsername');
// Campo para la dirección de correo electrónico institucional o personal
const inputEmail = document.getElementById('userEmail');
// Campo numérico o de texto para el contacto telefónico
const inputPhone = document.getElementById('userPhone');
// Botón principal para enviar la información del formulario
const btnSubmit = document.getElementById('submitUserBtn');
// Botón para abortar la edición y volver al modo de registro
const btnCancelar = document.getElementById('cancelEditBtn');
// Etiqueta de título que cambia entre "Registrar" y "Editar"
const formTitulo = document.getElementById('formTitle');
// Contenedor principal donde se inyectarán las tarjetas de los usuarios
const contenedorUsuarios = document.getElementById('usersContainer');
// Barra de búsqueda para filtrar usuarios dinámicamente
const inputBusqueda = document.getElementById('searchUser');
// Botón para disparar la carga inicial de datos desde el servidor
const btnCargar = document.getElementById('loadUsersBtn');
// Pequeño indicador que muestra la cantidad de registros encontrados
const totalBadge = document.getElementById('totalBadge');
// Contenedor para mostrar mensajes de error específicos bajo el nombre
const userNameError = document.getElementById('userNameError');
// Contenedor para errores relacionados con el nombre de usuario
const userUsernameError = document.getElementById('userUsernameError');
// Contenedor para fallos de validación en el formato del email
const userEmailError = document.getElementById('userEmailError');
// Contenedor para avisar sobre errores en el campo de teléfono
const userPhoneError = document.getElementById('userPhoneError');

// ==========================================
// ESTADO LOCAL
// ==========================================
// Bandera que indica si el sistema está procesando una edición de un usuario existente
let modoEdicion = false;
// Almacena temporalmente el ID del usuario que se está modificando
let usuarioActualId = null;

// ==========================================
// FUNCIÓN CENTRAL: RENDERIZAR LISTA
// ==========================================
/**
 * Se encarga de transformar los datos en elementos visuales del DOM
 */
function renderUsuarios(lista) {
    // Si no recibe una lista específica, consulta el estado global del servicio
    const usuarios = lista ?? obtenerTodosLosUsuarios();
    // Delega la construcción de las tarjetas a la capa de UI
    armarListaUsuarios(contenedorUsuarios, usuarios);
    // Actualiza el contador visual de usuarios en pantalla
    actualizarTotal(usuarios.length);

    // Si es una búsqueda sin resultados y hay término de búsqueda, mostrar mensaje específico
    // Captura el valor actual del filtro de búsqueda
    const terminoBusqueda = inputBusqueda.value.trim();
    // Condición para mostrar un aviso visual cuando la búsqueda es fallida
    if (usuarios.length === 0 && terminoBusqueda !== '') {
        // Inyecta un bloque HTML de aviso decorativo para el usuario
        contenedorUsuarios.innerHTML = `
            <div class="filter-no-results">
                <div class="filter-no-results__icon">🔍</div>
                <p class="filter-no-results__text">No se encontraron usuarios</p>
                <p class="filter-no-results__sub">No hay resultados para "${terminoBusqueda}"</p>
            </div>
        `;
    }
}

/**
 * Actualiza el texto del badge con la cantidad de usuarios presentes
 */
function actualizarTotal(cantidad) {
    // Verifica que el elemento exista antes de intentar manipularlo
    if (!totalBadge) return;
    // Construye la cadena de texto gramaticalmente correcta según el número
    totalBadge.textContent = `${cantidad} usuario${cantidad !== 1 ? 's' : ''} en total`;
}

// ==========================================
// EVENTO 1: CARGAR TODOS LOS USUARIOS
// ==========================================
// Escucha el clic para traer la base de datos completa de usuarios
btnCargar.addEventListener('click', async () => {
    // Llama al servicio de carga y proporciona una función de retorno para refrescar la vista
    await cargarTodosLosUsuarios(contenedorUsuarios, () => renderUsuarios());
});

// ==========================================
// EVENTO 2: BUSCAR USUARIO EN TIEMPO REAL (API)
// ==========================================
// Manejador para el control de tiempo entre pulsaciones de teclas (debouncing)
let debounceTimer;
// Escucha cada pulsación en la barra de búsqueda superior
inputBusqueda.addEventListener('input', async () => {
    // Normaliza el texto de búsqueda para comparaciones seguras
    const termino = inputBusqueda.value.trim().toLowerCase();

    // Limpiar timer anterior para reiniciar la espera
    clearTimeout(debounceTimer);

    // Verifica si el campo de búsqueda ha sido limpiado por completo
    if (termino === '') {
        // Si está vacío, mostrar todos los usuarios cargados o mensaje inicial
        // Recupera la base de datos local
        const todos = obtenerTodosLosUsuarios();
        // Redibuja la lista original sin filtros aplicados
        renderUsuarios(todos.length > 0 ? todos : []);
        // Finaliza la ejecución del evento de búsqueda
        return;
    }

    // Mostrar estado de búsqueda mientras se espera la respuesta
    // Inyecta un indicador de carga temporal en la lista
    contenedorUsuarios.innerHTML = '<p class="loading-text">Buscando usuarios...</p>';

    // Debounce para no saturar la API con peticiones excesivas
    // Inicia un temporizador que se ejecutará solo tras una pausa en la escritura
    debounceTimer = setTimeout(async () => {
        try {
            // Importar getAllUsers directamente para buscar en API (carga diferida)
            const { getAllUsers } = await import('../../api/index.js');
            // Solicita los datos frescos desde el servidor remoto
            const todosUsuarios = await getAllUsers();

            // Filtrar localmente los resultados según nombre, username o email
            const filtrados = todosUsuarios.filter(u =>
                u.name?.toLowerCase().includes(termino) ||
                u.username?.toLowerCase().includes(termino) ||
                u.email?.toLowerCase().includes(termino)
            );

            // Guardar resultados en el estado local para que las acciones funcionen
            // Sincroniza el servicio local con los datos filtrados
            guardarUsuarios(filtrados);

            // Refresca la interfaz con los resultados de la búsqueda
            renderUsuarios(filtrados);

            // Actualizar contador con la nueva cantidad de coincidencias
            actualizarTotal(filtrados.length);

        } catch (error) {
            // Registro del error en consola para desarrolladores
            console.error('Error buscando usuarios:', error);
            // Inyecta un aviso de error visual en el área de la lista
            contenedorUsuarios.innerHTML = `
                <div class="filter-no-results">
                    <div class="filter-no-results__icon">❌</div>
                    <p class="filter-no-results__text">Error al buscar usuarios</p>
                    <p class="filter-no-results__sub">Intenta de nuevo más tarde</p>
                </div>
            `;
        }
    }, 300); // 300ms de debounce para optimizar rendimiento
});

// ==========================================
// EVENTO 3: CREAR O ACTUALIZAR USUARIO
// ==========================================
// Controla el envío del formulario de registro y edición
formulario.addEventListener('submit', async (evento) => {
    // Detiene el refresco automático de la página por el navegador
    evento.preventDefault();

    // Limpiar errores previos para una validación fresca
    // Agrupa los campos para un procesamiento masivo
    const inputs = [inputNombre, inputUsername, inputEmail, inputPhone];
    // Elimina la decoración visual de error de todos los campos
    inputs.forEach(input => input.classList.remove('error'));
    // Limpia el texto informativo de los mensajes de error
    userNameError.textContent = '';
    userUsernameError.textContent = '';
    userEmailError.textContent = '';
    userPhoneError.textContent = '';

    // Agrupa los valores actuales en un objeto de datos procesable
    const datos = {
        name: inputNombre.value.trim(),
        username: inputUsername.value.trim(),
        email: inputEmail.value.trim(),
        telefono: inputPhone.value.trim(),
    };

    // Estado inicial de la validación del lado del cliente
    let esValido = true;

    // Validación: El nombre real no puede quedar vacío
    if (!datos.name) {
        inputNombre.classList.add('error');
        userNameError.textContent = 'El nombre completo es obligatorio';
        esValido = false;
    }

    // Validación: El apodo de usuario es un requisito indispensable
    if (!datos.username) {
        inputUsername.classList.add('error');
        userUsernameError.textContent = 'El nombre de usuario es obligatorio';
        esValido = false;
    }

    // Patron de expresión regular para validar la estructura del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Comprobación de existencia y formato del correo electrónico
    if (!datos.email) {
        inputEmail.classList.add('error');
        userEmailError.textContent = 'El correo electrónico es obligatorio';
        esValido = false;
    } else if (!emailRegex.test(datos.email)) {
        inputEmail.classList.add('error');
        userEmailError.textContent = 'Introduce un correo válido';
        esValido = false;
    }

    // Validación: El número telefónico es obligatorio para el contacto
    if (!datos.telefono) {
        inputPhone.classList.add('error');
        userPhoneError.textContent = 'El teléfono es obligatorio';
        esValido = false;
    }

    // Si algún campo falló, detiene el proceso y avisa al administrador
    if (!esValido) {
        notificarError('Por favor, corrige los errores en el formulario');
        return;
    }

    // Bifurcación lógica según el estado actual de la pantalla (Crear vs Editar)
    if (modoEdicion) {
        // --------- MODO EDICIÓN ---------
        // Prepara los métodos de ayuda que el servicio llamará tras el éxito
        const helpers = {
            actualizarTarjetaEnDOM,
            resetearFormulario,
            renderFn: () => renderUsuarios(),
        };
        // Llama al servicio de actualización parcial de datos
        await procesarActualizacionUsuario(usuarioActualId, datos, helpers);

    } else {
        // --------- MODO CREACIÓN ---------
        // Llama al servicio de alta de nuevo usuario en el sistema
        await procesarCreacionUsuario(datos, formulario, () => renderUsuarios());
    }
});

// ==========================================
// EVENTO 4: CLICK EN LA LISTA (editar/eliminar)
// ==========================================
// Delegación de eventos: captura clics en cualquier parte de la lista dinámica
contenedorUsuarios.addEventListener('click', async (evento) => {
    // Identifica el ID del usuario objetivo desde el atributo del elemento clicado
    const id = evento.target.getAttribute('data-id');
    // Si el clic no fue en un botón con ID, ignora la acción
    if (!id) return;

    // -------- ELIMINAR --------
    // Verifica si se presionó el botón de borrado de registro
    if (evento.target.classList.contains('btn-eliminar-usuario')) {
        // Localiza la tarjeta física que debe removerse visualmente o marcarse
        const tarjeta = evento.target.closest('.user-card');
        // Delega el proceso de baja al servicio administrativo correspondiente
        await procesarEliminacionUsuario(id, tarjeta, () => renderUsuarios());
    }

    // -------- EDITAR --------
    // Verifica si se solicitó la modificación de los datos del usuario
    if (evento.target.classList.contains('btn-editar-usuario')) {
        // Encuentra la tarjeta del DOM para extraer los datos visuales actuales
        const tarjeta = evento.target.closest('.user-card');

        // Extrae la información actual de los campos de la tarjeta con fallbacks seguros
        const nombre = tarjeta.querySelector('.message-author')?.textContent ?? '';
        // Limpia el prefijo descriptivo de los campos de texto
        const username = tarjeta.querySelector('.user-username')?.textContent.replace(/.*:\s*/, '') ?? '';
        const email = tarjeta.querySelector('.user-email')?.textContent.replace(/.*:\s*/, '') ?? '';
        const phone = tarjeta.querySelector('.user-phone')?.textContent.replace(/.*:\s*/, '') ?? '';

        // Cambia el estado del sistema a modo de edición global
        modoEdicion = true;
        // Asigna el identificador del usuario que será el blanco de la actualización
        usuarioActualId = id;

        // Rellena los campos del formulario con la información capturada de la tarjeta
        inputNombre.value = nombre;
        inputUsername.value = username;
        inputEmail.value = email;
        inputPhone.value = phone;

        // Actualiza las etiquetas visuales para reflejar la acción de edición
        formTitulo.textContent = 'Editar Usuario';
        // Ajusta el texto del botón de acción principal
        btnSubmit.querySelector('.btn__text').textContent = 'Actualizar Usuario';
        // Hace visible el botón para salir del modo de edición
        btnCancelar.classList.remove('hidden');

        // Desplaza la vista suavemente hasta la sección del formulario
        document.getElementById('userFormSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// EVENTO 5: CANCELAR EDICIÓN
// ==========================================
// Vincula el botón de cancelación con la limpieza integral del formulario
btnCancelar.addEventListener('click', resetearFormulario);

// ==========================================
// HELPERS
// ==========================================

/**
 * Actualiza los datos visibles en una tarjeta del DOM sin re-renderizar todo.
 */
function actualizarTarjetaEnDOM(id, datos) {
    // Localiza la instancia física del usuario en el listado actual
    const tarjeta = document.querySelector(`.user-card[data-id="${id}"]`);
    // Si la tarjeta no se encuentra (por filtrado), cancela la actualización visual
    if (!tarjeta) return;

    // Función interna para actualizar etiquetas manteniendo el prefijo del campo
    const upd = (clase, valor) => {
        // Busca el sub-elemento específico dentro de la tarjeta
        const el = tarjeta.querySelector(`.${clase}`);
        // Verifica que el elemento y el nuevo valor sean válidos
        if (el && valor) {
            // Lee el contenido actual para procesar el reemplazo
            const currentText = el.textContent || "";
            // Sustituye el valor antiguo por el nuevo tras el separador ":"
            el.textContent = currentText.replace(/:\s.*/, `: ${valor}`);
        }
    };

    // Actualiza el nombre principal que no lleva prefijo
    tarjeta.querySelector('.message-author').textContent = datos.name;
    // Actualiza los campos detallados usando la función de ayuda interna
    upd('user-username', datos.username);
    upd('user-email', datos.email);
    upd('user-phone', datos.telefono);
}

/**
 * Resetea el formulario al modo de creación.
 */
function resetearFormulario() {
    // Apaga la bandera de edición para volver al registro estándar
    modoEdicion = false;
    // Elimina la referencia al ID del usuario en curso
    usuarioActualId = null;
    // Ordena al formulario vaciar todos sus controles de entrada
    formulario.reset();
    
    // Limpiar errores al cancelar/resetear para dejar la interfaz limpia
    // Agrupa los controles que podrían tener estilos de error aplicados
    const inputs = [inputNombre, inputUsername, inputEmail, inputPhone];
    // Remueve las clases CSS de error de cada control
    inputs.forEach(input => input.classList.remove('error'));
    // Vacia los contenedores de texto de error si están presentes en el DOM
    if (userNameError) userNameError.textContent = '';
    if (userUsernameError) userUsernameError.textContent = '';
    if (userEmailError) userEmailError.textContent = '';
    if (userPhoneError) userPhoneError.textContent = '';

    // Restaura los títulos de la sección a su estado inicial de "Registro"
    formTitulo.textContent = 'Registrar Nuevo Usuario';
    // Repone el texto por defecto en el botón principal
    btnSubmit.querySelector('.btn__text').textContent = 'Registrar Usuario';
    // Oculta el botón de cancelación puesto que ya no es necesario
    btnCancelar.classList.add('hidden');
}
