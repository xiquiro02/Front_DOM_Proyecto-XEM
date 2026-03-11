/**
 * Componente: filtros.js
 * Objetivo: Construir y renderizar el panel de filtros y ordenamiento en el DOM.
 *
 * Exporta `armarFiltros` que genera los controles de filtrado (selects de Estado
 * y Usuario) y los controles de ordenamiento (criterio + dirección) dentro del
 * contenedor indicado.
 */

/**
 * Construye el panel de filtros y ordenamiento con los usuarios disponibles.
 * @param {HTMLElement} contenedor - Donde se renderiza el panel.
 * @param {Array} usuarios - Lista de objetos usuario [{ id, name }...]
 * @returns {Object} - Referencias a los controles { selectEstado, selectUsuario, selectOrden, btnDireccion, badge, btnLimpiar }
 */
export const armarFiltros = (contenedor, usuarios = []) => {
    contenedor.innerHTML = '';

    // --- Contenedor principal del panel ---
    const panel = document.createElement('div');
    panel.className = 'filter-panel';

    // ==================================================
    // FILA 1: FILTROS
    // ==================================================
    const tituloFiltros = document.createElement('h3');
    tituloFiltros.className = 'filter-panel__title';
    tituloFiltros.textContent = '🔎 Filtrar y Ordenar Tareas';

    const controlesFilros = document.createElement('div');
    controlesFilros.className = 'filter-controls';

    // ---- SELECT: Filtro por Estado ----
    const grupoEstado = document.createElement('div');
    grupoEstado.className = 'filter-group';

    const labelEstado = document.createElement('label');
    labelEstado.htmlFor = 'filtroEstado';
    labelEstado.className = 'filter-label';
    labelEstado.textContent = 'Estado';

    const selectEstado = document.createElement('select');
    selectEstado.id = 'filtroEstado';
    selectEstado.className = 'filter-select';

    [
        { value: 'all', text: 'Todos los estados' },
        { value: 'pending', text: '🕐 Pendiente' },
        { value: 'in-progress', text: '⚡ En proceso' },
        { value: 'completed', text: '✅ Completada' },
    ].forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        selectEstado.append(option);
    });

    grupoEstado.append(labelEstado, selectEstado);

    // ---- SELECT: Filtro por Usuario ----
    const grupoUsuario = document.createElement('div');
    grupoUsuario.className = 'filter-group';

    const labelUsuario = document.createElement('label');
    labelUsuario.htmlFor = 'filtroUsuario';
    labelUsuario.className = 'filter-label';
    labelUsuario.textContent = 'Usuario';

    const selectUsuario = document.createElement('select');
    selectUsuario.id = 'filtroUsuario';
    selectUsuario.className = 'filter-select';

    const optTodos = document.createElement('option');
    optTodos.value = 'all';
    optTodos.textContent = 'Todos los usuarios';
    selectUsuario.append(optTodos);

    usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = String(u.id);
        opt.textContent = `👤 ${u.name}`;
        selectUsuario.append(opt);
    });

    grupoUsuario.append(labelUsuario, selectUsuario);

    // ---- BADGE de resultados ----
    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    badge.id = 'filterResultsBadge';
    badge.textContent = 'Mostrando todas las tareas';

    // ---- Botón limpiar ----
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'filter-clear-btn';
    btnLimpiar.id = 'filterClearBtn';
    btnLimpiar.textContent = '✕ Limpiar todo';

    controlesFilros.append(grupoEstado, grupoUsuario, badge, btnLimpiar);

    // ==================================================
    // FILA 2: ORDENAMIENTO
    // ==================================================
    const separador = document.createElement('div');
    separador.className = 'sort-separator';

    const controlesOrden = document.createElement('div');
    controlesOrden.className = 'sort-controls';

    // Etiqueta de la sección
    const etiquetaOrden = document.createElement('span');
    etiquetaOrden.className = 'sort-label';
    etiquetaOrden.textContent = '↕ Ordenar por:';

    // ---- SELECT: Criterio de orden ----
    const selectOrden = document.createElement('select');
    selectOrden.id = 'criterioOrden';
    selectOrden.className = 'filter-select sort-select';

    [
        { value: 'fecha', text: '📅 Fecha de creación' },
        { value: 'nombre', text: '🔤 Nombre (A–Z)' },
        { value: 'estado', text: '🏷️ Estado' },
    ].forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        selectOrden.append(option);
    });

    // ---- BOTÓN: Dirección de orden (toggle ▲/▼) ----
    const btnDireccion = document.createElement('button');
    btnDireccion.id = 'btnDireccionOrden';
    btnDireccion.className = 'sort-direction-btn';
    btnDireccion.setAttribute('data-dir', 'asc');
    btnDireccion.setAttribute('title', 'Cambiar dirección de orden');
    btnDireccion.innerHTML = '<span class="sort-dir-icon">▲</span><span class="sort-dir-text">ASC</span>';

    controlesOrden.append(etiquetaOrden, selectOrden, btnDireccion);

    // ==================================================
    // ENSAMBLAJE FINAL
    // ==================================================
    panel.append(tituloFiltros, controlesFilros, separador, controlesOrden);
    contenedor.append(panel);

    return { selectEstado, selectUsuario, badge, btnLimpiar, selectOrden, btnDireccion };
};
