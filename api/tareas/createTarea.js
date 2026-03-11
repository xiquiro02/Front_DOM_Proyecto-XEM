export const createTarea = async (nuevaTarea) => {
    const opciones = {
        method: 'POST',
        body: JSON.stringify(nuevaTarea),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    };

    const respuesta = await fetch('http://localhost:3000/tareas', opciones);
    if (respuesta.ok) {
        return await respuesta.json();
    } else {
        throw new Error("Hubo un error al guardar la tarea");
    }
}
