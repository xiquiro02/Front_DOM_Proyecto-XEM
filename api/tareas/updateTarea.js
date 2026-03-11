export const updateTarea = async (tareaId, tarea) => {
  const solicitud = await fetch(`https://jsonplaceholder.typicode.com/todos/${tareaId}`, {
    method: 'PATCH',
    body: JSON.stringify({
        id: tareaId,
        ...tarea
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });
  const data = await solicitud.json();
  return data;
}
