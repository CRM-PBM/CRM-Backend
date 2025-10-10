const sequelize = require("./config/database");
const Umkm = require("./models/Umkm");
const User = require("./models/User");
const Pelanggan = require("./models/Pelanggan");
const Produk = require("./models/Produk");
const Broadcast = require("./models/Broadcast");
const BroadcastDetail = require("./models/BroadcastDetail");
const Transaksi = require("./models/Transaksi");
const DetailTransaksi = require("./models/DetailTransaksi");
const Invoice = require("./models/Invoice");

(async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log("✅ Database & tables synced!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  } finally {
    await sequelize.close();
  }
})();
