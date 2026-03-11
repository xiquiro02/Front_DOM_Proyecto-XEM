export const getTareasByUserId = async (idUsuario) => {
    const respuesta = await fetch(`https://jsonplaceholder.typicode.com/todos?userId=${idUsuario}`);
    if (respuesta.ok) {
        const listaDeTareas = await respuesta.json();
        return listaDeTareas;
    } else {
        throw new Error("No se pudieron cargar las tareas");
    }
}
