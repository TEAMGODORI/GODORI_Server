const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { Answer, User, Comment, Question, Scrap, Category, Group, GroupSport } = require('../models');
const { homeService, userService } = require('../service');

module.exports = {
    postNewGroup: async (req, res) => {

        try {
            // sport_id와 group_maker 는 다른 테이블에 저장
            const { group_name, recruit_num, is_public, intro_comment,
            ex_cycle, ex_intensity, sport_id, date : parse_date, group_maker } = req.body;

            if (! group_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_GROUP_NAME));
            }

            const parse_date = dateService.formatAnswerDate(date);

            // 그룹 생성
            const newGroup = await Group.create({
                group_name: group_name, // 그룹 이름
                recruit_num: recruit_num, // 그룹 인원
                is_public: is_public, // 그룹 공개 여부
                intro_comment: intro_comment, // 그룹 소개 코멘트
                ex_cycle: ex_cycle, // 그룹 인증 주기
                ex_intensity: ex_intensity, // 그룹 인증 강도
                parse_date: parse_date, // 파싱 날짜
                group_maker: group_maker, // 그룹 만든 사람
            });

            // 그룹 운동종목 취향
            const newGroupSports = await GroupSport.create({
                
            });

            // 방금 생성한 그룹 아이디 추출
            const newGroupId = await Group.findOne({
                where : {
                    group_name: group_name,
                },
                attributes : ['id']
            });

            // 그룹 생성한 사람 join
            const groupMakerJoin = await Join.create({
                user_id : group_maker,
                group_id : newGroupId.id,
            });

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
}