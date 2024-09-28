import db from '../models'; // Ajusta según tu configuración de importación

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll(); // Ajusta según tu modelo de datos
    res.render('usuarios', { usuarios });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).send('Error al obtener los usuarios');
  }
};

export { listarUsuarios };