/**
 * Componente: tareas.js
 * Objetivo: Crear y mostrar la lista de tareas del usuario.
 * 
 * Exporta una función llamada `armarTareas` que recibe:
 * 1. elemento: El contenedor donde se mostrarán.
 * 2. listaTareas: Un array [] con las tareas que traemos de la API.
 */

export const armarTareas = (elemento, listaTareas) => {
    const fragmento = document.createDocumentFragment();

    listaTareas.forEach(tarea => {
        // Determinar el estado real de la tarea
        // Prioridad: campo propio 'status' (para tareas "en proceso"), si no: derivado de 'completed'
        const estadoReal = tarea.status || (tarea.completed ? 'completed' : 'pending');

        // PASO 1: Crear el contenedor de la tarjeta de la tarea
        const divTarea = document.createElement('div');
        divTarea.className = 'message-card';
        divTarea.setAttribute('data-status', estadoReal);           // para filtros por estado
        divTarea.setAttribute('data-user-id', tarea.userId || ''); // para filtros por usuario

        // PASO 2: Crear la cabecera (Título y Estado)
        const divCabecera = document.createElement('div');
        divCabecera.className = 'message-header';

        // Título de la tarea
        const titulo = document.createElement('h3');
        titulo.textContent = tarea.title;
        titulo.className = 'message-author';

        // Estado (Completada | En proceso | Pendiente)
        const spanEstado = document.createElement('span');

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

        spanEstado.style.fontWeight = 'bold';
        spanEstado.style.marginLeft = '10px';

        divCabecera.append(titulo);
        divCabecera.append(spanEstado);

        // PASO 3: Parte principal de la tarea (Descripción)
        const parrafoDescripcion = document.createElement('p');
        parrafoDescripcion.className = 'message-text';

        //PASO 4: Contenedor de acciones
        const divAcciones = document.createElement('div');
        divAcciones.className = 'tarea__acciones';

        // PASO 5: Botones de editar y eliminar
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn-editar-tarea');
        btnEditar.setAttribute('data-id', tarea.id);
        btnEditar.textContent = 'Editar';

        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-eliminar-tarea');
        btnEliminar.setAttribute('data-id', tarea.id);
        btnEliminar.textContent = 'Eliminar';

        if (tarea.body) {
            parrafoDescripcion.textContent = tarea.body;
        } else {
            parrafoDescripcion.textContent = 'Sin descripción disponible';
        }

        // PASO 4: Armar la tarjeta completa
        divTarea.append(divCabecera);
        divTarea.append(parrafoDescripcion);
        divAcciones.append(btnEditar, btnEliminar);
        divTarea.append(divAcciones);

        fragmento.append(divTarea);
    });

    elemento.append(fragmento);
}
