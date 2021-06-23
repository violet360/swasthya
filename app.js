const express = require('express')
const session = require('./middleware/session');
const {authUser, authDoctor} = require("./routes/exportRoute")
const app = express();

app.use(session);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(3000, () => console.log('server is running in port 3000'))

database.sequelize.sync(); // sync database and sequelize
app.use('/', authUser);
app.use('/doctor', authDoctor);
