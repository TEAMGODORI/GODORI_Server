const { Group, GroupSport }  = require('../models/');

 // Date 객체 가공 
 const formatAnswerDate = async (date) => {
    
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

}



module.exports = {
    formatAnswerDate,
}