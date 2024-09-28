export function verificarAutenticacion(req, res, next) {
    if (req.session.user && 
        (req.session.user.rol === 'DIVA administrador' || 
         req.session.user.rol === 'DIVA')
    ) {
        next(); // Si el usuario está autenticado y tiene el rol 'DIVA administrador' o 'DIVA usuario', continúa
    } else {
        res.redirect("/login"); // Si no está autenticado o no tiene el rol correcto, redirige al login
    }
}