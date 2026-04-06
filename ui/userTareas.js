/**
 * Componente: userTareas.js
 * Objetivo: Crear y mostrar la lista interactiva de tareas en la Vista de Usuario.
 */
export const armarTareasUsuario = (elemento, listaTareas, onStatusChange) => {

    // Itera sobre el conjunto de tareas para construir individualmente sus representaciones visuales
    for (let i = 0; i < listaTareas.length; i++) {
        const tarea = listaTareas[i];

        // Normaliza el estado de la tarea (Pendiente/Proceso/Hecho) para asegurar coherencia en la UI
        let estadoReal = tarea.status;
        if (!estadoReal) {
            // Deriva el estado del valor booleano 'completed' si el campo 'status' no está definido
            if (tarea.completed) {
                estadoReal = 'completed';
            } else {
                estadoReal = 'pending';
            }
        }

        // Crea el cuerpo de la tarjeta y le asigna la clase base de diseño 'task-card'
        const divCard = document.createElement('div');
        divCard.classList.add('task-card');

        // Añade un efecto visual (ej: tachado o gris) si la tarea ya ha sido finalizada
        if (estadoReal === 'completed') {
            divCard.classList.add('completed');
        }
        // Registra el ID de la tarea como metadato del elemento para facilitar acciones posteriores
        divCard.setAttribute('data-id', tarea.id);

        // Crea la agrupación lateral para los elementos informativos (chequeo + título)
        const divInfo = document.createElement('div');
        divInfo.classList.add('task-info');

        // Crea el componente circular interactivo que actúa como interruptor de estado
        const divCheck = document.createElement('div');
        divCheck.classList.add('task-check');

        // Inserta el símbolo visual representativo del progreso actual dentro del círculo
        if (estadoReal === 'completed') {
            divCheck.textContent = '✓';
        } else if (estadoReal === 'in-progress') {
            divCheck.textContent = '⚡';
        } else {
            divCheck.textContent = '';
        }

        // Vincula el evento de clic al círculo para rotar cíclicamente entre los estados disponibles
        divCheck.addEventListener('click', () => {
            let nuevoEstado = '';
            // Define la lógica de transición: Pendiente → En proceso → Hecho → (vuelve a empezar)
            if (estadoReal === 'pending') {
                nuevoEstado = 'in-progress';
            } else if (estadoReal === 'in-progress') {
                nuevoEstado = 'completed';
            } else {
                nuevoEstado = 'pending';
            }

            // Dispara la función de callback externa si ha sido proporcionada para actualizar datos
            if (onStatusChange) {
                onStatusChange(tarea.id, nuevoEstado);
            }
        });

        // Crea y configura el texto que muestra el nombre de la tarea
        const spanTitle = document.createElement('span');
        spanTitle.classList.add('task-title');
        spanTitle.textContent = tarea.title;

        // Integra los elementos dentro del bloque de información principal
        divInfo.appendChild(divCheck);
        divInfo.appendChild(spanTitle);

        // Crea la etiqueta estilizada (badge) que indica la prioridad o estado a la derecha
        const spanBadge = document.createElement('span');
        spanBadge.classList.add('task-priority');

        // Estiliza el badge con colores semánticos (Verde, Amarillo, Rojo) según la fase de la tarea
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

        // Une todas las piezas finales dentro de la estructura de la tarjeta
        divCard.appendChild(divInfo);
        divCard.appendChild(spanBadge);

        // Inyecta la tarjeta terminada en la lista visual que el usuario tiene en pantalla
        elemento.appendChild(divCard);
    }
}
