const { Group, Join, User, Certification, UserSport, Sport}  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');
const message = require('../modules/responseMessage');

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

    signUpFirstMember : async (group_name, group_maker) => {

        try {

            const findNewGroup = await Group.findOne({
                where : {
                    group_name: group_name,
                },
                attributes : ['id']
            });

            if (!findNewGroup) {
                return message.CANNOT_FIND_GROUP;
            }

            const findGroupMaker = await User.findOne({
                where : {
                    name : group_maker,
                },
                attributes : ['id']
            });

            if (!findGroupMaker) {
                return message.CANNOT_FIND_USER;
            }

            const groupMakerJoin = await Join.create({
                user_id : findGroupMaker.id,
                group_id : findNewGroup.id,
            });

            const updateCurrentGroup = await User.update({current_group_id: findNewGroup.id}, {
                where : {
                    id : findGroupMaker.id
                }
            });
            
            return 1;

        } catch (err) {
            throw err;
        }

    },

    findUserSport : async (user_id) => {

        try {

            // find user sports
            let sports = await UserSport.findAll({
                where : {
                    user_id ,
                },
                attributes : ['sport_id'],
                raw : true
            });
            if (!sports) {
                return message.CANNOT_FIND_SPORT;
            }
            sports = sports.map(s => s.sport_id)

            // find sports name
            let userSport = await Sport.findAll({
                where : {
                    id : {
                        [Op.or] : [sports],
                    }
                },
                attributes : ['name'],
                raw : true
            });
            if (!userSport) {
                return message.CANNOT_FIND_USERSPORT;
            }
            userSport = userSport.map(u => u.name)

            return userSport;

        } catch (err) {
            throw err;
        }
    },

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
                attributes : ['id', 'group_sport', 'group_name', 'intro_comment',
                'ex_cycle', 'ex_intensity', 'created_at', 'recruit_num'],
                raw : true,
            });

            if (!groupList) {
                return message.NO_SUCH_GROUP;
            }
    
            const result = []
            for (group of groupList) {
                result.push(await formatGroup(group))
            };
            return result;

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
                attributes : ['id', 'group_sport', 'group_name', 'intro_comment',
                'ex_cycle', 'ex_intensity', 'created_at', 'recruit_num'],
                raw : true,
            });
            if (!group) {
                return message.CANNOT_FIND_GROUP;
            }

            let parsedDate = group.created_at.toISOString()
            parsedDate = parsedDate.substr(0,10).split('-').join('.') + "~";
            group.created_at = parsedDate;

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
    },

    getGroupMember : async (group_id) => {

        try {

            // members
            const members = await User.findAll({
                where : {
                    current_group_id : group_id
                },
                attributes : ['id', 'name', 'profile_img'],
                raw : true,
            });
            if (!members) {
                return message.NO_MEMBER;
            }

            for (member of members) {
                if (!member.profile_img) {
                    member.profile_img = "";
                }
            }

            return members;

        } catch (err) {
            throw err;
        }
    },

    joinGroup : async (user_id, group_id) => {
        try {
            const join = await Join.create({
                user_id,
                group_id,
                achive_rate : 0,
                week_count : 0
            });

            const updateCurrentGroup = await User.update({current_group_id: group_id}, {
                where : {
                    id : user_id
                }
            });

            return 1;

        } catch (err) {
            throw err;
        }
    },

    getMemberCount : async (group_id) => {

        try {

            // members
            const members = await User.findAll({
                where : {
                    current_group_id : group_id
                },
                attributes : ['id', 'name', 'profile_img']
            }); 

            let todayJoiners = [];
            let notTodayJoiners = [];
            const today = new Date().setHours(0,0,0,0);
            const now = new Date();
            for (member of members) {
                
                // members & week count
                let joiner = await Join.findOne({
                    where : {
                        user_id : member.id,
                        group_id
                    },
                    attributes : ['week_count'],
                    raw : true
                });

                joiner.user_id = member.id;
                joiner.user_name = member.name;
                if (member.profile_img) {
                    joiner.user_img = member.profile_img;
                } else {
                    joiner.user_img = "";
                }

                // 오늘 인증했는지 안했는지
                let certi = await Certification.findAll({
                    where : {
                        user_id : member.id,
                        group_id,
                        created_at : {
                            [Op.gte] : today,
                            [Op.lte] : now
                        }
                    },
                    raw : true
                });

                if (certi[0]) {
                    todayJoiners.push(joiner);
                } else {
                    notTodayJoiners.push(joiner);
                }
            }

            return [todayJoiners, notTodayJoiners];

        } catch (err) {
            throw err;
        }
    },

    getWeekLeftCount : async (user) => {
        
        try {

            let current = await Join.findOne({
                where : {
                    user_id : user.id,
                    group_id : user.current_group_id
                },
                attributes : ['week_count']
            });
            current = current.week_count;

            let all = await Group.findByPk(user.current_group_id, {
                attributes : ['ex_cycle']
            })
            all = all.ex_cycle

            let leftCount = 0
            if (all > current) {
                leftCount = all - current;
            }

            return leftCount
        } catch (err) {
            throw err;
        }

    },

}