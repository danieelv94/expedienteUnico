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
                req.session.user = usuario; 
                // Redirigir según el rol del usuario
                if (usuario.rol === 'DIVA') {
                    res.redirect("/mis-obras"); 
                } else if (usuario.rol === 'DIVA administrador') {
                    res.redirect("/obras"); 
                } else if (usuario.rol === 'Ventanilla') {
                    res.redirect("/ventanilla-unica"); 
                } else if (usuario.rol === 'AVANCE') { // <-- Agregar esta condición
                    res.redirect("/avance"); // <-- Redirigir a la vista de avances
                } else if (usuario.rol === 'Admin AVANCE') { // <-- Agregar esta condición
                    res.redirect("/editar-avance"); // <-- Redirigir a la vista de avances
                } else {
                    // Manejar el caso de un rol no válido
                    res.render("pages/login", { error: "Rol de usuario no válido" });
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

export async function procesarRegistro(req, res) {
    const { no_empleado, password, email_usuario, nombre_usuario, rol } = req.body;  // Obtiene el valor de 'rol' de req.body

    try {
        // Verifica si el usuario ya existe
        const [existente] = await pool.query(
            "SELECT * FROM usuarios WHERE no_empleado = ?",
            [no_empleado]
        );

        if (existente.length > 0) {
            // Si el usuario ya existe, muestra un error
            res.render("pages/register", { error: "El usuario ya existe" });
        } else {
            // Genera el hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Si el usuario no existe, crear uno nuevo con la contraseña cifrada
            const query = "INSERT INTO usuarios (no_empleado, password_usuario, email_usuario, nombre_usuario, rol) VALUES (?, ?, ?, ?, ?)";
            await pool.query(query, [no_empleado, hashedPassword, email_usuario, nombre_usuario, rol]); 

            res.redirect("/login");
        }
    } catch (error) {
        console.error("Error al procesar el registro:", error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
}