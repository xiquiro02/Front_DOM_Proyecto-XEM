/**
 * Componente: userTareas.js
 * Objetivo: Crear y mostrar la lista de tareas en la Vista de Usuario.
 * 
 * Esta función recibe:
 * 1. elemento: El lugar donde vamos a poner las tareas.
 * 2. listaTareas: La lista de tareas que queremos mostrar.
 * 3. onStatusChange: Una función que se activa al cambiar de estado.
 */
export const armarTareasUsuario = (elemento, listaTareas, onStatusChange) => {

    // Usamos un bucle for tradicional para recorrer la lista de tareas
    for (let i = 0; i < listaTareas.length; i++) {
        // Obtenemos la tarea actual de la lista
        const tarea = listaTareas[i];

        // Averiguamos el estado real (si no tiene 'status', usamos 'completed')
        let estadoReal = tarea.status;
        if (!estadoReal) {
            // Si no tiene status pero dice completed true, es 'completed'
            if (tarea.completed) {
                estadoReal = 'completed';
            } else {
                // Si no, es 'pending' por defecto
                estadoReal = 'pending';
            }
        }

        // Creamos el contenedor principal de la tarjeta (el recuadro blanco)
        const divCard = document.createElement('div');
        // Le ponemos la clase de estilo 'task-card'
        divCard.classList.add('task-card');
        // Si la tarea está completada, le añadimos también esa clase para que se vea tachada
        if (estadoReal === 'completed') {
            divCard.classList.add('completed');
        }
        // Guardamos el ID de la tarea en un atributo de datos
        divCard.setAttribute('data-id', tarea.id);

        // Creamos la sección de información (el círculo y el texto)
        const divInfo = document.createElement('div');
        divInfo.classList.add('task-info');

        // Creamos el pequeño círculo de la izquierda (el check)
        const divCheck = document.createElement('div');
        divCheck.classList.add('task-check');

        // Dependiendo del estado, ponemos un símbolo diferente adentro del círculo
        if (estadoReal === 'completed') {
            divCheck.textContent = '✓'; // Marca de completado
        } else if (estadoReal === 'in-progress') {
            divCheck.textContent = '⚡'; // Marca de proceso
        } else {
            divCheck.textContent = '';  // Círculo vacío para pendientes
        }

        // Configuramos qué pasa cuando el usuario hace clic en el círculo
        divCheck.addEventListener('click', () => {
            // Creamos una lógica simple de "rotación" de estados
            let nuevoEstado = '';
            if (estadoReal === 'pending') {
                nuevoEstado = 'in-progress';
            } else if (estadoReal === 'in-progress') {
                nuevoEstado = 'completed';
            } else {
                nuevoEstado = 'pending';
            }

            // Si nos pasaron la función de cambio, la llamamos con el nuevo estado
            if (onStatusChange) {
                onStatusChange(tarea.id, nuevoEstado);
            }
        });

        // Creamos el texto del título de la tarea
        const spanTitle = document.createElement('span');
        spanTitle.classList.add('task-title');
        spanTitle.textContent = tarea.title;

        // Metemos el círculo y el título dentro de la sección de información
        divInfo.appendChild(divCheck);
        divInfo.appendChild(spanTitle);

        // Creamos la etiqueta de prioridad/estado que sale a la derecha
        const spanBadge = document.createElement('span');
        spanBadge.classList.add('task-priority');

        // Configuramos el color y el nombre según el estado
        if (estadoReal === 'completed') {
            spanBadge.classList.add('priority-low');
            spanBadge.textContent = 'Hecho';
        } else if (estadoReal === 'in-progress') {
            spanBadge.classList.add('priority-medium');
            spanBadge.textContent = 'En proceso';
        } else {
            spanBadge.classList.add('priority-high');
            spanBadge.textContent = 'Pendiente';
        }

        // Finalmente, armamos la tarjeta completa
        divCard.appendChild(divInfo);
        divCard.appendChild(spanBadge);

        // Y la metemos en el contenedor que nos dieron al principio
        elemento.appendChild(divCard);
    }
}
