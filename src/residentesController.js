import pool from "./db.js";

export const mostrarObrasAsignadas = async (req, res) => {
    try {
      const residenteId = req.session.user.id_usuario;
      const [rows] = await pool.query(
        `SELECT oa.id, oa.nombre_obra, oa.porcentaje_fisico 
        FROM obras_avance oa
        JOIN obras_residentes obr ON oa.id = obr.obra_id
        WHERE obr.residente_id = ?`,                      
        [residenteId]
      );
      res.render("pages/residentes", { obras: rows, req: req });
    } catch (error) {
      console.error("Error al obtener obras asignadas:", error);
      res.status(500).json({ error: "Error al obtener obras asignadas" });
    }
  };

export const modificarAvanceFisico = async (req, res) => {
  try {
    const obraId = req.params.id;
    // ... (lógica para mostrar el formulario de modificación)
  } catch (error) {
    // ...
  }
};

export const guardarAvanceFisico = async (req, res) => {
  try {
    const obraId = req.params.id;
    const nuevoAvance = req.body.avanceFisico;
    await pool.query(
      "UPDATE obras_avance SET porcentaje_fisico = ? WHERE id = ?",
      [nuevoAvance, obraId]
    );

    // Enviar una respuesta exitosa al cliente para que muestre la alerta
    res.status(200).json({ message: 'Avance físico actualizado correctamente' }); 
  } catch (error) {
    console.error("Error al guardar avance físico:", error);
    res.status(500).json({ error: "Error al guardar avance físico" });
  }
};

export default {
  mostrarObrasAsignadas,
  modificarAvanceFisico,
  guardarAvanceFisico
};