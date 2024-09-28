import pool from './db.js';
import bcrypt from 'bcrypt';

// Función para mostrar la página de login
export function mostrarLogin(req, res) {
    res.render("pages/login");
}

export function cerrarSesion(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            res.status(500).json({ error: "Error al cerrar sesión" });
        } else {
            res.redirect("/login");   
 // Redirige al usuario a la página de login
        }
    });
}

// ... otras funciones ...

// Función para procesar el login
export async function procesarLogin(req, res) {
    const { username, password } = req.body;

    try {
        const [result] = await pool.query(
            "SELECT * FROM usuarios WHERE no_empleado = ?",
            [username]
        );

        if (result.length > 0) {
            const usuario = result[0];
            const match = await bcrypt.compare(password, usuario.password_usuario);

            if (match) {
                
                const [rolesResult] = await pool.query(
                    "SELECT rol FROM usuarios WHERE no_empleado = ?",
                    [username]
                );

                if (rolesResult.length > 0) {
                    usuario.rol = rolesResult[0].rol; 
                    req.session.user = usuario; 

                    // Redirigir según el rol del usuario
                    if (usuario.rol === 'DIVA') {
                        res.redirect("/mis-obras"); 
                    } else {
                        res.redirect("/obras"); 
                    }
                } else {
                    res.render("pages/login", { error: "Error al obtener el rol del usuario" });
                }
            } else {
                res.render("pages/login", { error: "Usuario o contraseña incorrectos" });
            }
        } else {
            res.render("pages/login", { error: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        console.error("Error al procesar el login:", error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

// Función para mostrar la página de registro
export function mostrarRegistro(req, res) {
    res.render("pages/register");
}

// Función para procesar el registro de un nuevo usuario
export async function procesarRegistro(req, res) {
    const { no_empleado, password, email_usuario, nombre_usuario } = req.body;

    try {
        // Verifica si el usuario ya existe
        const [existente] = await pool.query(
            "SELECT * FROM usuarios WHERE no_empleado = ?",
            [no_empleado]
        );

        if (existente.length > 0) {
            // Si el usuario ya existe, muestra un error
            res.render("register", { error: "El usuario ya existe" });
        } else {
            // Genera el hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Si el usuario no existe, crear uno nuevo con la contraseña cifrada
            await pool.query(
                "INSERT INTO usuarios (no_empleado, password_usuario, email_usuario, nombre_usuario) VALUES (?, ?, ?, ?)",
                [no_empleado, hashedPassword, email_usuario, nombre_usuario]
            );
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Error al procesar el registro:", error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
}



