/**
 * Módulo: notifications.js
 * Objetivo: Gestionar y mostrar notificaciones visuales (éxito, error, información).
 */

// ==========================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================
// Diccionario que define los estilos, íconos y tiempos de exposición para cada tipo de alerta
const TIPOS = {
    exito:       { clase: 'notification--success', icono: '✅', duracion: 3500 },
    error:       { clase: 'notification--error',   icono: '❌', duracion: 5000 },
    informacion: { clase: 'notification--info',    icono: 'ℹ️', duracion: 3500 },
};

// Identificador único para el nodo raíz donde se inyectarán todas las notificaciones
const ID_CONTENEDOR = 'notificationsContainer';

// ==========================================
// FUNCIÓN PRIVADA: obtener/crear contenedor
// ==========================================

/**
 * Retorna el contenedor de notificaciones del DOM o lo crea si no existe.
 */
const obtenerContenedor = () => {
    // Intenta localizar el contenedor por su ID exclusivo
    let contenedor = document.getElementById(ID_CONTENEDOR);
    // Si no se encuentra (primera ejecución), crea un <div> con atributos de accesibilidad
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = ID_CONTENEDOR;
        contenedor.className = 'notifications-container';
        contenedor.setAttribute('aria-live', 'polite');
        contenedor.setAttribute('aria-label', 'Notificaciones');
        document.body.appendChild(contenedor);
    }
    // Devuelve la referencia al elemento (existente o recién creado)
    return contenedor;
};

// ==========================================
// FUNCIÓN PRIVADA: construir elemento
// ==========================================

/**
 * Crea la estructura DOM de una notificación individual.
 */
const crearElementoNotificacion = (mensaje, config) => {
    // Crea la base de la notificación con sus clases CSS y rol de alerta
    const notif = document.createElement('div');
    notif.className = `notification ${config.clase}`;
    notif.setAttribute('role', 'alert');

    // Crea e inserta el ícono descriptivo (emoji) del tipo de alerta
    const spanIcono = document.createElement('span');
    spanIcono.className = 'notification__icono';
    spanIcono.textContent = config.icono;

    // Crea e inserta el texto del mensaje proporcionado
    const spanMensaje = document.createElement('span');
    spanMensaje.className = 'notification__mensaje';
    spanMensaje.textContent = mensaje;

    // Crea el botón de cierre manual (X) con su escuchador de eventos
    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'notification__cerrar';
    btnCerrar.setAttribute('aria-label', 'Cerrar notificación');
    btnCerrar.textContent = '✕';
    btnCerrar.addEventListener('click', () => cerrarNotificacion(notif));

    // Ensambla y devuelve el componente de notificación completo
    notif.append(spanIcono, spanMensaje, btnCerrar);
    return notif;
};

// ==========================================
// FUNCIÓN PRIVADA: cerrar notificación
// ==========================================

/**
 * Ejecuta la animación de salida y remueve el elemento físicamente.
 */
const cerrarNotificacion = (elemento) => {
    // Dispara la animación de salida mediante una clase CSS
    elemento.classList.add('notification--saliendo');

    let ejecutado = false;
    // Función interna para limpiar el DOM de forma segura
    const eliminar = () => {
        if (ejecutado) return;
        ejecutado = true;
        elemento.remove();
    };

    // Espera a que termine la animación o usa un temporizador de respaldo (fallback)
    elemento.addEventListener('animationend', eliminar, { once: true });
    setTimeout(eliminar, 400);
};

// ==========================================
// FUNCIÓN CENTRAL: mostrar notificación
// ==========================================

/**
 * Orquestador principal para desplegar alertas en la interfaz.
 */
export const mostrarNotificacion = (mensaje, tipo = 'informacion') => {
    // Selecciona la configuración del tipo solicitado o usa 'informacion' como base
    const config = TIPOS[tipo] ?? TIPOS.informacion;
    // Prepara el contenedor y construye el nuevo elemento visual
    const contenedor = obtenerContenedor();
    const elemento = crearElementoNotificacion(mensaje, config);

    // Inyecta la notificación en la pila de alertas del usuario
    contenedor.appendChild(elemento);

    // Configura la autodestrucción de la alerta tras expirar su tiempo de vida
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
 * Despliega un modal interactivo para decisiones críticas del usuario.
 */
export const mostrarConfirmacion = (mensaje) => {
    return new Promise((resolve) => {
        // Almacena el foco actual para restaurarlo al cerrar el diálogo
        const elementoAnterior = document.activeElement;

        // Crea el fondo oscuro bloqueante (overlay)
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        // Construye el cuerpo central del diálogo
        const caja = document.createElement('div');
        caja.className = 'confirm-dialog';

        // Inserta un ícono de advertencia visual
        const icono = document.createElement('div');
        icono.className = 'confirm-dialog__icono';
        icono.textContent = '⚠️';

        // Configura el texto de la pregunta dirigida al usuario
        const parrafo = document.createElement('p');
        parrafo.className = 'confirm-dialog__mensaje';
        parrafo.textContent = mensaje;

        // Contenedor horizontal para los botones de acción
        const contenedorBtns = document.createElement('div');
        contenedorBtns.className = 'confirm-dialog__botones';

        // Botón de acción afirmativa (ej: Eliminar)
        const btnConfirmar = document.createElement('button');
        btnConfirmar.className = 'btn btn--danger confirm-dialog__btn-confirmar';
        btnConfirmar.textContent = 'Eliminar';

        // Botón de acción negativa (ej: Cancelar)
        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn btn--secondary confirm-dialog__btn-cancelar';
        btnCancelar.textContent = 'Cancelar';

        // Lógica de cierre que resuelve la promesa y limpia la interfaz
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
            setTimeout(limpiar, 400);
        };

        // Vincula las acciones del usuario a los botones y al fondo del modal
        btnConfirmar.addEventListener('click', () => cerrarDialog(true));
        btnCancelar.addEventListener('click', () => cerrarDialog(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarDialog(false); });

        // Ensambla y monta el modal completo en el <body>
        contenedorBtns.append(btnCancelar, btnConfirmar);
        caja.append(icono, parrafo, contenedorBtns);
        overlay.append(caja);
        document.body.appendChild(overlay);

        // Facilita la navegación enviando el foco al botón de cancelar (seguridad UX)
        btnCancelar.focus();
    });
};

// ==========================================
// ATAJOS PÚBLICOS (API del módulo)
// ==========================================

// Método rápido para emitir una alerta de éxito
export const notificarExito = (mensaje) => mostrarNotificacion(mensaje, 'exito');

// Método rápido para emitir una alerta de fallo crítico
export const notificarError = (mensaje) => mostrarNotificacion(mensaje, 'error');

// Método rápido para emitir información contextual al usuario
export const notificarInfo = (mensaje) => mostrarNotificacion(mensaje, 'informacion');
