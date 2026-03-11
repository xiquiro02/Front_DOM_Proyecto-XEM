export const deleteUser = async (userId) => {
  const solicitud = await fetch(`http://localhost:3000/usuarios/${userId}`, {
    method: 'DELETE',
  });
  if (solicitud.ok) {
    return true
  } else {
    return false
  }
}