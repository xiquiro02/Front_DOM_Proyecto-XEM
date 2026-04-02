/**
 * Componente: asignarTarea.js
 * Objetivo: Mostrar un modal para seleccionar múltiples usuarios y asignarles
 *           la misma tarea. Completamente independiente del módulo API.
 *
 * Exporta:
 * - mostrarModalAsignarTarea(usuarios, onConfirmar)
 */

/**
 * Muestra un modal con checkboxes para seleccionar usuarios.
 * Llama a onConfirmar(datosTarea, idsSeleccionados) cuando el admin confirma.
 *
 * @param {Object[]} usuarios    - Lista completa de usuarios disponibles.
 * @param {Function} onConfirmar - Callback recibe (datosTarea, idsUsuarios[]).
 */
export const mostrarModalAsignarTarea = (usuarios, onConfirmar) => {
    // Guardar foco anterior
    const elementoAnterior = document.activeElement;

    // ---- Overlay ----
    const overlay = document.createElement('div');
    overlay.className = 'asignar-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Asignar tarea a usuarios');

    // ---- Caja del modal ----
    const modal = document.createElement('div');
    modal.className = 'asignar-dialog';

    // ---- Encabezado ----
    const encabezado = document.createElement('div');
    encabezado.className = 'asignar-dialog__header';

    const titulo = document.createElement('h2');
    titulo.className = 'asignar-dialog__titulo';
    titulo.textContent = '📋 Asignar Tarea a Usuarios';

    const btnX = document.createElement('button');
    btnX.className = 'asignar-dialog__cerrar';
    btnX.setAttribute('aria-label', 'Cerrar');
    btnX.textContent = '✕';
    btnX.addEventListener('click', () => cerrar(false));

    encabezado.append(titulo, btnX);

    // ---- Formulario de la tarea ----
    const seccionTarea = document.createElement('div');
    seccionTarea.className = 'asignar-dialog__seccion';

    const labelTitulo = document.createElement('label');
    labelTitulo.className = 'form__label';
    labelTitulo.textContent = 'Título de la tarea *';

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.className = 'form__input';
    inputTitulo.placeholder = 'Ej: Revisar informe mensual';
    inputTitulo.id = 'asignar-titulo';

    const labelDesc = document.createElement('label');
    labelDesc.className = 'form__label';
    labelDesc.style.marginTop = '.75rem';
    labelDesc.textContent = 'Descripción';

    const inputDesc = document.createElement('textarea');
    inputDesc.className = 'form__input';
    inputDesc.placeholder = 'Descripción opcional...';
    inputDesc.rows = 3;
    inputDesc.style.resize = 'vertical';

    const labelEstado = document.createElement('label');
    labelEstado.className = 'form__label';
    labelEstado.style.marginTop = '.75rem';
    labelEstado.textContent = 'Estado inicial';

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

    seccionTarea.append(labelTitulo, inputTitulo, labelDesc, inputDesc, labelEstado, selectEstado);

    // ---- Sección selección de usuarios ----
    const seccionUsuarios = document.createElement('div');
    seccionUsuarios.className = 'asignar-dialog__seccion';

    const labelUsuarios = document.createElement('p');
    labelUsuarios.className = 'asignar-dialog__subtitulo';
    labelUsuarios.textContent = 'Selecciona los usuarios que recibirán la tarea:';

    // Barra: seleccionar todos + contador
    const barra = document.createElement('div');
    barra.className = 'asignar-dialog__barra';

    const chkTodos = document.createElement('input');
    chkTodos.type = 'checkbox';
    chkTodos.id = 'asignar-todos';

    const labelTodos = document.createElement('label');
    labelTodos.htmlFor = 'asignar-todos';
    labelTodos.textContent = 'Seleccionar todos';

    const contadorSpan = document.createElement('span');
    contadorSpan.className = 'asignar-dialog__contador';
    contadorSpan.textContent = '0 seleccionados';

    barra.append(chkTodos, labelTodos, contadorSpan);

    // Lista de checkboxes de usuarios
    const listaUsuarios = document.createElement('div');
    listaUsuarios.className = 'asignar-dialog__lista';

    const checkboxes = [];

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

    chkTodos.addEventListener('change', () => {
        checkboxes.forEach(chk => { chk.checked = chkTodos.checked; });
        actualizarContador();
    });

    function actualizarContador() {
        const n = checkboxes.filter(c => c.checked).length;
        contadorSpan.textContent = `${n} seleccionado${n !== 1 ? 's' : ''}`;
        chkTodos.checked = n === checkboxes.length && checkboxes.length > 0;
        chkTodos.indeterminate = n > 0 && n < checkboxes.length;
    }

    seccionUsuarios.append(labelUsuarios, barra, listaUsuarios);

    // ---- Botones de acción ----
    const pieModal = document.createElement('div');
    pieModal.className = 'asignar-dialog__pie';

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn--secondary';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', () => cerrar(false));

    const btnAsignar = document.createElement('button');
    btnAsignar.className = 'btn btn--primary';
    btnAsignar.textContent = 'Asignar Tarea';
    btnAsignar.addEventListener('click', () => {
        const titulo = inputTitulo.value.trim();
        if (!titulo) {
            inputTitulo.focus();
            inputTitulo.classList.add('form__input--error');
            return;
        }
        inputTitulo.classList.remove('form__input--error');

        const idsSeleccionados = checkboxes
            .filter(c => c.checked)
            .map(c => Number(c.value));

        const datosTarea = {
            title: titulo,
            body: inputDesc.value.trim(),
            status: selectEstado.value,
            completed: selectEstado.value === 'completed',
        };

        cerrar(true);
        onConfirmar(datosTarea, idsSeleccionados);
    });

    pieModal.append(btnCancelar, btnAsignar);

    // ---- Ensamblar modal ----
    modal.append(encabezado, seccionTarea, seccionUsuarios, pieModal);
    overlay.append(modal);
    document.body.appendChild(overlay);

    // Foco inicial
    setTimeout(() => inputTitulo.focus(), 50);

    // Cerrar al clic fuera del modal
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrar(false);
    });

    // ---- Función de cierre con animación ----
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
