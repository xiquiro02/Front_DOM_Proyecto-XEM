export const deleteTarea = async (tareaId) => {
  const solicitud = await fetch(`https://jsonplaceholder.typicode.com/todos/${tareaId}`, {
    method: 'DELETE',
  });
  if (solicitud.ok) {
    return true;
  } else {
    return false;
  }
}