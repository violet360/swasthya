const { Router } = require("express");
const router = Router({ mergeParams: true });
const { database } = require("../../models/export");
var crypto = require("crypto"); // to hash password
var { isAuth } = require("../../middleware/auth");
const { v4: uuidv4 } = require("uuid");

const doctor = database.doctor;
const scoreCard = database.scoreCard;
const user = database.user;
const healthJournal = database.healthJournal;
const consult = database.consult;

const Op = database.Sequelize.Op; //operator

const userCheck =
  (isAuth,
  async (req, res, next) => {
    const { username } = req.params;
    const sessID = req.session.loggerID;
    try {
      const loggedInObj = await user.findOne({
        where: { [Op.and]: [{ user_id: sessID, username }] },
      });
      // console.log(loggerInObj)
      if (loggedInObj != null) {
        next();
      } else {
        res.status(500).send("you are not authorized to do this task");
      }
    } catch (err) {
      res.status(500).send("some internal err");
    }
  });

router.post("/scoreCard", userCheck, async (req, res) => {
  const { sessID } = req.session.loggerID;
  const { score } = req.query;
  const scoreObj = { userID: sessID, googleFitScore: score };
  try {
    const newScore = await scoreCard.create(scoreObj);

    if (newScore) {
      res.send(newScore);
    } else {
      res.status(500).send({
        msg: "some internal error",
      });
    }
  } catch (err) {
    res.status(500).send("some internal err");
  }
});

router.post("/allow", userCheck, async (req, res) => {
  const { doctorMails } = req.body;
  const { loggerID } = req.session;
  try {
    const docCollect = await doctor.findAll({
      where: { email: { [Op.in]: doctorMails } },
    });
    if (docCollect) {
      const payload = [];
      for (docObj of docCollect) {
        let meet = {
          userID: loggerID,
          doctorID: docObj.dataValues.doctor_id,
        };
        let foundMeet = await consult.findOne({
          where: { [Op.and]: [meet] },
        });

        if (foundMeet) {
        } else {
          payload.push(meet);
        }
      }
      const meetList = await consult.bulkCreate(payload);
      // console.log(meetList) // this fucking error
      res.sendStatus(200);
    } else {
      res.status(404).send({
        msg: "doctor not on platform",
      });
    }
  } catch (err) {
    res.status(500).send({
      msg: err,
    });
  }
});

//not yet testable
router.post("/", async (req, res) => {
  const { username } = req.params;
  const sessID = req.session.loggerID;
  if (sessID == undefined) {
    /*return 
      {
          fitScoreList : []
      } */
  } else {
    const loggedInObj = await user.findOne({
      where: { [Op.and]: [{ user_id: sessID, username }] },
    });
    if (loggedInObj) {
        /*
        return 
        {
            fitScoreList : []
            journals : []
            doctors : []
        }
        */
    } else {
        /*
        resp 
        {
            fitScoreList = []
        }
        */
    }
    res.status(200).send({ msg: "/:username/", username });
  }
});

router.post("/update", userCheck, async (req, res) => {
  const { username, email } = req.body;
  const user_id = req.session.loggerID;
  let userObj = await user.findOne({ where: { user_id } });
  userObj.username = username;
  userObj.email = email;
  userObj.save();
  res.sendStatus(200);
});

router.post("/:journalTitle/edit", userCheck, async (req, res) => {
  const { title, description } = req.body;
  const { journalTitle } = req.params;
  const userID = req.session.loggerID;
  let userObj = await healthJournal.findOne({
    where: { userID, title: journalTitle },
  });
  userObj.title = title;
  userObj.description = description;
  userObj.save();
  res.sendStatus(200);
});

router.post("/add", userCheck, async (req, res) => {
  const { title, description } = req.body;
  const user_id = req.session.loggerID;
  let journal = await healthJournal.create({
    title,
    description,
    userID: user_id,
  });
  if (journal) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

module.exports = router;
