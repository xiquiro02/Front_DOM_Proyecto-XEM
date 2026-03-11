export const getTareasByUserId = async (idUsuario) => {
    const respuesta = await fetch(`http://localhost:3000/tareas?userId=${idUsuario}`);
    if (respuesta.ok) {
        const listaDeTareas = await respuesta.json();
        return listaDeTareas;
    } else {
        throw new Error("No se pudieron cargar las tareas");
    }
}
