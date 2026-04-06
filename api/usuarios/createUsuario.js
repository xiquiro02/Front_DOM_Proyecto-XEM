// Importa la configuración con la URL base del backend
import { BASE_URL } from '../config.js';

// Exporta la función asíncrona para registrar un nuevo usuario
export const createUsuario = async (nuevoUsuario) => {
    // Imprime mensaje de depuración para seguimiento en consola
    console.log('=== DEBUG CREATE USUARIO ===');

    // Prepara los datos según los campos que espera el backend (name, username, email, telefono)
    const datosEnviar = {
        name: nuevoUsuario.name || nuevoUsuario.nombre || '',
        // Limpia espacios en blanco del nombre de usuario
        username: (nuevoUsuario.username || '').replace(/\s+/g, ''),
        email: nuevoUsuario.email || '',
        telefono: nuevoUsuario.telefono || nuevoUsuario.phone || ''
    };

    // Agrega el sitio web opcional si está presente en los datos recibidos
    if (nuevoUsuario.website) {
        datosEnviar.website = nuevoUsuario.website;
    }

    // Muestra en consola los datos finales que se enviarán al servidor
    console.log('Datos a enviar (INGLÉS):', datosEnviar);

    // Ejecuta la petición POST para crear el registro del usuario
    const respuesta = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        body: JSON.stringify(datosEnviar),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });

    // Registra el estado de la respuesta del servidor (ej: 201 Created o 400 Error)
    console.log('Respuesta status:', respuesta.status);

    // Procesa la respuesta exitosa
    if (respuesta.ok) {
        const json = await respuesta.json();
        console.log('Respuesta exitosa:', json);
        return json.data; // Retorna los datos del usuario creado
    } else {
        // Captura detalles del error enviado por el servidor y lanza una excepción
        const errorText = await respuesta.text();
        console.error('Error:', errorText);
        throw new Error(`Error ${respuesta.status}: ${errorText}`);
    }
};
