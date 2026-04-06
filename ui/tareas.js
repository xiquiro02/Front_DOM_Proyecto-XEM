/**
 * Componente: tareas.js
 * Objetivo: Crear y mostrar la lista dinámica de tareas en el DOM.
 */

export const armarTareas = (elemento, listaTareas) => {
    // Crea un fragmento de documento para acumular las tarjetas antes de insertarlas en el DOM
    const fragmento = document.createDocumentFragment();

    // Recorre cada tarea del array proporcionado para construir su representación visual
    listaTareas.forEach(tarea => {
        // Determina el estado de la tarea priorizando el campo 'status' personalizado
        const estadoReal = tarea.status || (tarea.completed ? 'completed' : 'pending');

        // Crea el contenedor con clases de estilo y atributos de datos para filtrado dinámico
        const divTarea = document.createElement('div');
        divTarea.className = 'message-card';
        divTarea.setAttribute('data-status', estadoReal);
        divTarea.setAttribute('data-user-id', tarea.usuarios?.[0]?.id ?? '');

        // Prepara la cabecera de la tarjeta con el título y el indicador de estado
        const divCabecera = document.createElement('div');
        divCabecera.className = 'message-header';

        // Crea e inserta el título principal de la tarea
        const titulo = document.createElement('h3');
        titulo.textContent = tarea.title;
        titulo.className = 'message-author';

        // Crea el elemento <span> que representará visualmente el estado actual
        const spanEstado = document.createElement('span');

        // Aplica clases, iconos y colores específicos según el estado de la tarea
        if (estadoReal === 'completed') {
            spanEstado.className = 'status-completed';
            spanEstado.textContent = '✅ Completada';
            spanEstado.style.color = 'green';
        } else if (estadoReal === 'in-progress') {
            spanEstado.className = 'status-in-progress';
            spanEstado.textContent = '⚡ En proceso';
        } else {
            spanEstado.className = 'status-pending';
            spanEstado.textContent = '🕐 Pendiente';
            spanEstado.style.color = 'orange';
        }

        // Estiliza el indicador de estado para mayor legibilidad
        spanEstado.style.fontWeight = 'bold';
        spanEstado.style.marginLeft = '10px';

        // Ensambla los componentes en la cabecera
        divCabecera.append(titulo);
        divCabecera.append(spanEstado);

        // Crea el componente para la descripción o cuerpo de la tarea
        const parrafoDescripcion = document.createElement('p');
        parrafoDescripcion.className = 'message-text';

        // Crea un contenedor dedicado para los botones de acción lateral
        const divAcciones = document.createElement('div');
        divAcciones.className = 'tarea__acciones';

        // Define el botón de Edición con su respectivo ID de referencia
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn-editar-tarea');
        btnEditar.setAttribute('data-id', tarea.id);
        btnEditar.textContent = 'Editar';

        // Define el botón de Eliminación con su respectivo ID de referencia
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-eliminar-tarea');
        btnEliminar.setAttribute('data-id', tarea.id);
        btnEliminar.textContent = 'Eliminar';

        // Asigna el contenido al cuerpo de la tarea o un mensaje por defecto si está vacío
        if (tarea.body) {
            parrafoDescripcion.textContent = tarea.body;
        } else {
            parrafoDescripcion.textContent = 'Sin descripción disponible';
        }

        // Ensambla y jerarquiza todos los elementos dentro de la tarjeta principal
        divTarea.append(divCabecera);
        divTarea.append(parrafoDescripcion);
        divAcciones.append(btnEditar, btnEliminar);
        divTarea.append(divAcciones);

        // Añade la tarjeta finalizada al fragmento acumulador
        fragmento.append(divTarea);
    });

    // Realiza la inserción masiva en el DOM real para finalizar el renderizado
    elemento.append(fragmento);
}
