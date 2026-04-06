/**
 * Componente: adminUsuarios.js
 * Objetivo: Crear y renderizar las tarjetas descriptivas de usuarios en el Panel de Administrador.
 */

export const armarListaUsuarios = (contenedor, listaUsuarios) => {
    // Prepara el entorno limpiando cualquier visualización de usuarios previa
    contenedor.replaceChildren();

    // Lógica de renderizado para casos donde el sistema no registra usuarios todavía
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

    // Crea un fragmento de memoria para acumular las tarjetas y minimizar actualizaciones del DOM real (optimización)
    const fragmento = document.createDocumentFragment();

    // Recorre el listado de usuarios para generar individualmente sus perfiles interactivos
    listaUsuarios.forEach(usuario => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'message-card user-card';
        tarjeta.setAttribute('data-id', usuario.id);

        // Crea la franja superior de la tarjeta (Cabecera)
        const cabecera = document.createElement('div');
        cabecera.className = 'message-header';

        // Inserta el nombre completo del usuario como título principal
        const nombre = document.createElement('h3');
        nombre.className = 'message-author';
        nombre.textContent = usuario.name;

        // Muestra un distintivo (badge) con el identificador único del usuario
        const idBadge = document.createElement('span');
        idBadge.className = 'user-id-badge';
        idBadge.textContent = `ID: ${usuario.id}`;

        // Une nombre e ID en la cabecera
        cabecera.append(nombre, idBadge);

        // Crea la sección central que contendrá los detalles de contacto
        const cuerpo = document.createElement('div');
        cuerpo.className = 'user-card__body';

        // Define los campos informativos a desplegar: nombre de cuenta, mail y teléfono
        const campos = [
            { icono: '🏷️', etiqueta: 'Usuario', valor: usuario.username, clase: 'user-username' },
            { icono: '📧', etiqueta: 'Email', valor: usuario.email, clase: 'user-email' },
            { icono: '📞', etiqueta: 'Teléfono', valor: usuario.telefono, clase: 'user-phone' },
        ];

        // Genera dinámicamente cada fila de información solo si el dato existe
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

        // Crea el contenedor inferior para los botones de gestión de cuenta
        const acciones = document.createElement('div');
        acciones.className = 'tarea__acciones';

        // Configura el botón para activar el modo de edición de perfil
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn-editar-usuario');
        btnEditar.setAttribute('data-id', usuario.id);
        btnEditar.textContent = 'Editar';

        // Configura el botón para iniciar el proceso de baja del usuario
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-eliminar-usuario');
        btnEliminar.setAttribute('data-id', usuario.id);
        btnEliminar.textContent = 'Eliminar';

        // Ensambla y monta la tarjeta completa combinando cabecera, cuerpo y acciones
        acciones.append(btnEditar, btnEliminar);
        tarjeta.append(cabecera, cuerpo, acciones);
        fragmento.append(tarjeta);
    });

    // Inyecta masivamente todos los perfiles de usuario procesados en el contenedor root
    contenedor.append(fragmento);
};
