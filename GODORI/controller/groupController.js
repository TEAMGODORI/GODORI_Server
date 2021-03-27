const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join } = require('../models');
const dateService = require('../service/dateService');

module.exports = {
    postNewGroup: async (req, res) => {

        try {
            // sport_id와 group_maker 는 다른 테이블에 저장
            const { group_name, recruit_num, is_public, intro_comment,
            ex_cycle, ex_intensity, sport, group_maker } = req.body;

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
                group_sport: sport // 그룹 운동 종목
            });

            // 방금 생성한 그룹 아이디 추출
            const findNewGroup = await Group.findOne({
                where : {
                    group_name: group_name,
                },
                attributes : ['id']
            });

            const groupMakerId = await User.findOne({
                where : {
                    name : group_maker,
                },
                attributes : ['id']
            })

            // 그룹 생성한 사람 그룹에 가입
            const groupMakerJoin = await Join.create({
                user_id : groupMakerId.id,
                group_id : findNewGroup.id,
            });

            res.status(code.OK).send(util.success(code.OK, message.CREATE_GROUP_SUCCESS, newGroup));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    getGroupList: async (req, res) => {


    }
}