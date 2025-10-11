const { Op } = require("sequelize");
const { Analiz, Mijoz, Admin } = require('../../models/index.js');
class HelpControl {
    dateTime () {
        const todayData = new Date();
        const today = todayData.toISOString().split('T')[0];
        const times = todayData.toLocaleTimeString("uz-UZ", { timeZone: "Asia/Tashkent", hour12: false });
        const [clock, minut, secound] = times.split(':')
        const [yyyy, mm, dd] = today.split('-')
        const time = `${clock}:${minut}`
        return {today, yyyy, mm, dd, time}
    }
    async createOrupdate (employeeNo) {
        const { today, time } = this.dateTime();
        const result = await Mijoz.findOne({
            where: {id: Number(employeeNo)},
            include: [
                {
                    model: Admin
                }
            ]
        })
        if (result) {
            const mijoz = result.toJSON()
            const results2 = await Analiz.findOne({
                order: [['id', 'DESC']],
                where: { mijozId: Number(mijoz.id) }
            });
            if (results2) {
                if (results2.kirish && results2.chiqish) {
                    result.date = String(today);
                    await result.save()
                    return await this.create2(mijoz)
                }
                if (results2.kirish) {
                    return await this.update2(mijoz)
                }
            } else {
                result.date = String(today);
                await result.save()
                return await this.create2(mijoz)
            }
        }
        return;
    }
    async create2 (mijoz) {
        const { today, time } = this.dateTime();
        const [realsoat, realminut] = time.split(":").map(Number);
        let realtime = realsoat * 3600 + realminut * 60;
        await Analiz.create({
            adminId: mijoz.Admin.id,
            mijozId: mijoz.id,
            ism: mijoz.ism,
            fam: mijoz.fam,
            shar: mijoz.shar,
            kirish: realtime,
            sana: today
        })
        return;
    }

    async update2 (mijoz) {
        const { today, time } = this.dateTime();
        const [realsoat, realminut] = time.split(":").map(Number);
        let realtime = realsoat * 3600 + realminut * 60;
        const results2 = await Analiz.findOne({
            order: [['id', 'DESC']],
            where: { mijozId: Number(mijoz.id) }
        });
        if (results2) {
            results2.chiqish = realtime;
            await results2.save();
        }
        return;
    }

    async create (employeeNo) {
        const result = await Mijoz.findOne({
            where: {id: Number(employeeNo)},
            include: [
                {
                    model: Admin
                }
            ]
        })        
        const { today, time } = this.dateTime();
        if (result) {
            result.date = String(today);
            await result.save()
            const mijoz = result.toJSON()
            const [realsoat, realminut] = time.split(":").map(Number);
            let realtime = realsoat * 3600 + realminut * 60;
            await Analiz.create({
                adminId: mijoz.Admin.id,
                mijozId: mijoz.id,
                ism: mijoz.ism,
                fam: mijoz.fam,
                shar: mijoz.shar,
                kirish: realtime,
                sana: today
            })
        }
        return;
    }

    async update (employeeNo) {
        const result = await Mijoz.findOne({
            where: {id: Number(employeeNo)},
            include: [
                {
                    model: Admin
                }
            ]
        })
        if (result) {
            const mijoz = result.toJSON()
            const { today, time } = this.dateTime();
            const [realsoat, realminut] = time.split(":").map(Number);
            let realtime = realsoat * 3600 + realminut * 60;
            const results2 = await Analiz.findOne({
                order: [['id', 'DESC']],
                where: { mijozId: Number(mijoz.id) }
            });
            if (results2) {
                results2.chiqish = realtime;
                await results2.save();
            }
        }
        return;
    }

    option (query, token) {
        let where = {};
        if (token) {
            where.adminId = Number(token.id)
        }
        if (query.search2) {
            where[Op.or] = [
                { ism: { [Op.like]: `%${query.search2}%` } },
                { fam: { [Op.like]: `%${query.search2}%` } },
                { shar: { [Op.like]: `%${query.search2}%` } },
            ];
        }
        if (query.date) {
            if (query.date2) {
                where.sana = { [Op.between]: [query.date, query.date2] };
            } else {
                where.sana = query.date;
            }
        }
        return { where };
    }
}
module.exports = HelpControl;