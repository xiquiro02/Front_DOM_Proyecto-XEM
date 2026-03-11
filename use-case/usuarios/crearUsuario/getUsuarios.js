export const getUsers = async () => {
  const peticion = await fetch('http://localhost:3000/usuarios');
  const data = await peticion.json();
  return data;
}