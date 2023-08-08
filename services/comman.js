const passport = require("passport")

exports.isAuth=(req, res, done)=> {
    return passport.authenticate('jwt');
}

exports.sanitizeUser=(user)=>{
    return {id:user.id, role:user.role}
}

exports.cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0Y2Y1MzUwMWQzMDhjYjdhOTFjZmU1MiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkxNDE0MDIwfQ.kK-Aex8nwiK3uYxeSaCOr-Q7igMV05d-Flc3jsLZZng'
    return token;
};