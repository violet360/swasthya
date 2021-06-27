const { Router } = require("express");
const router = Router();
const { database } = require("../../models/export");
var crypto = require("crypto"); // to hash password
const { v4: uuidv4 } = require("uuid");

const {isAuth} = require("../../middleware/auth");

const doctor = database.doctor;
const user = database.user;
const consult = database.consult;

const Op = database.Sequelize.Op; //operator
router.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

router.post("/signup", async (req, res) => {
  let doc = req.body;
  doc.password = crypto.createHash("sha256").update(doc.password).digest("hex"); //hashing the password for storing in the database
  doc.doctor_id = uuidv4();
  try {
    let { email } = doc; //checking for existing user
    let found = await doctor.findOne({
      where: { email },
    });
    if (found)
      res
        .status(500)
        .send({ msg: "Create the account with different Email ID" });
    else {
      try {
        const newDocObj = doc;
        const newDoc = await doctor.create(newDocObj);
        res.status(200).send(newDoc);
      } catch (err) {
        res.status(500).send({ msg: "some Internal error!" });
      }
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal error!" });
  }
});

router.post("/signin", async (req, res) => {
  let doc = req.body;
  doc.password = crypto.createHash("sha256").update(doc.password).digest("hex");
  try {
    const loggedInDoc = await doctor.findOne({
      where: { [Op.and]: [doc] },
    });
    if (loggedInDoc) {
      req.session.loggerID = loggedInDoc.doctor_id;
      res.status(200).send(loggedInDoc);
    } else {
      res.status(404).send({
        msg: "Signup First",
      });
    }
  } catch (err) {
    res.status(500).send({
      err,
    });
  }
});

router.post("/logout", isAuth, (req, res) => {
  req.session.destroy();
  res.status(200).send({
    msg: "Good bye",
  });
});

router.post("/:username", isAuth, async(req, res) => {
  const { username } = req.params;
  const doc = await doctor.findOne({
    where: { username, doctor_id: req.session.loggerID },
  });
  console.log(doc, "-")
  if (doc) {
    const meets = await consult.findAll({
      where: { doctorID: req.session.loggerID },
    });
    const patients = [];
    for (m of meets) {
      patients.push(m.userID);
    }
    console.log(patients);
    // res.send("works!!!");
    const userProfiles = await user.findAll({where : {user_id : {[Op.in]:patients}}})
    let userP = []
    for(u of userProfiles) {
        userP.push(u.username)
    }
    res.send({doctor : username, userP})

  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
