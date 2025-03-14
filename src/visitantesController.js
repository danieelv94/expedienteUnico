// visitantesController.js
import pool from './db.js'; // Asegúrate de que la ruta a tu configuración de la base de datos sea correcta

export const registrarVisitante = async (req, res) => {
  try {
    const { nombre, municipio,dependencia, telefono, email, a_quien_visita, motivo } = req.body;

    const sql = `INSERT INTO visitantes (nombre, municipio,dependencia, telefono, email, a_quien_visita, motivo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, municipio,dependencia, telefono, email, a_quien_visita, motivo];

    await pool.query(sql, values);

    res.status(201).json({ message: 'Visitante registrado con éxito.' });
  } catch (error) {
    console.error('Error al registrar visitante:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const obtenerVisitantes = async(req,res) =>{
  try{
    const[rows] = await pool.query('SELECT * FROM visitantes')
    res.status(200).json(rows)

  }catch(error){
    console.error('Error al obtener visitantes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}