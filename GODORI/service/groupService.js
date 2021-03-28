const { Group, Join  }  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

const formatGroup = async (group) => {

    const recruitedNum = await Join.count({
        where : {
            group_id : group.id
        }
    });
    const parseDate = await dateService.formatDate(group.created_at)

    group.recruited_num = recruitedNum;
    group.parse_date = parseDate;

    console.log(group);
    return group

}

module.exports = {

    // async 함수인데 자꾸 노란색으로 뜸 원래 파란색으로 떠야함 
    formatGroupList : async (user, userSport) => {

        try {
            let groupList = await Group.findAll({
                where : {
                    ex_cycle : user.ex_cycle,
                    ex_intensity : user.ex_intensity,
                    group_sport : {
                        [Op.or] : [userSport]
                    }
                },
                attributes : ['id', 'group_sport', 'group_name',
                'ex_cycle', 'ex_intensity', 'created_at', 'recruit_num'],
                raw : true,
            });
    
            const result = []
            for (group of groupList) {
                result.push(await formatGroup(group))
            };
            return result

        } catch (err) {
            throw err;
        }

    },


}