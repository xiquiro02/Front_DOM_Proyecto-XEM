/**
 * Componente: asignarTarea.js
 * Objetivo: Desplegar y gestionar el modal interactivo para asignar tareas masivas a usuarios del sistema.
 */

/**
 * Muestra el modal de configuración de tarea y selección múltiple de destinatarios.
 */
export const mostrarModalAsignarTarea = (usuarios, onConfirmar) => {
    // Preserva el elemento que tiene el foco actual para una navegación accesible (restaurar al cerrar)
    const elementoAnterior = document.activeElement;

    // Prepara el fondo oscuro semitransparente que bloquea el resto de la interfaz (overlay)
    const overlay = document.createElement('div');
    overlay.className = 'asignar-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Asignar tarea a usuarios');

    // Crea el contenedor físico del diálogo (el recuadro blanco central)
    const modal = document.createElement('div');
    modal.className = 'asignar-dialog';

    // Sección superior del modal que contiene el título y el botón de aspa
    const encabezado = document.createElement('div');
    encabezado.className = 'asignar-dialog__header';

    // Título con ícono representativo de la acción a realizar
    const titulo = document.createElement('h2');
    titulo.className = 'asignar-dialog__titulo';
    titulo.textContent = '📋 Asignar Tarea a Usuarios';

    // Botón de cierre (X) situado en la esquina superior derecha
    const btnX = document.createElement('button');
    btnX.className = 'asignar-dialog__cerrar';
    btnX.setAttribute('aria-label', 'Cerrar');
    btnX.textContent = '✕';
    btnX.addEventListener('click', () => cerrar(false));

    // Ensambla el encabezado
    encabezado.append(titulo, btnX);

    // Bloque que contiene los campos de texto para configurar los detalles de la tarea
    const seccionTarea = document.createElement('div');
    seccionTarea.className = 'asignar-dialog__seccion';

    // Etiqueta para el campo obligatorio de Título
    const labelTitulo = document.createElement('label');
    labelTitulo.className = 'form__label';
    labelTitulo.textContent = 'Título de la tarea *';

    // Espacio para ingresar el nombre breve de la actividad
    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.className = 'form__input';
    inputTitulo.placeholder = 'Ej: Revisar informe mensual';
    inputTitulo.id = 'asignar-titulo';

    // Etiqueta para el bloque opcional de descripción detallada
    const labelDesc = document.createElement('label');
    labelDesc.className = 'form__label';
    labelDesc.style.marginTop = '.75rem';
    labelDesc.textContent = 'Descripción';

    // Área de texto expandible para profundizar en los detalles de la tarea
    const inputDesc = document.createElement('textarea');
    inputDesc.className = 'form__input';
    inputDesc.placeholder = 'Descripción opcional...';
    inputDesc.rows = 3;
    inputDesc.style.resize = 'vertical';

    // Etiqueta para seleccionar el estatus inicial que tendrán las nuevas tareas
    const labelEstado = document.createElement('label');
    labelEstado.className = 'form__label';
    labelEstado.style.marginTop = '.75rem';
    labelEstado.textContent = 'Estado inicial';

    // Desplegable con los estados de flujo: Pendiente, Proceso o Completada
    const selectEstado = document.createElement('select');
    selectEstado.className = 'form__input';
    [
        { value: 'pending',     label: '🕐 Pendiente' },
        { value: 'in-progress', label: '⚡ En proceso' },
        { value: 'completed',   label: '✅ Completada' },
    ].forEach(({ value, label }) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        selectEstado.append(opt);
    });

    // Jerarquiza todos los campos dentro de la sección de definición de la tarea
    seccionTarea.append(labelTitulo, inputTitulo, labelDesc, inputDesc, labelEstado, selectEstado);

    // Sección dedicada al listado y selección de los destinatarios
    const seccionUsuarios = document.createElement('div');
    seccionUsuarios.className = 'asignar-dialog__seccion';

    // Mensaje orientativo para el administrador
    const labelUsuarios = document.createElement('p');
    labelUsuarios.className = 'asignar-dialog__subtitulo';
    labelUsuarios.textContent = 'Selecciona los usuarios que recibirán la tarea:';

    // Cintillo superior que ofrece herramientas de selección masiva y estadísticas
    const barra = document.createElement('div');
    barra.className = 'asignar-dialog__barra';

    // Checkbox maestro para marcar o desmarcar a todos de un solo clic
    const chkTodos = document.createElement('input');
    chkTodos.type = 'checkbox';
    chkTodos.id = 'asignar-todos';

    // Texto descriptivo del botón de selección global
    const labelTodos = document.createElement('label');
    labelTodos.htmlFor = 'asignar-todos';
    labelTodos.textContent = 'Seleccionar todos';

    // Contador dinámico que refleja cuántos usuarios han sido marcados actualmente
    const contadorSpan = document.createElement('span');
    contadorSpan.className = 'asignar-dialog__contador';
    contadorSpan.textContent = '0 seleccionados';

    // Ensambla la barra de selección rápida
    barra.append(chkTodos, labelTodos, contadorSpan);

    // Lista con scroll independiente que muestra a cada usuario con su respectiva caja de selección
    const listaUsuarios = document.createElement('div');
    listaUsuarios.className = 'asignar-dialog__lista';

    // Array colector para manipular todos los checkboxes individualmente
    const checkboxes = [];

    // Genera una fila interactiva por cada usuario registrado en el sistema
    usuarios.forEach(usuario => {
        const fila = document.createElement('label');
        fila.className = 'asignar-dialog__usuario-fila';

        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.value = usuario.id;
        chk.addEventListener('change', actualizarContador);
        checkboxes.push(chk);

        const info = document.createElement('span');
        info.className = 'asignar-dialog__usuario-info';
        info.innerHTML = `<strong>${usuario.name}</strong> <span class="asignar-dialog__usuario-sub">@${usuario.username} · ID ${usuario.id}</span>`;

        fila.append(chk, info);
        listaUsuarios.append(fila);
    });

    // Sincroniza todos los checkboxes ante un cambio en el interruptor maestro 'Seleccionar todos'
    chkTodos.addEventListener('change', () => {
        checkboxes.forEach(chk => { chk.checked = chkTodos.checked; });
        actualizarContador();
    });

    // Función inteligente que recalcula el contador y gestiona el estado 'indeterminado' del checkbox maestro
    function actualizarContador() {
        const n = checkboxes.filter(c => c.checked).length;
        contadorSpan.textContent = `${n} seleccionado${n !== 1 ? 's' : ''}`;
        chkTodos.checked = n === checkboxes.length && checkboxes.length > 0;
        chkTodos.indeterminate = n > 0 && n < checkboxes.length;
    }

    // Termina de ensamblar la sección de usuarios
    seccionUsuarios.append(labelUsuarios, barra, listaUsuarios);

    // Franja inferior del modal que contiene los botones de comando (Cancelar / Asignar)
    const pieModal = document.createElement('div');
    pieModal.className = 'asignar-dialog__pie';

    // Botón para abortar el proceso sin realizar cambios
    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn--secondary';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', () => cerrar(false));

    // Botón principal de validación y ejecución de la asignación múltiple
    const btnAsignar = document.createElement('button');
    btnAsignar.className = 'btn btn--primary';
    btnAsignar.textContent = 'Asignar Tarea';
    btnAsignar.addEventListener('click', () => {
        const titulo = inputTitulo.value.trim();
        // Valida que el título no esté vacío antes de proceder
        if (!titulo) {
            inputTitulo.focus();
            inputTitulo.classList.add('form__input--error');
            return;
        }
        inputTitulo.classList.remove('form__input--error');

        // Recopila solo los IDs de los usuarios que han sido marcados por el administrador
        const idsSeleccionados = checkboxes
            .filter(c => c.checked)
            .map(c => Number(c.value));

        // Empaqueta toda la información configurada en un objeto de tarea listo para ser enviado
        const datosTarea = {
            title: titulo,
            body: inputDesc.value.trim(),
            status: selectEstado.value,
            completed: selectEstado.value === 'completed',
        };

        // Resuelve el proceso cerrando la interfaz y disparando la confirmación de datos
        cerrar(true);
        onConfirmar(datosTarea, idsSeleccionados);
    });

    // Une los botones al pie del modal
    pieModal.append(btnCancelar, btnAsignar);

    // Estructuración definitiva del modal y su inyección inmediata en la visualización del usuario
    modal.append(encabezado, seccionTarea, seccionUsuarios, pieModal);
    overlay.append(modal);
    document.body.appendChild(overlay);

    // Envía el foco automáticamente al título para agilizar el proceso de entrada de datos (UX)
    setTimeout(() => inputTitulo.focus(), 50);

    // Permite cerrar el modal haciendo clic en las zonas vacías fuera del recuadro blanco
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrar(false);
    });

    // Orquestador de cierre que gestiona la eliminación del nodo y restaura el estado inicial de la pantalla
    function cerrar(confirmo) {
        overlay.classList.add('asignar-overlay--saliendo');
        let ejecutado = false;
        const limpiar = () => {
            if (ejecutado) return;
            ejecutado = true;
            overlay.remove();
            if (elementoAnterior && typeof elementoAnterior.focus === 'function') {
                elementoAnterior.focus();
            }
        };
        overlay.addEventListener('animationend', limpiar, { once: true });
        setTimeout(limpiar, 400);
    }
};
