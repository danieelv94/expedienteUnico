import pool from "./db.js";
import multer from 'multer';

// Configuración de Multer para el manejo de subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Directorio donde se guardarán las fotos subidas
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Nombre único para cada archivo subido (timestamp + nombre original)
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Función para mostrar la lista de obras
export const mostrarObras = async (req, res) => {
    try {
        const obras = await listarObras(); // Obtener todas las obras con información de la DIVA asignada
        const divas = await obtenerDivas(); // Obtener todas las DIVAs
        res.render("pages/obras", { obras, divas, req: req }); // Renderizar la vista 'obras' y pasarle las obras, divas y el objeto req
    } catch (error) {
        console.error("Error al obtener y mostrar las Obras:", error);
        res.status(500).json({ error: "Error al obtener y mostrar las Obras" });
    }
};

// Función para filtrar las obras según un criterio de búsqueda
export const filtrarObras = async (req, res) => {
    try {
        const { filtro } = req.query; // Obtener el filtro de la consulta

        // Consulta SQL base para obtener las obras, incluyendo la información de la DIVA asignada
        let query = `
            SELECT 
                o.*, 
                ou.usuario_id AS diva_asignada, 
                u.nombre_usuario AS diva_asignada_nombre 
            FROM obras o
            LEFT JOIN obras_usuarios ou ON o.id_obra = ou.obra_id
            LEFT JOIN usuarios u ON ou.usuario_id = u.id_usuario
        `;

        const parametros = [];

        if (filtro) { // Si se proporciona un filtro, agregar una cláusula WHERE a la consulta
            query += ` WHERE nombre_obra LIKE ? OR descripcion_obra LIKE ?`; 
            const filtroModificado = `%${filtro}%`;
            parametros.push(filtroModificado, filtroModificado);
        }

        const [obras] = await pool.query(query, parametros); // Ejecutar la consulta y obtener las obras
        const divas = await obtenerDivas(); // Obtener todas las DIVAs

        res.render("pages/obras", { obras, filtro, divas, req: req }); // Renderizar la vista 'obras' y pasarle las obras, el filtro, las divas y el objeto req
    } catch (error) {
        res.status(500).json({ error: "Error al filtrar obras" });
    }
};

// Función para agregar una nueva obra
export const agregarObra = async ({
    nombre_obra,
    descripcion_obra,
    diva_asignada, 
}) => {
    try {
        // Insertar la obra en la tabla 'obras'
        const [result] = await pool.query(
            "INSERT INTO obras (nombre_obra, descripcion_obra, created_at) VALUES (?, ?, ?)",
            [nombre_obra, descripcion_obra, new Date()]
        );

        const obraId = result.insertId; // Obtener el ID de la obra recién creada

        // Insertar la asignación en la tabla 'obras_usuarios'
        await pool.query(
            "INSERT INTO obras_usuarios (obra_id, usuario_id) VALUES (?, ?)",
            [obraId, diva_asignada]
        );

    } catch (error) {
        throw { status: 500, message: "Error al crear la Obra" };
    }
};

// Función para obtener las obras asignadas a un usuario específico
export const obtenerObrasAsignadasAUsuario = async (usuarioId) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                o.*, 
                u.nombre_usuario AS diva_asignada_nombre 
            FROM obras o
            JOIN obras_usuarios ou ON o.id_obra = ou.obra_id
            JOIN usuarios u ON ou.usuario_id = u.id_usuario
            WHERE ou.usuario_id = ?
        `, [usuarioId]);
        return rows;
    } catch (error) {
        console.error("Error al obtener obras asignadas al usuario:", error); 
        throw { status: 500, message: "Error al obtener obras asignadas al usuario" };
    }
}

// Función para listar todas las obras, incluyendo la información de la DIVA asignada
export const listarObras = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                o.*, 
                ou.usuario_id AS diva_asignada, 
                u.nombre_usuario AS diva_asignada_nombre 
            FROM obras o
            LEFT JOIN obras_usuarios ou ON o.id_obra = ou.obra_id
            LEFT JOIN usuarios u ON ou.usuario_id = u.id_usuario
        `);
        return rows;
    } catch (error) {
        console.error("Error al obtener Obras:", error); 
        throw { status: 500, message: "Error al obtener Obras" };
    }
};

// Función para obtener los detalles de una obra por su ID, incluyendo la información de la DIVA asignada
export const obtenerDetallesObra = async (id) => {
    try {
        const [obraRows] = await pool.query(`
            SELECT 
                o.*, 
                u.nombre_usuario AS diva_asignada_nombre 
            FROM obras o
            LEFT JOIN obras_usuarios ou ON o.id_obra = ou.obra_id
            LEFT JOIN usuarios u ON ou.usuario_id = u.id_usuario
            WHERE o.id_obra = ?
        `, [id]);

        if (obraRows.length === 0) {
            throw { status: 404, message: "Obra no encontrada" };
        }

        const obra = obraRows[0];

        // Obtener el número de visitas a la obra
        const [visitasCountRows] = await pool.query(
            'SELECT COUNT(*) AS num_visitas FROM visitas WHERE obra_id = ?',
            [id]
        );
        obra.num_visitas = visitasCountRows[0].num_visitas;

        // Obtener las fotos de la última visita (si existe)
        const [fotosRows] = await pool.query(`
            SELECT f.ruta_foto 
            FROM fotos f
            JOIN visitas v ON f.visita_id = v.id
            WHERE v.obra_id = ?
            ORDER BY v.fecha_visita DESC 
            LIMIT 5 
        `, [id]);
        obra.fotos = fotosRows.map(foto => foto.ruta_foto);

        return obra;
    } catch (error) {
        console.error("Error al obtener detalles de la Obra:", error);
        throw { status: error.status || 500, message: error.message || "Error al obtener detalles de la Obra" };
    }
};

// Actualizar una Obra por ID
export const actualizarObra = async (
  id,
  { nombre_obra, descripcion_obra, diva_asignada } 
) => {
  try {
      // Actualizar la obra en la tabla 'obras'
      await pool.query(
          "UPDATE obras SET nombre_obra = ?, descripcion_obra = ? WHERE id_obra = ?",
          [nombre_obra, descripcion_obra, id]
      );

      // Actualizar la asignación en la tabla 'obras_usuarios'
      // Primero, elimina cualquier asignación existente para esta obra
      await pool.query(
          "DELETE FROM obras_usuarios WHERE obra_id = ?",
          [id]
      );

      // Luego, inserta la nueva asignación
      await pool.query(
          "INSERT INTO obras_usuarios (obra_id, usuario_id) VALUES (?, ?)",
          [id, diva_asignada]
      );

  } catch (error) {
      throw {
          status: 500,
          message: `Error al actualizar la Obra con ID ${id}`,
      };
  }
};

// Obtener usuarios con rol DIVA
export const obtenerDivas = async () => {
  try {
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE rol = 'DIVA'");
      return rows;
  } catch (error) {
      console.error("Error al obtener DIVAs:", error);
      throw { status: 500, message: "Error al obtener DIVAs" };
  }
};

// Verificar si el usuario está asignado a la obra
export const verificarAsignacionUsuario = async (obraId, usuarioId) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM obras_usuarios WHERE obra_id = ? AND usuario_id = ?',
            [obraId, usuarioId]
        );
        return rows.length > 0; 
    } catch (error) {
        console.error("Error al verificar asignación de usuario:", error);
        throw { status: 500, message: "Error al verificar asignación de usuario" };
    }
  }

export async function obtenerDetallesObraUpdate(id) {
  try {
      const [rows] = await pool.query(
          "SELECT * FROM obras WHERE id_obra = ?",
          [id]
      );

      if (rows.length === 1) {
          const obra = rows[0];
          const divas = await obtenerDivas(); // Obtener las DIVAs
          return { obra, divas }; // Retornar ambos: obra y divas
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
      // Eliminar primero los registros relacionados en obras_usuarios
      await pool.query('DELETE FROM obras_usuarios WHERE obra_id = ?', [id]);

      // Luego, eliminar la obra
      const [result] = await pool.query('DELETE FROM obras WHERE id_obra = ?', [id]);
      return result;
  } catch (error) {
      console.error("Error al eliminar la Obra:", error);
      throw { status: 500, message: "Error al eliminar la Obra" };
  }
};

export const subirFotos = upload.array('fotos'); // Configuración de Multer
export const handleSubirFotos = async (req, res) => {  // Manejador de la ruta
    try {
        const obraId = req.params.id;
        const usuarioId = req.session.user.id_usuario;

        // Verificar si el usuario está asignado a la obra
        const estaAsignado = await verificarAsignacionUsuario(obraId, usuarioId);
        if (!estaAsignado) {
            return res.status(403).send('No estás asignado a esta obra'); 
        }

        // Crear un nuevo registro de visita
        const [visitaResult] = await pool.query(
            'INSERT INTO visitas (obra_id, usuario_id) VALUES (?, ?)',
            [obraId, usuarioId]
        );
        const visitaId = visitaResult.insertId;

        // Guardar las fotos en la base de datos
        for (const file of req.files) {
            const rutaFoto = '/uploads/' + file.filename; 
            await pool.query(
                'INSERT INTO fotos (visita_id, ruta_foto) VALUES (?, ?)',
                [visitaId, rutaFoto]
            );
        }

        res.redirect(`/check-in-obra/${obraId}`);
    } catch (error) {
        console.error("Error al subir fotos:", error);
        res.status(500).json({ error: "Error al subir fotos" });
    }
};



export const obtenerDocumentos = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM documentos");
        return rows;
    } catch (error) {
        console.error("Error al obtener Documentos:", error);
        throw { status: 500, message: "Error al obtener Documentos" };
    }
};


export default {
    subirFotos, // Exportar la configuración de Multer
    handleSubirFotos, // Exportar el manejador de la ruta 
    subirFotos,
    mostrarObras, 
    agregarObra, 
    obtenerDetallesObraUpdate, 
    obtenerDetallesObra, 
    actualizarObra, 
    eliminarObra,
    filtrarObras,
    obtenerDivas,
    obtenerObrasAsignadasAUsuario,
    verificarAsignacionUsuario
};