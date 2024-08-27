import pool from "./db.js";

export const mostrarUsuarios = async (req, res) => {
  try {
    const obras = await listarObras(); // Utiliza la función listarUsuarios que ya tienes
    res.render("pages/usuarios", { obras }); // Asegúrate de pasar la variable correctamente
  } catch (error) {
    console.error("Error al obtener y mostrar los usuarios:", error);
    res.status(500).json({ error: "Error al obtener y mostrar los usuarios" });
  }
};


// Agregar una nueva Obra
export const agregarObra = async ({
  nombre_obra,
  descripcion_obra,
  fecha_inicio,
}) => {
  try {
    await pool.query(
      "INSERT INTO obras (nombre_obra, descripcion_obra, fecha_inicio, created_at) VALUES (?, ?, ?, ?)",
      [nombre_obra, descripcion_obra, fecha_inicio, new Date()]
    );
  } catch (error) {
    throw { status: 500, message: "Error al crear la Obra" };
  }
};


// Listar todas las Obras
export const listarObras = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM obras");
    return rows;
  } catch (error) {
    console.error("Error al obtener Obras:", error); 
    throw { status: 500, message: "Error al obtener Obras" };
  }
};


// Obtener detalles de un usuario por ID
// Obtener detalles de una obra por ID
export const obtenerDetallesObra = async (id) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM obras WHERE id_obra = ?',
      [id]
    );

    if (rows.length === 1) {
      return rows[0];
    } else {
      throw { status: 404, message: "Obra no encontrada" };
    }
  } catch (error) {
    console.error(error);
    throw { status: 500, message: "Error al obtener detalles de la obra" };
  }
};

// Actualizar una Obra por ID
export const actualizarObra = async (
  id,
  { nombre_obra, descripcion_obra, fecha_inicio }
) => {
  try {
    await pool.query(
      "UPDATE obras SET nombre_obra = ?, descripcion_obra = ?, fecha_inicio = ? WHERE id_obra = ?",
      [nombre_obra, descripcion_obra, fecha_inicio, id]
    );
  } catch (error) {
    throw {
      status: 500,
      message: `Error al actualizar la Obra con ID ${id}`,
    };
  }
};


export async function obtenerDetallesObraUpdate(id) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM obras WHERE id_obra = ?",
      [id]
    );

    if (rows.length === 1) {
      return rows[0];
    } else {
      throw { status: 404, message: "Obra no encontrada" };
    }
  } catch (error) {
    console.error(error);
    throw { status: 500, message: "Error al obtener detalles de la Obra" };
  }
}


// Eliminar una Obra por ID
export const eliminarObra = async (id) => {
  try {
    await pool.query("DELETE FROM obras WHERE id_obra = ?", [id]);
  } catch (error) {
    throw {
      status: 500,
      message: `Error al eliminar la Obra con ID ${id}`,
    };
  }
};

