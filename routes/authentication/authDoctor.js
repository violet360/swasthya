const { Router } = require('express');
const router = Router();
const { database } = require('../../models/export')
var crypto = require('crypto'); // to hash password 
const {
    v4: uuidv4,
} = require('uuid');

const doctor = database.doctor;
const Op = database.Sequelize.Op //operator

router.post('/signup', async (req, res) => {
    let doc = req.body;
    doc.password = crypto.createHash('sha256').update(doc.password).digest('hex'); //hashing the password for storing in the database
    doc.doctor_id = uuidv4();
    try {
        let { email } = doc; //checking for existing user
        let found = await doctor.findOne({
            where: { email }
        })
        if (found) res.status(500).send({ msg: "Create the account with different Email ID" });
        else {
            try {
                const newDocObj = doc;
                const newDoc = await doctor.create(newDocObj);
                res.status(200).send(newDoc);
            }
            catch (err) {
                res.status(500).send({ msg: "some Internal error!" })
            }
        }
    }
    catch (err) {
        res.status(500).send({ msg: "Internal error!" })
    }
})



router.post('/signin', async (req, res) => {
    let doc = req.body;
    doc.password = crypto.createHash('sha256').update(doc.password).digest('hex');
    try {
        const loggedInDoc = await doctor.findOne({
            where: { [Op.and]: [doc] }
        })
        if (loggedInDoc) {
            req.session.loggerID = loggedInDoc.doctor_id;
            res.status(200).send(loggedInDoc);
        } else {
            res.status(404).send({
                msg: "Signup First"
            })
        }
    } catch (err) {
        res.status(500).send({
            err
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send({
        msg: "Good bye"
    })
});

module.exports = router;