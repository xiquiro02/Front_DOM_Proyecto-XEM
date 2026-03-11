export const getUserById = async (idUsuario) => {
    const respuesta = await fetch(`https://jsonplaceholder.typicode.com/users/${idUsuario}`);
    if (respuesta.ok) {
        return await respuesta.json();
    } else {
        throw new Error("Usuario no encontrado");
    }
}
