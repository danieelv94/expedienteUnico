export function verificarAutenticacion(req, res, next) {
    if (req.session.user && 
        (req.session.user.rol === 'DIVA administrador' || 
         req.session.user.rol === 'DIVA' ||
         req.session.user.rol === 'Ventanilla'||
         req.session.user.rol === 'AVANCE' ||
         req.session.user.rol === 'Admin AVANCE')
    ) {
        next(); 
    } else {
        res.redirect("/login"); 
    }
}