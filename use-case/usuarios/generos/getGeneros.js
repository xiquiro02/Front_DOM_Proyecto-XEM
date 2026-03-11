export const generos = async () => {
  const solicitud = await fetch('http://localhost:3001/generos');
  const datos = await solicitud.json();
  return datos;
}