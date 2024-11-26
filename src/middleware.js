export function verificarAutenticacion(req, res, next) {
    if (req.session.user && req.session.roles) { 
      // Verificar si el usuario tiene alguno de los roles necesarios
      const rolesNecesarios = ['DIVA administrador', 'DIVA', 'Ventanilla', 'AVANCE', 'Admin AVANCE','Super Admin','Residente']; // Ajusta los roles según la sección
      if (req.session.roles.some(rol => rolesNecesarios.includes(rol))) {
        next();
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  }