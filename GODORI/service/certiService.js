const { Group, Certification, Join, User  }  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

module.exports = {

    countAndRate : async () => {

        try {
            let groupList = await Group.findAll({
                where : {
                    is_public : true,
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