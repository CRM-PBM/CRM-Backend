const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/database');
const Transaksi = require('../models/Transaksi');
const DetailTransaksi = require('../models/DetailTransaksi');
const Pelanggan = require('../models/Pelanggan');
const Produk = require('../models/Produk');
const Invoice = require('../models/Invoice');
const Umkm = require('../models/Umkm'); 

class TransaksiService {

    getDateFormat(period) { 
        switch (period) {
            case 'day': return '%Y-%m-%d';
            case 'week': return '%Y-%v'; 
            case 'month': return '%Y-%m';
            case 'year': return '%Y';
            default: return '%Y-%m-%d'; 
        }
    }

    getStartDate(period) { 
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0); 
        
        switch (period) {
            case 'day': 
                startDate.setDate(startDate.getDate() - 30); 
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 90); 
                break;
            case 'year': 
                startDate.setFullYear(startDate.getFullYear() - 5); 
                startDate.setMonth(0, 1);
                break;
            case 'month':
            default:
                startDate.setFullYear(startDate.getFullYear() - 1); 
                startDate.setDate(1); 
                break;
        }
        return startDate;
    }
    
    async getTransaksiGrowthData(umkmId, period = 'day') { 
        const umkmWhere = { umkm_id: umkmId };
        const startDate = this.getStartDate(period);
        const format = this.getDateFormat(period);
        
        const groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('tanggal_transaksi'), format);

        try {
            const growthData = await Transaksi.findAll({
                attributes: [
                    [groupBy, 'period'],
                    [sequelize.fn('COUNT', sequelize.col('transaksi_id')), 'new_transactions']
                ],
                where: {
                    tanggal_transaksi: {
                        [Op.gte]: startDate,
                    },
                },
                include: [this.getPelangganFilterInclude(umkmId)],
                group: [sequelize.literal('period')],
                order: [[sequelize.literal('period'), 'ASC']],
                raw: true,
            });

            const rawData = growthData.map(item => ({
                period: item.period,
                new_transactions: parseInt(item.new_transactions)
            }));
            
            let cumulativeCount = await Transaksi.count({ 
                where: { 
                    tanggal_transaksi: { [Op.lt]: startDate },
                },
                include: [this.getPelangganFilterInclude(umkmId)],
            });
            
            const result = rawData.map(item => {
                cumulativeCount += item.new_transactions;
                
                return {
                    period: item.period,
                    new_transactions: item.new_transactions,
                    cumulative_transactions: cumulativeCount
                };
            });

            return result;

        } catch (error) {
            throw error;
        }
    }


    async generateKodeTransaksi(umkmId, pelangganId, transaksiId) {
        const umkmCode = String(umkmId).padStart(2, '0');      
        const pelangganCode = String(pelangganId).padStart(2, '0');
        const transaksiCode = String(transaksiId).padStart(3, '0'); 

        return `TRX${umkmCode}${pelangganCode}${transaksiCode}`;
    }
    
    getMonthDateRange(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return { start, end };
    }

    getPelangganFilterInclude(umkmId) {
        return {
            model: Pelanggan,
            required: true,
            attributes: [], 
            where: { umkm_id: umkmId }
        };
    }

    async getStatistik(umkmId) {
      const today = new Date();
      const currentMonth = this.getMonthDateRange(today);
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonth = this.getMonthDateRange(lastMonthDate);

      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const pelangganFilter = this.getPelangganFilterInclude(umkmId);

      const [
        currentRow,
        todayRow,
        lastRow,
        topProducts
      ] = await Promise.all([
        Transaksi.findOne({
          attributes: [
            [sequelize.fn('SUM', sequelize.col('Transaksi.total')), 'total_pendapatan'],
            [sequelize.fn('COUNT', sequelize.col('Transaksi.transaksi_id')), 'total_transaksi'],
            [sequelize.fn('AVG', sequelize.col('Transaksi.total')), 'rata_rata'],
          ],
          where: { tanggal_transaksi: { [Op.between]: [currentMonth.start, currentMonth.end] } },
          include: [pelangganFilter],
          raw: true
        }),

        Transaksi.findOne({
          attributes: [
            [sequelize.fn('SUM', sequelize.col('Transaksi.total')), 'pendapatan_hari_ini'],
            [sequelize.fn('COUNT', sequelize.col('Transaksi.transaksi_id')), 'total_hari_ini'],
          ],
          where: { tanggal_transaksi: { [Op.between]: [startOfToday, endOfToday] } },
          include: [pelangganFilter],
          raw: true
        }),

        Transaksi.findOne({
          attributes: [
            [sequelize.fn('SUM', sequelize.col('Transaksi.total')), 'total_pendapatan'],
          ],
          where: { tanggal_transaksi: { [Op.between]: [lastMonth.start, lastMonth.end] } },
          include: [pelangganFilter],
          raw: true
        }),

        DetailTransaksi.findAll({
          attributes: [
            'produk_id',
            [sequelize.fn('SUM', sequelize.col('DetailTransaksi.jumlah')), 'total_terjual'],
            [sequelize.fn('SUM', sequelize.col('DetailTransaksi.subtotal')), 'total_pendapatan']
          ],
          include: [
            {
              model: Transaksi,
              attributes: [],
              required: true,
              where: { tanggal_transaksi: { [Op.between]: [currentMonth.start, currentMonth.end] } },
              include: [this.getPelangganFilterInclude(umkmId)]
            },
            { model: Produk, attributes: ['nama_produk'] }
          ],
          group: ['produk_id', 'Produk.nama_produk'],
          order: [[sequelize.fn('SUM', sequelize.col('jumlah')), 'DESC']],
          limit: 5,
          raw: true
        })
      ]);

      const currentRevenue = parseFloat(currentRow?.total_pendapatan || 0);
      const currentTransactions = parseInt(currentRow?.total_transaksi || 0);
      const currentAverage = parseFloat(currentRow?.rata_rata || 0);

      const pendapatanHariIni = parseFloat(todayRow?.pendapatan_hari_ini || 0);
      const totalHariIni = parseInt(todayRow?.total_hari_ini || 0);

      const lastRevenue = parseFloat(lastRow?.total_pendapatan || 0);

      let pertumbuhan = 0;
      if (lastRevenue > 0) {
        pertumbuhan = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
      } else if (currentRevenue > 0) {
        pertumbuhan = 100;
      }

      return {
        total_transaksi: currentTransactions,
        total_pendapatan: currentRevenue,
        rata_rata: currentAverage,
        pendapatan_hari_ini: pendapatanHariIni,
        total_hari_ini: totalHariIni,
        pertumbuhan: parseFloat(pertumbuhan.toFixed(1)),
        top_products: topProducts
      };
    }

    async generateNomorTransaksi() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const prefix = `TRX-${year}${month}${day}`;
        
        const lastTransaction = await Transaksi.findOne({
            where: {
                nomor_transaksi: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['transaksi_id', 'DESC']]
        });

        let sequence = 1;
        if (lastTransaction) {
            const lastNumber = lastTransaction.nomor_transaksi.split('-')[2];
            sequence = parseInt(lastNumber) + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    async getAllTransaksi(filters = {}, umkmId) {
        const { 
            page = 1, 
            limit = 10, 
            pelanggan_id, 
            metode_pembayaran,
            start_date,
            end_date,
            search 
        } = filters;
        const offset = (page - 1) * limit;

        const where = {};
        
        if (pelanggan_id) where.pelanggan_id = pelanggan_id;
        if (metode_pembayaran) where.metode_pembayaran = metode_pembayaran;

        if (search) {
            where[Op.or] = [
                { nomor_transaksi: { [Op.like]: `%${search}%` } },
                { keterangan: { [Op.like]: `%${search}%` } }
            ];
        }

        const umkmFilterInclude = this.getPelangganFilterInclude(umkmId);

        const { count, rows } = await Transaksi.findAndCountAll({
            where,
            include: [
                umkmFilterInclude,
                { 
                    model: Pelanggan, 
                    attributes: ['pelanggan_id', 'nama', 'telepon', 'email'],
                    required: true, 
                    where: { umkm_id: umkmId }
                },
                {
                    model: DetailTransaksi,
                    include: [
                        {
                            model: Produk,
                            attributes: ['produk_id', 'nama_produk', 'harga']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['tanggal_transaksi', 'DESC']], 
            distinct: true
        });

        return {
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getTransaksiById(id) {
      const transaksi = await Transaksi.findByPk(id, {
        include: [
          { 
            model: Pelanggan, 
            attributes: ['pelanggan_id', 'nama', 'telepon', 'email'] 
          },
          {
            model: DetailTransaksi,
            include: [
              {
                model: Produk,
                attributes: ['produk_id', 'nama_produk', 'harga']
              }
            ]
          },
          {
            model: Invoice,
            attributes: ['invoice_id', 'nomor_invoice', 'tanggal_cetak', 'path_file']
          }
        ]
      });

      if (!transaksi) {
        throw new Error('Transaksi tidak ditemukan');
      }

      return transaksi;
    }

    async createTransaksi(data) {
      const { pelanggan_id, items, metode_pembayaran, keterangan, umkm_id } = data;

      if (!items || items.length === 0) {
        throw new Error('Items transaksi wajib diisi');
      }

      const t = await sequelize.transaction();

      try {
        const nomor_transaksi = await this.generateNomorTransaksi();

        let total = 0;
        const validatedItems = [];

        for (const item of items) {
          const produk = await Produk.findByPk(item.produk_id, { transaction: t });
          
          if (!produk) {
            throw new Error(`Produk dengan ID ${item.produk_id} tidak ditemukan`);
          }

          if (!produk.aktif) {
            throw new Error(`Produk ${produk.nama_produk} tidak aktif`);
          }

          if (produk.stok < item.jumlah) {
            throw new Error(`Stok produk ${produk.nama_produk} tidak mencukupi. Stok tersedia: ${produk.stok}`);
          }

          const harga_satuan = item.harga_satuan || produk.harga;
          const subtotal = parseFloat(harga_satuan) * parseInt(item.jumlah);
          
          validatedItems.push({
            produk_id: item.produk_id,
            jumlah: item.jumlah,
            harga_satuan: harga_satuan,
            subtotal: subtotal
          });

          total += subtotal;

          await produk.update(
            { stok: produk.stok - item.jumlah },
            { transaction: t }
          );
        }

        const transaksi = await Transaksi.create({
          nomor_transaksi,
          pelanggan_id,
          tanggal_transaksi: new Date(),
          total,
          metode_pembayaran,
          keterangan,
          umkm_id
        }, { transaction: t });

        const kode_transaksi = await this.generateKodeTransaksi(
          umkm_id, 
          pelanggan_id, 
          transaksi.transaksi_id
        );
        
        await transaksi.update({ kode_transaksi }, { transaction: t });

        for (const item of validatedItems) {
          await DetailTransaksi.create({
            transaksi_id: transaksi.transaksi_id,
            ...item
          }, { transaction: t });
        }

        await t.commit();

        return this.getTransaksiById(transaksi.transaksi_id);

      } catch (error) {
        await t.rollback();
        throw error;
      }
    }

    async updateTransaksi(id, data) {
      const transaksi = await Transaksi.findByPk(id);

      if (!transaksi) {
        throw new Error('Transaksi tidak ditemukan');
      }

      const { metode_pembayaran, keterangan, pelanggan_id } = data;

      await transaksi.update({
        metode_pembayaran: metode_pembayaran || transaksi.metode_pembayaran,
        keterangan: keterangan !== undefined ? keterangan : transaksi.keterangan,
        pelanggan_id: pelanggan_id || transaksi.pelanggan_id
      });

      return this.getTransaksiById(id);
    }

    async deleteTransaksi(id) {
      const t = await sequelize.transaction();

      try {
        const transaksi = await Transaksi.findByPk(id, {
          include: [DetailTransaksi],
          transaction: t
        });

        if (!transaksi) {
          throw new Error('Transaksi tidak ditemukan');
        }

        for (const detail of transaksi.DetailTransaksis) {
          const produk = await Produk.findByPk(detail.produk_id, { transaction: t });
          if (produk) {
            await produk.update(
              { stok: produk.stok + detail.jumlah },
              { transaction: t }
            );
          }
        }

        await DetailTransaksi.destroy({
          where: { transaksi_id: id },
          transaction: t
        });

        await Invoice.destroy({
          where: { transaksi_id: id },
          transaction: t
        });

        await transaksi.destroy({ transaction: t });

        await t.commit();

        return { message: 'Transaksi berhasil dihapus' };

      } catch (error) {
        await t.rollback();
        throw error;
      }
    }

    async getTransaksiByPelanggan(pelanggan_id, filters = {}) {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      const { count, rows } = await Transaksi.findAndCountAll({
        where: { pelanggan_id },
        include: [
          {
            model: DetailTransaksi,
            include: [
              {
                model: Produk,
                attributes: ['produk_id', 'nama_produk', 'harga']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['tanggal_transaksi', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    }
}


module.exports = new TransaksiService();