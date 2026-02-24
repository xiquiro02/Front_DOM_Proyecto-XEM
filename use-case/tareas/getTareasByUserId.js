export const getTareasByUserId = async (idUsuario) => {
    const respuesta = await fetch(`http://localhost:3000/tareas?userId=${idUsuario}`);
    if (respuesta.ok) {
        const listaDeTareas = await respuesta.json();
        return listaDeTareas.slice(0, 5); // Return only first 5 as per current logic
    } else {
        throw new Error("No se pudieron cargar las tareas");
    }
}
