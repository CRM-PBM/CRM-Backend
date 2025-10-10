const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Umkm = require("./Umkm");

const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  role: { type: DataTypes.ENUM("admin", "umkm"), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_login: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
  tableName: "USER",
  timestamps: false
});

User.belongsTo(Umkm, { foreignKey: "umkm_id" });
Umkm.hasMany(User, { foreignKey: "umkm_id" });

module.exports = User;
