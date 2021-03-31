const { Group, Join, User  }  = require('../models/');
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

    formatGroupList : async (user, userSport) => {

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

    formatGroupDetail : async (group_id) => {

        try {
            
            // find Group
            let group = await Group.findOne({
                where : {
                    id : group_id,
                    is_public : true,
                },
                attributes : ['id', 'group_sport', 'group_name',
                'ex_cycle', 'ex_intensity', 'created_at', 'recruit_num'],
                raw : true,
            });

            // 모집된 인원
            const recruitedNum = await Join.count({
                where : {
                    group_id : group.id
                }
            });

            // 그룹멤버들
            let groupMember = await Join.findAll({
                where : {
                    group_id : group_id,
                },
                // 유저 아이디 오름차순으로 정렬한 뒤 리밋 1
                attributes : ['created_at', 'user_id', 'achive_rate'],
                order : ['created_at'],
                raw : true,
            });
            const groupMemberId = groupMember.map(m => m.user_id);

            // 그룹 만든 사람
            let groupMaker = groupMemberId[0];
            groupMaker = await User.findByPk(groupMaker);
        
            // 이번주 평균 달성률
            let sum = 0
            for (member of groupMember) {
                sum = sum + member.achive_rate;
            }
            const achiveRate = parseInt(sum / groupMember.length);

            group.recruited_num = recruitedNum;
            group.group_maker = groupMaker.name;
            group.achive_rate = achiveRate;
            

            return group;

        } catch (err) {
            throw err;
        }
    }


}