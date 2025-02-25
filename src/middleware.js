import fileUpload from 'express-fileupload';

export function verificarAutenticacion(req, res, next) {
  if (req.session.user && req.session.roles) { 
    const rolesNecesarios = ['DIVA administrador', 'DIVA', 'Ventanilla', 'AVANCE', 'Admin AVANCE','Super Admin','Residente','Infraestructura','Ficha']; 
    if (req.session.roles.some(rol => rolesNecesarios.includes(rol))) {
      next();
    } else {
      res.redirect('/login');
    }
  } else {
    res.redirect('/login');
  }
}

export const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
});