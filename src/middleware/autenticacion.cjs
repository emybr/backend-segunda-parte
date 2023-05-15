

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() || req.session.email) {
        req.session.email = req.session.email || req.user.email;
        return next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    }
}



function ensureAdmin(req, res, next) {
    if ((req.isAuthenticated() && req.user.role === 'admin') || (req.session.isAuthenticated && req.session.userRole === 'admin')) {
        req.session.isAuthenticated = true;
        req.session.userRole = req.user.role;
        return next();
    } else {
        res.redirect('/login');
    }
}


module.exports = { ensureAdmin, ensureAuthenticated }