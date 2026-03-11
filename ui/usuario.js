/**
 * Componente: usuario.js
 * Objetivo: Crear y mostrar la información del usuario en el DOM.
 * 
 * Este archivo exporta una función llamada `armarUsuario` que recibe dos parámetros:
 * 1. elemento: El contenedor HTML donde vamos a poner la información.
 * 2. usuario: El objeto con los datos del usuario que nos devuelve la API.
 */

export const armarUsuario = (elemento, usuario) => {
    // PASO 1: Limpiar el contenedor
    elemento.innerHTML = '';

    // PASO 2: Crear un Fragmento de Documento
    const fragmento = document.createDocumentFragment();

    // PASO 3: Crear el contenedor principal de la tarjeta de usuario
    const cajaInfoUsuario = document.createElement('div');
    cajaInfoUsuario.className = 'user-info-container';

    // PASO 4: Crear y llenar los elementos individuales (párrafos) sin usar innerHTML

    // --- Nombre ---
    const parrafoNombre = document.createElement('p');
    const strongNombre = document.createElement('strong');
    strongNombre.textContent = "Nombre: ";
    parrafoNombre.append(strongNombre, usuario.name);
    cajaInfoUsuario.append(parrafoNombre);

    // --- Usuario (Username) ---
    const parrafoUsuario = document.createElement('p');
    const strongUsuario = document.createElement('strong');
    strongUsuario.textContent = "Usuario: ";
    parrafoUsuario.append(strongUsuario, usuario.username);
    cajaInfoUsuario.append(parrafoUsuario);

    // --- Email ---
    const parrafoEmail = document.createElement('p');
    const strongEmail = document.createElement('strong');
    strongEmail.textContent = "Email: ";
    parrafoEmail.append(strongEmail, usuario.email);
    cajaInfoUsuario.append(parrafoEmail);

    // --- ID ---
    const parrafoId = document.createElement('p');
    const strongId = document.createElement('strong');
    strongId.textContent = "ID: ";
    parrafoId.append(strongId, usuario.id);
    cajaInfoUsuario.append(parrafoId);

    // PASO 5: Ensamblaje final
    fragmento.append(cajaInfoUsuario);
    elemento.append(fragmento);
}
