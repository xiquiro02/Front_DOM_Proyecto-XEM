export const ciudades = async () => {
  const solicitud = await fetch('http://localhost:3001/ciudades');
  const datos = await solicitud.json();
  return datos;
}