/**
 * Componente: filtros.js
 * Objetivo: Construir y renderizar el panel de filtros y ordenamiento en el DOM.
 */

/**
 * Construye el panel de filtros y ordenamiento con los usuarios disponibles.
 */
export const armarFiltros = (contenedor, usuarios = []) => {
    // Limpia el contenedor para asegurar un rediseño completo del panel de control
    contenedor.replaceChildren();

    // Crea el contenedor raíz del panel de filtrado
    const panel = document.createElement('div');
    panel.className = 'filter-panel';

    // Añade un título descriptivo a la sección de herramientas de búsqueda
    const tituloFiltros = document.createElement('h3');
    tituloFiltros.className = 'filter-panel__title';
    tituloFiltros.textContent = '🔎 Filtrar y Ordenar Tareas';

    // Crea el contenedor para agrupar los selectores de filtrado
    const controlesFilros = document.createElement('div');
    controlesFilros.className = 'filter-controls';

    // Grupo de control para el filtro por estado de la tarea
    const grupoEstado = document.createElement('div');
    grupoEstado.className = 'filter-group';

    // Etiqueta vinculada al selector de estados
    const labelEstado = document.createElement('label');
    labelEstado.htmlFor = 'filtroEstado';
    labelEstado.className = 'filter-label';
    labelEstado.textContent = 'Estado';

    // Crea el elemento select para elegir estados (Pendiente, Proceso, etc.)
    const selectEstado = document.createElement('select');
    selectEstado.id = 'filtroEstado';
    selectEstado.className = 'filter-select';

    // Genera dinámicamente las opciones de estado dentro del select
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

    // Monta el grupo de estado
    grupoEstado.append(labelEstado, selectEstado);

    // Grupo de control para filtrar tareas por usuario asignado
    const grupoUsuario = document.createElement('div');
    grupoUsuario.className = 'filter-group';

    // Etiqueta para el selector de usuarios
    const labelUsuario = document.createElement('label');
    labelUsuario.htmlFor = 'filtroUsuario';
    labelUsuario.className = 'filter-label';
    labelUsuario.textContent = 'Usuario';

    // Crea el select de usuarios para discriminar resultados
    const selectUsuario = document.createElement('select');
    selectUsuario.id = 'filtroUsuario';
    selectUsuario.className = 'filter-select';

    // Inserta la opción por defecto para ver todas las tareas de todos
    const optTodos = document.createElement('option');
    optTodos.value = 'all';
    optTodos.textContent = 'Todos los usuarios';
    selectUsuario.append(optTodos);

    // Pobla el selector con la lista de usuarios activos recibida por parámetro
    usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = String(u.id);
        opt.textContent = `👤 ${u.name}`;
        selectUsuario.append(opt);
    });

    // Monta el grupo de usuarios
    grupoUsuario.append(labelUsuario, selectUsuario);

    // Badge informativo que muestra el conteo o estado de los resultados actuales
    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    badge.id = 'filterResultsBadge';
    badge.textContent = 'Mostrando todas las tareas';

    // Botón para restablecer instantáneamente todos los filtros y órdenes aplicados
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'filter-clear-btn';
    btnLimpiar.id = 'filterClearBtn';
    btnLimpiar.textContent = '✕ Limpiar todo';

    // Ensambla la primera fila de controles (Filtros)
    controlesFilros.append(grupoEstado, grupoUsuario, badge, btnLimpiar);

    // Línea divisoria estética entre filtros y herramientas de ordenación
    const separador = document.createElement('div');
    separador.className = 'sort-separator';

    // Contenedor para los controles de ordenamiento (Fecha, Nombre, etc.)
    const controlesOrden = document.createElement('div');
    controlesOrden.className = 'sort-controls';

    // Texto orientativo para la sección de ordenamiento
    const etiquetaOrden = document.createElement('span');
    etiquetaOrden.className = 'sort-label';
    etiquetaOrden.textContent = '↕ Ordenar por:';

    // Selector principal para elegir el criterio de clasificación
    const selectOrden = document.createElement('select');
    selectOrden.id = 'criterioOrden';
    selectOrden.className = 'filter-select sort-select';

    // Inserta las opciones de orden: Fecha (Recientes), Nombre (A-Z) o Estado
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

    // Botón interactivo para alternar entre orden Ascendente y Descendente
    const btnDireccion = document.createElement('button');
    btnDireccion.id = 'btnDireccionOrden';
    btnDireccion.className = 'sort-direction-btn';
    btnDireccion.setAttribute('data-dir', 'asc');
    btnDireccion.setAttribute('title', 'Cambiar dirección de orden');

    // Ícono visual (flecha) representativo del sentido del orden
    const spanIcon = document.createElement('span');
    spanIcon.className = 'sort-dir-icon';
    spanIcon.textContent = '▲';

    // Texto descriptivo del sentido actual (ASC/DESC)
    const spanText = document.createElement('span');
    spanText.className = 'sort-dir-text';
    spanText.textContent = 'ASC';

    // Monta el interior del botón de dirección
    btnDireccion.replaceChildren(spanIcon, spanText);

    // Agrupa los controles de ordenación en su respectivo contenedor
    controlesOrden.append(etiquetaOrden, selectOrden, btnDireccion);

    // Ensambla y monta el panel completo en el DOM receptor
    panel.append(tituloFiltros, controlesFilros, separador, controlesOrden);
    contenedor.append(panel);

    // Retorna referencias a los elementos clave para vincular sus eventos en el controlador
    return { selectEstado, selectUsuario, badge, btnLimpiar, selectOrden, btnDireccion };
};
