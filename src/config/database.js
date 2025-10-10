const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("crmumkm", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
