/**
 * Componente: adminUsuarios.js
 * Objetivo: Crear y renderizar las tarjetas de usuarios para el panel de administración.
 * 
 * Exporta:
 * - armarListaUsuarios(contenedor, listaUsuarios) → dibuja las tarjetas de usuarios
 */

export const armarListaUsuarios = (contenedor, listaUsuarios) => {
    contenedor.replaceChildren();

    if (listaUsuarios.length === 0) {
        const divVacio = document.createElement('div');
        divVacio.className = 'filter-no-results';
        
        const iconNode = document.createElement('div');
        iconNode.className = 'filter-no-results__icon';
        iconNode.textContent = '👤';
        
        const textNode = document.createElement('p');
        textNode.className = 'filter-no-results__text';
        textNode.textContent = 'Sin usuarios registrados';
        
        const subNode = document.createElement('p');
        subNode.className = 'filter-no-results__sub';
        subNode.textContent = 'Registra un nuevo usuario usando el formulario.';
        
        divVacio.append(iconNode, textNode, subNode);
        contenedor.append(divVacio);
        return;
    }

    const fragmento = document.createDocumentFragment();

    listaUsuarios.forEach(usuario => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'message-card user-card';
        tarjeta.setAttribute('data-id', usuario.id);

        // Cabecera de la tarjeta
        const cabecera = document.createElement('div');
        cabecera.className = 'message-header';

        const nombre = document.createElement('h3');
        nombre.className = 'message-author';
        nombre.textContent = usuario.name;

        const idBadge = document.createElement('span');
        idBadge.className = 'user-id-badge';
        idBadge.textContent = `ID: ${usuario.id}`;

        cabecera.append(nombre, idBadge);

        // Cuerpo de la tarjeta
        const cuerpo = document.createElement('div');
        cuerpo.className = 'user-card__body';

        const campos = [
            { icono: '🏷️', etiqueta: 'Usuario', valor: usuario.username, clase: 'user-username' },
            { icono: '📧', etiqueta: 'Email', valor: usuario.email, clase: 'user-email' },
            { icono: '📞', etiqueta: 'Teléfono', valor: usuario.telefono, clase: 'user-phone' },
        ];

        campos.forEach(({ icono, etiqueta, valor, clase }) => {
            if (!valor) return;
            const fila = document.createElement('p');
            fila.className = `user-card__field ${clase}`;
            
            const spanIcon = document.createElement('span');
            spanIcon.className = 'field-icon';
            spanIcon.textContent = icono;
            
            const strongTag = document.createElement('strong');
            strongTag.textContent = `${etiqueta}:`;
            
            fila.append(spanIcon, ' ', strongTag, ` ${valor}`);
            cuerpo.append(fila);
        });

        // Acciones
        const acciones = document.createElement('div');
        acciones.className = 'tarea__acciones';

        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn-editar-usuario');
        btnEditar.setAttribute('data-id', usuario.id);
        btnEditar.textContent = 'Editar';

        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-eliminar-usuario');
        btnEliminar.setAttribute('data-id', usuario.id);
        btnEliminar.textContent = 'Eliminar';

        acciones.append(btnEditar, btnEliminar);

        tarjeta.append(cabecera, cuerpo, acciones);
        fragmento.append(tarjeta);
    });

    contenedor.append(fragmento);
};
