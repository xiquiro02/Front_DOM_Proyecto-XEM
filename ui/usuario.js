/**
 * Componente: usuario.js
 * Objetivo: Crear y mostrar la información del perfil del usuario en el DOM.
 */

export const armarUsuario = (elemento, usuario) => {
    // Elimina cualquier contenido previo dentro del contenedor para hacer un render limpio
    elemento.replaceChildren();

    // Crea un Fragmento de Documento para realizar una inserción única y optimizar el rendimiento (reflow)
    const fragmento = document.createDocumentFragment();

    // Crea el contenedor principal que agrupará toda la información del usuario
    const cajaInfoUsuario = document.createElement('div');
    cajaInfoUsuario.className = 'user-info-container';

    // Construye y añade el párrafo correspondiente al nombre completo del usuario
    const parrafoNombre = document.createElement('p');
    const strongNombre = document.createElement('strong');
    strongNombre.textContent = "Nombre: ";
    parrafoNombre.append(strongNombre, usuario.name);
    cajaInfoUsuario.append(parrafoNombre);

    // Define e inyecta el nombre de usuario (username) en la tarjeta de información
    const parrafoUsuario = document.createElement('p');
    const strongUsuario = document.createElement('strong');
    strongUsuario.textContent = "Usuario: ";
    parrafoUsuario.append(strongUsuario, usuario.username);
    cajaInfoUsuario.append(parrafoUsuario);

    // Prepara y visualiza el correo electrónico del usuario verificado
    const parrafoEmail = document.createElement('p');
    const strongEmail = document.createElement('strong');
    strongEmail.textContent = "Email: ";
    parrafoEmail.append(strongEmail, usuario.email);
    cajaInfoUsuario.append(parrafoEmail);

    // Muestra el identificador único (ID) asignado al usuario por el sistema
    const parrafoId = document.createElement('p');
    const strongId = document.createElement('strong');
    strongId.textContent = "ID: ";
    parrafoId.append(strongId, usuario.id);
    cajaInfoUsuario.append(parrafoId);

    // Ensambla el fragmento en la memoria y finalmente lo inyecta en el DOM real
    fragmento.append(cajaInfoUsuario);
    elemento.append(fragmento);
}
