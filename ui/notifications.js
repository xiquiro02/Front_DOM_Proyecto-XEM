/**
 * Módulo: notifications.js
 * Objetivo: Gestionar y mostrar notificaciones visuales (éxito, error, información).
 *
 * Módulo completamente independiente: no depende de la API ni de ningún otro módulo.
 * Puede ser reutilizado desde cualquier parte de la aplicación importando sus funciones.
 */

// ==========================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================

const TIPOS = {
    exito:       { clase: 'notification--success', icono: '✅', duracion: 3500 },
    error:       { clase: 'notification--error',   icono: '❌', duracion: 5000 },
    informacion: { clase: 'notification--info',    icono: 'ℹ️', duracion: 3500 },
};

const ID_CONTENEDOR = 'notificationsContainer';

// ==========================================
// FUNCIÓN PRIVADA: obtener/crear contenedor
// ==========================================

/**
 * Retorna el contenedor de notificaciones del DOM.
 * Si no existe, lo crea e inyecta en el <body>.
 * @returns {HTMLElement}
 */
const obtenerContenedor = () => {
    let contenedor = document.getElementById(ID_CONTENEDOR);
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = ID_CONTENEDOR;
        contenedor.className = 'notifications-container';
        contenedor.setAttribute('aria-live', 'polite');
        contenedor.setAttribute('aria-label', 'Notificaciones');
        document.body.appendChild(contenedor);
    }
    return contenedor;
};

// ==========================================
// FUNCIÓN PRIVADA: construir elemento
// ==========================================

/**
 * Crea el elemento DOM de una notificación.
 * @param {string} mensaje - Texto a mostrar.
 * @param {Object} config  - Configuración del tipo ({ clase, icono }).
 * @returns {HTMLElement}
 */
const crearElementoNotificacion = (mensaje, config) => {
    const notif = document.createElement('div');
    notif.className = `notification ${config.clase}`;
    notif.setAttribute('role', 'alert');

    const spanIcono = document.createElement('span');
    spanIcono.className = 'notification__icono';
    spanIcono.textContent = config.icono;

    const spanMensaje = document.createElement('span');
    spanMensaje.className = 'notification__mensaje';
    spanMensaje.textContent = mensaje;

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'notification__cerrar';
    btnCerrar.setAttribute('aria-label', 'Cerrar notificación');
    btnCerrar.textContent = '✕';
    btnCerrar.addEventListener('click', () => cerrarNotificacion(notif));

    notif.append(spanIcono, spanMensaje, btnCerrar);
    return notif;
};

// ==========================================
// FUNCIÓN PRIVADA: cerrar notificación
// ==========================================

/**
 * Aplica la animación de salida y elimina el elemento del DOM.
 * @param {HTMLElement} elemento - El elemento de notificación a cerrar.
 */
const cerrarNotificacion = (elemento) => {
    elemento.classList.add('notification--saliendo');

    let ejecutado = false;
    const eliminar = () => {
        if (ejecutado) return;
        ejecutado = true;
        elemento.remove();
    };

    elemento.addEventListener('animationend', eliminar, { once: true });
    setTimeout(eliminar, 400);
};

// ==========================================
// FUNCIÓN CENTRAL: mostrar notificación
// ==========================================

/**
 * Muestra una notificación en pantalla.
 * @param {string} mensaje  - Texto del mensaje.
 * @param {'exito'|'error'|'informacion'} tipo - Tipo de notificación.
 */
export const mostrarNotificacion = (mensaje, tipo = 'informacion') => {
    const config = TIPOS[tipo] ?? TIPOS.informacion;
    const contenedor = obtenerContenedor();
    const elemento = crearElementoNotificacion(mensaje, config);

    contenedor.appendChild(elemento);

    // Auto-cierre después del tiempo configurado
    setTimeout(() => {
        if (elemento.isConnected) {
            cerrarNotificacion(elemento);
        }
    }, config.duracion);
};

// ==========================================
// FUNCIÓN PÚBLICA: diálogo de confirmación
// ==========================================

/**
 * Muestra un diálogo de confirmación modal no bloqueante.
 * Devuelve una Promise<boolean>: true si el usuario confirma, false si cancela.
 * @param {string} mensaje - Texto de la pregunta a mostrar.
 * @returns {Promise<boolean>}
 */
export const mostrarConfirmacion = (mensaje) => {
    return new Promise((resolve) => {
        // Guardar el elemento que tenía el foco antes de abrir el diálogo
        const elementoAnterior = document.activeElement;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        // Caja del diálogo
        const caja = document.createElement('div');
        caja.className = 'confirm-dialog';

        // Ícono
        const icono = document.createElement('div');
        icono.className = 'confirm-dialog__icono';
        icono.textContent = '⚠️';

        // Mensaje
        const parrafo = document.createElement('p');
        parrafo.className = 'confirm-dialog__mensaje';
        parrafo.textContent = mensaje;

        // Botones
        const contenedorBtns = document.createElement('div');
        contenedorBtns.className = 'confirm-dialog__botones';

        const btnConfirmar = document.createElement('button');
        btnConfirmar.className = 'btn btn--danger confirm-dialog__btn-confirmar';
        btnConfirmar.textContent = 'Eliminar';

        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn btn--secondary confirm-dialog__btn-cancelar';
        btnCancelar.textContent = 'Cancelar';

        const cerrarDialog = (resultado) => {
            overlay.classList.add('confirm-overlay--saliendo');

            let ejecutado = false;
            const limpiar = () => {
                if (ejecutado) return;
                ejecutado = true;
                overlay.remove();
                if (elementoAnterior && typeof elementoAnterior.focus === 'function') {
                    elementoAnterior.focus();
                }
                resolve(resultado);
            };

            overlay.addEventListener('animationend', limpiar, { once: true });
            // Fallback: si la animación no dispara, limpiar igualmente
            setTimeout(limpiar, 400);
        };

        btnConfirmar.addEventListener('click', () => cerrarDialog(true));
        btnCancelar.addEventListener('click', () => cerrarDialog(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarDialog(false); });

        contenedorBtns.append(btnCancelar, btnConfirmar);
        caja.append(icono, parrafo, contenedorBtns);
        overlay.append(caja);
        document.body.appendChild(overlay);

        // Focus al botón cancelar por defecto (mejor UX)
        btnCancelar.focus();
    });
};

// ==========================================
// ATAJOS PÚBLICOS (API del módulo)
// ==========================================

/**
 * Muestra una notificación de éxito (verde).
 * @param {string} mensaje
 */
export const notificarExito = (mensaje) => mostrarNotificacion(mensaje, 'exito');

/**
 * Muestra una notificación de error (rojo).
 * @param {string} mensaje
 */
export const notificarError = (mensaje) => mostrarNotificacion(mensaje, 'error');

/**
 * Muestra una notificación informativa (azul).
 * @param {string} mensaje
 */
export const notificarInfo = (mensaje) => mostrarNotificacion(mensaje, 'informacion');
