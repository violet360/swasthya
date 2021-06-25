const express = require('express')
const session = require('./middleware/session');
const {authUser, authDoctor, userProfile} = require("./routes/exportRoute")
// const { database } = require('./models/')
const app = express();

app.use(session);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`${req.method} - ${req.url}`);
    next();
});

database.sequelize.sync(); // sync database and sequelize
app.use('/', authUser);
app.use('/doctor', authDoctor);
app.use('/:username', userProfile);

app.listen(3000, () => console.log('server is running in port 3000'))

