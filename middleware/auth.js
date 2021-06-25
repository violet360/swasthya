const isAuth = (req, res, next) => {
    const { loggerID } = req.session;
    if (loggerID) {
        next()
    } else {
        res.redirect('/login');
    }
}
module.exports = {
    isAuth
}