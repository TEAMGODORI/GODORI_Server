const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const groupService = require('../service/groupService');

module.exports = {

    // 그룹 생성하기
    postNewGroup : async (req, res) => { 

        try {
            const { group_name, recruit_num, is_public, intro_comment,
            ex_cycle, ex_intensity, group_sport, kakao_id } = req.body; 

            if (!group_name || !recruit_num || !kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            } else if (is_public === null) {
                is_public = false;
            } else if (!ex_cycle) {
                ex_cycle = 3;
            } else if (!ex_intensity) {
                ex_intensity = "중";
            }

            // find User
            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id,
                },
                attributes : ['id', 'nickname'],
                raw : true
            });

            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_GROUP));
            }

            const group_image = await groupService.putGroupImage(group_sport);

            const newGroup = await Group.create({
                group_name, 
                recruit_num,
                is_public,
                intro_comment,
                ex_cycle,
                ex_intensity,
                group_sport,
                group_image,
                group_maker : user.nickname
            });

            const signupFirstMem = await groupService.signUpFirstMember(group_name, user);

            if (signupFirstMem == message.CANNOT_FIND_GROUP) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_GROUP));
            } else if (signupFirstMem == message.CANNOT_FIND_USER) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_USER));
            }

            return res.status(code.OK).send(util.success(code.OK, message.CREATE_GROUP_SUCCESS, group_image));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    // 그룹 목록 불러오기
    getGroupList : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            // find User
            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id,
                },
                attributes : ['id', ['nickname', 'name'], 'ex_cycle', 'ex_intensity'],
                raw : true
            });

            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_GROUP));
            }

            const userSport = await groupService.findUserSport(user.id);
            if (userSport == message.CANNOT_FIND_SPORT) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_SPORT));
            } else if (userSport == message.CANNOT_FIND_USERSPORT) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_USERSPORT));
            }

            const groupList = await groupService.formatGroupList(user, userSport);
            if (groupList == message.NO_SUCH_GROUP) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_SUCH_GROUP));
            }

            const userSportString = userSport.join();
            user.sports = userSportString;

            return res.status(code.OK).send(util.success(code.OK, message.GET_GROUPLIST_SUCCESS, {user, group_list: groupList}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 이런그룹어때요 그룹 목록 불러오기
    getAnyGroupList : async (req, res) => {

        try {

            const groupList = await Group.findAll({
                limit : 6,
                attributes : ['id', 'group_sport', 'group_name', 'group_image', 'intro_comment',
                'ex_cycle', 'ex_intensity', 'created_at', 'recruit_num'],
                order : [['created_at', 'DESC']],
                raw : true,
            });

            return res.status(code.OK).send(util.success(code.OK, message.GET_GROUPLIST_SUCCESS, groupList));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 상세보기 (가입 전)
    getGroupDetail : async (req, res) => {

        try {

            const group_id = req.params.groupId;
            if (!group_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const groupDetail = await groupService.formatGroupDetail(group_id);
            if (groupDetail == message.CANNOT_FIND_GROUP) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_GROUP));
            }

            return res.status(code.OK).send(util.success(code.OK, message.GET_GROUPDETAIL_SUCCESS, groupDetail));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 상세보기 (가입 후)
    getGroupDetailAfterSignUp : async (req, res) => {

        try { 

            const group_id = req.params.groupId;

            // null 값 처리 
            if (!group_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const group_detail = await groupService.formatGroupDetail(group_id);
            if (group_detail == message.CANNOT_FIND_GROUP) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.CANNOT_FIND_GROUP));
            }
            const group_member = await groupService.getGroupMember(group_id);
            if (group_member == message.NO_MEMBER) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_MEMBER));
            }

            return res.status(code.OK).send(util.success(code.OK, message.GET_GROUPDETAIL_SUCCESS, {group_detail, group_member}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 가입하기
    groupJoin : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            const group_id = parseInt(req.query.groupId);

            if (!group_id || !kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            let user_id = await User.findOne({
                where :{
                    kakao_id : kakao_id
                },
                attributes : ['id']
            });
            if (!user_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            user_id = user_id.id;

            const join = await groupService.joinGroup(user_id, group_id);

            return res.status(code.OK).send(util.success(code.OK, message.GROUP_JOIN_SUCCESS));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 가입 후 그룹 메인탭
    afterSignUpInfo : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            // user
            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
                },
                attributes : ['id', 'current_group_id']
            });
            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            const group_id = user.current_group_id;
            if (group_id == 0) {
                return res.status(code.OK).send(util.success(code.OK, message.NO_SIGNEDUP_GROUP, {group_id}));
            }
            
            // // 2주 활동 없을 시 탈퇴
            // const inactivityMember = await dateService.isInactivity(user.id, group_id);
            // if (inactivityMember) {

            //     // 현 그룹 0으로 초기화
            //     const kickMember = await User.update({current_group_id : 0}, {
            //         where : {
            //             id : user.id
            //         },
            //     });

            //     // join delete
            //     const deleteJoin = await Join.destroy({
            //         where : {
            //             user_id : user.id,
            //             group_id
            //         }
            //     });

            //     // 남은 멤버 없을 시 그룹 삭제
            //     const deleteGroup = await groupService.deleteEmptyGroup(group_id);

            //     return res.status(code.OK).send(util.success(code.OK, message.KICKOUT_SUCCESS));
            // }


            // group
            const group = await Group.findOne({
                where : {
                    id : group_id
                },
                attributes : ['group_name', 'ex_cycle']
            });
            const group_name = group.group_name;
            const left_count = await groupService.getWeekLeftCount(user);
            const group_cycle = group.ex_cycle;

            // member
            const member_list = await groupService.getMemberCount(group_id);
            const today_member = member_list[0];
            const not_today_member = member_list[1];
           
           return res.status(code.OK).send(util.success(code.OK, message.GET_AFTER_SIGNUP_INFO,
            {group_id, group_name, left_count, group_cycle, today_member, not_today_member}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 검색하기
    groupSearch : async (req, res) => {
        
        try {

            // const search = req.query.search;
            // if (!search) {
            //     return res.status(code.OK).send(util.success(code.OK, message.NO_SEARCH_RESULT));
            // }
        
            const searchResult = await Group.findAll({
                // where : {
                //     group_name : {
                //         [Op.like] : "%" + search + "%"
                //     }
                // },
                attributes : ['id', 'group_name'],
                raw : true
            });

            return res.status(code.OK).send(util.success(code.OK, message.GROUP_SEARCH_SUCCESS, searchResult));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 그룹 탈퇴하기
    leaveGroup : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
                },
                attributes : ['id', 'current_group_id']
            });
            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            
            // 현 그룹 0으로 초기화
            const updateCurrentGroup = await User.update({current_group_id : 0}, {
                where : {
                    id : user.id
                },
            });

            // join delete
            const deleteJoin = await Join.destroy({
                where : {
                    user_id : user.id,
                    group_id : user.current_group_id
                }
            });

            // 남은 멤버 없을 시 그룹 삭제
            const deleteGroup = await groupService.deleteEmptyGroup(user.current_group_id);

            return res.status(code.OK).send(util.success(code.OK, message.LEAVE_GROUP_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}