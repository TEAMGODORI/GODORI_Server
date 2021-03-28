const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const groupService = require('../service/groupService');

module.exports = {
    postNewGroup: async (req, res) => {

        try {
            // sport_id와 group_maker 는 다른 테이블에 저장
            const { group_name, recruit_num, is_public, intro_comment,
            ex_cycle, ex_intensity, group_sport, group_maker } = req.body;

            // null 값 처리
            if (!group_name || !recruit_num || !group_maker) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            } else if (is_public === null) {
                is_public = false;
            } else if (!ex_cycle) {
                ex_cycle = 3;
            } else if (!ex_intensity) {
                ex_intensity = "중";
            }

            // 그룹 생성
            const newGroup = await Group.create({
                group_name: group_name, // 그룹 이름
                recruit_num: recruit_num, // 그룹 인원
                is_public: is_public, // 그룹 공개 여부
                intro_comment: intro_comment, // 그룹 소개 코멘트
                ex_cycle: ex_cycle, // 그룹 인증 주기
                ex_intensity: ex_intensity, // 그룹 인증 강도
                group_sport: group_sport // 그룹 운동 종목
            });

            // 방금 생성한 그룹 아이디 추출
            const findNewGroup = await Group.findOne({
                where : {
                    group_name: group_name,
                },
                attributes : ['id']
            });

            const findGroupMaker = await User.findOne({
                where : {
                    name : group_maker,
                },
                attributes : ['id']
            })

            // 그룹 생성한 사람 그룹에 가입
            const groupMakerJoin = await Join.create({
                user_id : findGroupMaker.id,
                group_id : findNewGroup.id,
            });

            res.status(code.OK).send(util.success(code.OK, message.CREATE_GROUP_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    getGroupList: async (req, res) => {

        // 쿼리로 name 가져오기 O
        // name 에 해당하는 유저 찾고, 주기, 강도 가져오기 O
        // 유저id 통해서 UserSport 가져오기 (콤마 포함 스트링으로) O
        // 콤마 포함 스트링을 [OP.or] 활용해서 그룹 findAll 조건에 포함 O
        // find All Atrributes [id, group_sport, group_name, 
        // ex_cycle, ex_intensity, recruit_num]
        // 가공해서 데이터로 추가적으로 넘겨줘야 하는 것 :
        // 모집된 인원 (Join에서 group_id 에 해당하는 count, parsing_date )

        try {

            const user_name = req.params.userName;

            // null 값 처리
            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            // find User
            const user = await User.findOne({
                where : {
                    name : user_name,
                },
                attributes : ['id', 'name', 'ex_cycle', 'ex_intensity'],
                raw : true
            });
            console.log(user)

            // find user sports
            let sports = await UserSport.findAll({
                where : {
                    user_id : user.id,
                },
                attributes : ['sport_id'],
                raw : true
            });
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
            userSport = userSport.map(u => u.name)

            const groupList = await groupService.formatGroupList(user, userSport);


            res.status(code.OK).send(util.success(code.OK, message.GET_GROUPLIST_SUCCESS, groupList));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}