export const getUserById = async (idUsuario) => {
  const solicitud = await fetch(`http://localhost:3001/usuarios/${idUsuario}`);
  const data = await solicitud.json();
  return data;
}