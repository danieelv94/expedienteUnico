import pool from "./db.js";

export const mostrarSuperAdmin = async (req, res) => {
  if (req.session.user.rol !== 'Super Admin') { 
    return res.status(403).send('No tienes permiso para acceder a esta página');
  }
  try {
    const usuarios = await obtenerUsuariosConRoles();
    const roles = await obtenerRoles();
    res.render("pages/super-admin", { usuarios, roles, req: req });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const obtenerUsuariosConRoles = async () => {
    try {
      const [rows] = await pool.query(`
        SELECT u.id_usuario, u.no_empleado, u.nombre_usuario, GROUP_CONCAT(r.nombre_rol) AS roles  
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario
        LEFT JOIN roles r ON ur.id_rol = r.id_rol
        GROUP BY u.id_usuario, u.nombre_usuario
      `);
      return rows.map(row => ({
        ...row,
        roles: row.roles ? row.roles.split(',') : [] 
      }));
    } catch (error) {
      console.error("Error al obtener usuarios con roles:", error);
      throw { status: 500, message: "Error al obtener usuarios con roles" };
    }
  };

export const obtenerRoles = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM roles");
    return rows;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw { status: 500, message: "Error al obtener roles" };
  }
};

export const guardarRolesUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const roles = req.body.roles || [];

    // Verificar si el usuario existe
    const [usuario] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [usuarioId]);
    if (usuario.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Eliminar los roles existentes del usuario
    await pool.query("DELETE FROM usuarios_roles WHERE id_usuario = ?", [usuarioId]);

    // Insertar los nuevos roles del usuario
    for (const rolId of roles) {
      await pool.query("INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?, ?)", [usuarioId, rolId]);
    }

    res.status(200).send('Roles actualizados correctamente');
  } catch (error) {
    console.error("Error al guardar los roles del usuario:", error);
    res.status(500).json({ error: "Error al actualizar los roles" });
  }
};

export const eliminarRolesUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Eliminar los roles del usuario en la tabla `usuarios_roles`
    await pool.query("DELETE FROM usuarios_roles WHERE id_usuario = ?", [usuarioId]);

    res.status(200).send('Roles eliminados correctamente');
  } catch (error) {
    console.error("Error al eliminar los roles del usuario:", error);
    res.status(500).json({ error: "Error al eliminar los roles" });
  }
};

export default {
  mostrarSuperAdmin,
  obtenerUsuariosConRoles,
  obtenerRoles,
  guardarRolesUsuario,
  eliminarRolesUsuario
};