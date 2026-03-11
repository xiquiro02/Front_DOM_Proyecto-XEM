export const createUser = async (documento, nombre, genero, ciudad, correo) => {
  const solicitud = await fetch('http://localhost:3000/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      documento: documento,
      nombre: nombre,
      genero_id: genero,
      ciudad_id: ciudad,
      correo: correo
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });

  const respuesta = await solicitud.json();
  return respuesta;
}

