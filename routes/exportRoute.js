const authUser = require("./authentication/authUser")
const authDoctor = require("./authentication/authDoctor")
const userProfile = require("./userCrud/userCrud")
module.exports = {
    authUser,
    authDoctor,
    userProfile
}