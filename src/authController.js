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
                
                // Obtener los roles del usuario
                const rolesUsuario = await obtenerRolesUsuario(usuario.id_usuario);
                req.session.roles = rolesUsuario; 

                // Redirigir según el rol del usuario (puedes ajustar la lógica según tus necesidades)
                if (req.session.roles.includes('DIVA administrador')) {
                    res.redirect("/obras"); 
                } else if (req.session.roles.includes('DIVA')) {
                    res.redirect("/mis-obras"); 
                } else if (req.session.roles.includes('Ventanilla')) {
                    res.redirect("/ventanilla-unica"); 
                } else if (req.session.roles.includes('AVANCE')) {
                    res.redirect("/avance"); 
                } else if (req.session.roles.includes('Admin AVANCE')) {
                    res.redirect("/editar-avance"); 
                } else if (req.session.roles.includes('Super Admin')) {
                    res.redirect("/super-admin"); 
                } else if (req.session.roles.includes('Residente')) {
                    res.redirect("/residentes"); 
                } else if (req.session.roles.includes('Infraestructura')) {
                    res.redirect("/asignar-residentes"); 
                }else if (req.session.roles.includes('Recepcionista')) {
                    res.redirect("/visitantes"); 
                }else {
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

export async function obtenerRolesUsuario(usuarioId) {
    try {
      const [rows] = await pool.query(`
        SELECT r.nombre_rol
        FROM roles r
        JOIN usuarios_roles ur ON r.id_rol = ur.id_rol
        WHERE ur.id_usuario = ?
      `, [usuarioId]);
      return rows.map(row => row.nombre_rol);
    } catch (error) {
      console.error("Error al obtener roles del usuario:", error);
      throw error; 
    }
  }

// Función para mostrar la página de registro
export function mostrarRegistro(req, res) {
    res.render("pages/register");
}

export async function procesarRegistro(req, res) {
    const { no_empleado, password, email_usuario, nombre_usuario, rol } = req.body;

    try {
        console.log("Datos recibidos del formulario:", req.body); // Imprimir los datos del formulario

        // Verifica si el usuario ya existe
        const [existente] = await pool.query(
            "SELECT * FROM usuarios WHERE no_empleado = ?",
            [no_empleado]
        );

        console.log("Resultado de la consulta:", existente); // Imprimir el resultado de la consulta

        if (existente.length > 0) {
            // Si el usuario ya existe, muestra un error
            console.log("El usuario ya existe"); // Registrar que el usuario existe
            return res.render("pages/register", { error: "El usuario ya existe" });
        } else {
            // Genera el hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            console.log("Contraseña hasheada:", hashedPassword); // Imprimir la contraseña hasheada

            // Si el usuario no existe, crear uno nuevo con la contraseña cifrada
            const query = "INSERT INTO usuarios (no_empleado, password_usuario, email_usuario, nombre_usuario, rol) VALUES (?, ?, ?, ?, ?)";
            const result = await pool.query(query, [no_empleado, hashedPassword, email_usuario, nombre_usuario, rol]);

            console.log("Resultado de la inserción:", result); // Imprimir el resultado de la inserción

            console.log("Usuario registrado"); // Registrar que el usuario se registró
            return res.redirect("/login");
        }
    } catch (error) {
        console.error("Error al procesar el registro:", error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
}