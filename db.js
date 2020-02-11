const Sequelize = require('sequelize')
const databaseURL = process.env.DATABASE_URL 
const db = new Sequelize(databaseURL)
db
.sync({force: false})
.then(console.log('Database connected'))

.catch(console.error)


module.exports = db