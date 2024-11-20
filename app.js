const fs = require('fs');
const readline = require('readline');

// Crear la interfaz de readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function leerUsuarios() {
    return new Promise((resolve, reject) => {
        fs.readFile('usuarios.json', 'utf8', (err, data) => {
            if (err) {
                reject('Error al leer el archivo:', err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function guardarUsuarios(usuarios) {
    return new Promise((resolve, reject) => {
        fs.writeFile('usuarios.json', JSON.stringify(usuarios, null, 2), 'utf8', err => {
            if (err) {
                reject('Error al guardar el archivo:', err);
            } else {
                resolve();
            }
        });
    });
}

async function registrarUsuario() {
    let nuevoUsuario = {
        nombre: '',
        apellido: '',
        identificacion: '',
        edad: 0,
        correo: '',
        contraseña: ''
    };

    await pedirDatos(nuevoUsuario);
    let errores = {};

    if (!validarNombre(nuevoUsuario.nombre)) {
        errores.nombre = erroresValidaciones.nombre_invalido;
    }
    if (!validarApellido(nuevoUsuario.apellido)) {
        errores.apellido = erroresValidaciones.apellido_invalido;
    }
    if (!validarId(nuevoUsuario.identificacion)) {
        errores.identificacion = erroresValidaciones.id_invalido;
    }
    if (!validarEdad(nuevoUsuario.edad)) {
        errores.edad = erroresValidaciones.edad_invalida;
    }
    if (!validarCorreo(nuevoUsuario.correo)) {
        errores.correo = erroresValidaciones.correo_invalido;
    }

    if (Object.keys(errores).length === 0) {
        try {
            const usuarios = await leerUsuarios();
            usuarios.usuariosRegistrados.push(nuevoUsuario);
            await guardarUsuarios(usuarios);
            console.log('Usuario registrado exitosamente.');
            console.log('Usuario JSON:', JSON.stringify(nuevoUsuario, null, 2));
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('Errores en la validación:', errores);
    }
    menu();
}

function pedirDatos(usuario) {
    return new Promise((resolve) => {
        rl.question('Ingrese su nombre: ', (respuesta) => {
            usuario.nombre = respuesta;
            rl.question('Ingrese su apellido: ', (respuesta) => {
                usuario.apellido = respuesta;
                rl.question('Ingrese su documento de identificación: ', (respuesta) => {
                    usuario.identificacion = respuesta;
                    rl.question('Ingrese su edad: ', (respuesta) => {
                        usuario.edad = parseInt(respuesta);
                        rl.question('Ingrese un correo electrónico: ', (respuesta) => {
                            usuario.correo = respuesta;
                            rl.question('Ingrese una contraseña: ', (respuesta) => {
                                usuario.contraseña = respuesta;
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });
}

function validarNombre(nombre) {
    let nombreValido = /^[a-zA-Z]+$/;
    return nombreValido.test(nombre);
}

function validarApellido(apellido) {
    let apellidoValido = /^[a-zA-Z]+$/;
    return apellidoValido.test(apellido);
}

function validarId(identificacion) {
    return identificacion.length > 1 && !isNaN(identificacion) && Number.isInteger(parseFloat(identificacion));
}

function validarEdad(edad) {
    return Number.isInteger(edad) && edad >= 18;
}

function validarCorreo(correo) {
    let correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return correoValido.test(correo);
}

const erroresValidaciones = {
    nombre_invalido: 'El nombre debe contener solo letras',
    apellido_invalido: 'El apellido debe contener solo letras',
    id_invalido: 'La identificación debe tener más de un carácter y ser un número entero',
    edad_invalida: 'Para poder votar debes ser mayor de edad',
    correo_invalido: 'Ingrese un correo electrónico válido'
};

async function buscarUsuario() {
    rl.question('Ingrese la identificación del usuario que desea buscar: ', async (idBuscada) => {
        try {
            const usuarios = await leerUsuarios();
            let usuarioEncontrado = usuarios.usuariosRegistrados.find(user => user.identificacion === idBuscada);

            if (usuarioEncontrado) {
                console.log('Usuario encontrado:');
                console.log(`Nombre: ${usuarioEncontrado.nombre}`);
                console.log(`Apellido: ${usuarioEncontrado.apellido}`);
                console.log(`Identificación: ${usuarioEncontrado.identificacion}`);
                console.log(`Edad: ${usuarioEncontrado.edad}`);
                console.log(`Correo electrónico: ${usuarioEncontrado.correo}`);
            } else {
                console.log('No se encontró ningún usuario con esa identificación');
            }
        } catch (error) {
            console.error(error);
        }
        menu();
    });
}

async function eliminarUsuario() {
    rl.question('Ingrese la identificación del usuario que desea eliminar: ', async (idEliminar) => {
        try {
            const usuarios = await leerUsuarios();
            let indice = usuarios.usuariosRegistrados.findIndex(user => user.identificacion === idEliminar);

            if (indice !== -1) {
                usuarios.usuariosRegistrados.splice(indice, 1);
                await guardarUsuarios(usuarios);
                console.log(`Usuario con identificación ${idEliminar} eliminado exitosamente.`);
            } else {
                console.log('No se encontró ningún usuario con esa identificación para eliminar.');
            }
        } catch (error) {
            console.error(error);
        }
        menu();
    });
}

function menu() {
    rl.question("Seleccione una opción:\n1. Registrar usuario\n2. Buscar usuario\n3. Eliminar usuario\n4. Salir\n", (opcion) => {
        switch (opcion) {
            case '1':
                registrarUsuario();
                break;
            case '2':
                buscarUsuario();
                break;
            case '3':
                eliminarUsuario();
                break;
            case '4':
                rl.close();
                break;
            default:
                console.log('Opción no válida, por favor intente de nuevo.');
                menu();
        }
    });
}

// Iniciar el menú
menu();
