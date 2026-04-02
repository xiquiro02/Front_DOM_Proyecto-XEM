import { BASE_URL } from '../config.js';

export const createUsuario = async (nuevoUsuario) => {
    console.log('=== DEBUG CREATE USUARIO ===');

    // El backend espera campos en INGLÉS (name, phone, no nombre/telefono)
    // Error del servidor: "Cannot destructure property 'name' of 'req.body'"
    const datosEnviar = {
        name: nuevoUsuario.name || nuevoUsuario.nombre || '',
        username: (nuevoUsuario.username || '').replace(/\s+/g, ''),
        email: nuevoUsuario.email || '',
        telefono: nuevoUsuario.telefono || nuevoUsuario.phone || ''
    };

    if (nuevoUsuario.website) {
        datosEnviar.website = nuevoUsuario.website;
    }

    console.log('Datos a enviar (INGLÉS):', datosEnviar);

    const respuesta = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        body: JSON.stringify(datosEnviar),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });

    console.log('Respuesta status:', respuesta.status);

    if (respuesta.ok) {
        const json = await respuesta.json();
        console.log('Respuesta exitosa:', json);
        return json.data;
    } else {
        const errorText = await respuesta.text();
        console.error('Error:', errorText);
        throw new Error(`Error ${respuesta.status}: ${errorText}`);
    }
};
