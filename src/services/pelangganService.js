const { Op } = require('sequelize');
const Pelanggan = require('../models/Pelanggan');
const Umkm = require('../models/Umkm');
const sequelize = require('../config/database');

class PelangganService {

    getMonthDateRange(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return { start, end };
    }

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
                startDate.setDate(startDate.getDate() - 30); // 30 hari terakhir
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 90); // 3 bulan terakhir (~12 minggu)
                break;
            case 'year': 
                startDate.setFullYear(startDate.getFullYear() - 5); // 5 tahun terakhir
                startDate.setMonth(0, 1);
                break;
            case 'month':
            default:
                startDate.setFullYear(startDate.getFullYear() - 1); // 12 bulan terakhir
                startDate.setDate(1); 
                break;
        }
        return startDate;
    }

    async generateKodePelanggan(umkmId, gender) {
        const GENDER_CODES = {
            "Pria": '01',
            "Wanita": '02',
        };

        const umkmCode = String(umkmId).padStart(2, '0');
        const genderCode = GENDER_CODES[gender] || '00'; 

        const lastPelanggan = await Pelanggan.findOne({
            order: [['pelanggan_id', 'DESC']],
            limit: 1,
        });

        const nextId = (lastPelanggan ? lastPelanggan.pelanggan_id : 0) + 1;
        const sequenceCode = String(nextId).padStart(3, '0');

        return `PEL${umkmCode}${genderCode}${sequenceCode}`;
    } 

    async getAllPelanggan(filters = {}, umkmId) {
        const { 
            page = 1, 
            limit = 10, 
            umkm_id, 
            level, 
            gender, 
            search 
        } = filters;

        const offset = (page - 1) * limit;

        const where = { umkm_id: umkmId };

        if (umkm_id) where.umkm_id = umkm_id;
        if (level) where.level = level;
        if (gender) where.gender = gender;
        if (search) {
            where[Op.or] = [
                { nama: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { telepon: { [Op.like]: `%${search}%` } },
                { alamat: { [Op.like]: `%${search}%` } },
                { gender: { [Op.like]: `%${search}%` } },
                { level: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Pelanggan.findAndCountAll({
            where,
            include: [
                {   model: Umkm, 
                    attributes: ['umkm_id', 'nama_umkm'] 
                }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
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

    async getPelangganById(id) {
        const pelanggan = await Pelanggan.findByPk(id, {
            include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }]
        });

        if (!pelanggan) {
            throw new Error('Pelanggan tidak ditemukan');
        }

        return pelanggan;
    }

    async createPelanggan(data) {
        const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

        if (!nama) throw new Error('Nama pelanggan wajib diisi');

        if (email) {
            const existingEmail = await Pelanggan.findOne({ where: { email } });
            if (existingEmail) throw new Error('Email sudah terdaftar');
        }
        let t;
        try {
            t = await sequelize.transaction();

            const kode_pelanggan = await this.generateKodePelanggan(umkm_id, gender); 
            const pelanggan = await Pelanggan.create({
                nama,
                telepon,
                email,
                gender,
                alamat,
                level,
                umkm_id,
                kode_pelanggan 
            }, { transaction: t });

            await t.commit();
            return this.getPelangganById(pelanggan.pelanggan_id);

        } catch (error) {
            await t.rollback();
            if (error.name === 'SequelizeUniqueConstraintError' && error.fields.kode_pelanggan) {
                throw new Error('Gagal membuat kode pelanggan unik. Coba lagi.');
            }
            throw error;
        }
    }

    async updatePelanggan(id, data) {
        const pelanggan = await Pelanggan.findByPk(id);

        if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');

        const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

        if (email && email !== pelanggan.email) {
            const existingEmail = await Pelanggan.findOne({ where: { email } });
            if (existingEmail) throw new Error('Email sudah terdaftar');
        }

        await pelanggan.update({
            nama: nama || pelanggan.nama,
            telepon: telepon !== undefined ? telepon : pelanggan.telepon,
            email: email !== undefined ? email : pelanggan.email,
            gender: gender || pelanggan.gender,
            level: level !== undefined ? level : pelanggan.level,
            alamat: alamat !== undefined ? alamat : pelanggan.alamat,
            umkm_id: umkm_id || pelanggan.umkm_id,
            updated_at: new Date()
        });

        return this.getPelangganById(id);
    }

    async deletePelanggan(id) {
        const pelanggan = await Pelanggan.findByPk(id);

        if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');

        await pelanggan.destroy();
        return { message: 'Pelanggan berhasil dihapus' };
    }

    async getPelangganByUmkm(umkm_id, filters = {}) {
        const { page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const { count, rows } = await Pelanggan.findAndCountAll({
            where: { umkm_id },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
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

    async getStatistik(umkmId) {
        const today = new Date();
        const { start: startOfMonth, end: endOfMonth } = this.getMonthDateRange(today);

        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

        const umkmWhere = { umkm_id: umkmId };

        const total = await Pelanggan.count({ where: umkmWhere });

        const baruBulanIni = await Pelanggan.count({
            where: {
                ...umkmWhere,
                created_at: { [Op.between]: [startOfMonth, endOfMonth] },
            },
        });

        const baruBulanLalu = await Pelanggan.count({
            where: {
                ...umkmWhere,
                created_at: { [Op.between]: [lastMonthStart, lastMonthEnd] },
            },
        });

        let pertumbuhan = 0;
        if (baruBulanLalu > 0) {
            pertumbuhan = ((baruBulanIni - baruBulanLalu) / baruBulanLalu) * 100;
        } else if (baruBulanIni > 0) {
            pertumbuhan = 100;
        }

        return {
            total,
            baru_bulan_ini: baruBulanIni,
            pertumbuhan: parseFloat(pertumbuhan.toFixed(1)),
        };
    }

    async getPelangganGrowthData(umkmId, period = 'day') { 
        const umkmWhere = { umkm_id: umkmId };
        const startDate = this.getStartDate(period);
        const format = this.getDateFormat(period);
        
        const groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), format);

        try {
            // 1. Query Pelanggan Baru per periode
            const growthData = await Pelanggan.findAll({
                attributes: [
                    [groupBy, 'period'],
                    [sequelize.fn('COUNT', sequelize.col('pelanggan_id')), 'new_customers']
                ],
                where: {
                    ...umkmWhere,
                    created_at: {
                        [Op.gte]: startDate,
                    },
                },
                group: [sequelize.literal('period')],
                order: [[sequelize.literal('period'), 'ASC']],
                raw: true,
            });

            const rawData = growthData.map(item => ({
                period: item.period,
                new_customers: parseInt(item.new_customers)
            }));
            
            // 2. Hitung Kumulatif di awal periode
            let cumulativeCount = await Pelanggan.count({ 
                where: { 
                    ...umkmWhere, 
                    created_at: { [Op.lt]: startDate }
                    // Jika ada kolom status, tambahkan di sini
                }
            });
            
            // 3. Kalkulasi data kumulatif selama periode
            const result = rawData.map(item => {
                cumulativeCount += item.new_customers;
                
                return {
                    period: item.period,
                    new_customers: item.new_customers,
                    cumulative_customers: cumulativeCount 
                };
            });

            return result;

        } catch (error) {
            console.error("Error fetching pelanggan growth data:", error);
            throw new Error('Gagal mengambil data pertumbuhan pelanggan');
        }
    }

}

module.exports = new PelangganService();