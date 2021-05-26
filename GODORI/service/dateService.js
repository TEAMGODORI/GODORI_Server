const { Group, Join }  = require('../models/');
const moment = require('moment');

const getTodayDate = async () => {
    const td = Date.now();
    const today = new Date(td);
    return new Date(moment.tz(today, 'Asia/Seoul').format());
};

module.exports = {

    formatDate : async (date) => {
    
        try {
            const today = await getTodayDate();
            let td = today;
            if (! date) {
                return null
            }
        
            const diff = td.getTime()- date.getTime();
            const minDiff = diff / 60000;
            
            if (minDiff < 60) {
                return parseInt(minDiff) + '분 전';
            }
            const hrDiff = diff / 3600000;
            if (hrDiff < 24) {
                return parseInt(hrDiff) + '시간 전';
            }
            const dayDiff = hrDiff / 24;
            if (dayDiff < 365) {
                return (moment.tz(date, 'Asia/Seoul').format('M월 D일'));
            }
            return (moment.tz(date, 'Asia/Seoul').format('YYYY년 M월 D일'));
    
        } catch (err) {
            console.error(err);
            throw err;
        }
    
    },

    isInactivity : async (user_id, group_id) => {

        try {

            const join = await Join.findOne({
                where : {
                    user_id,
                    group_id
                },
                attributes : ['created_at'],
                raw: true,
            });
            const joinDate = join.created_at;

            const today = await getTodayDate();
            let td = today;

            const diff = td.getTime()- joinDate.getTime();
            const hrDiff = diff / 3600000;
            const dayDiff = hrDiff / 24;
            
            if (dayDiff >= 14) {
                return 1;
            } else {
                return 0;
            }


        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}