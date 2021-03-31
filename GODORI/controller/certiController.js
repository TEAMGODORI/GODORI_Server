const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const countService = require('../service/countService');
const certiService = require('../service/certiService');

module.exports = {
    postNewCerti : async (req, res) => {

        // req.params 가져올 것 : userName

        // req.body 가져와야 하는 것들 : 
        // ex_time, ex_intensity, ex_evalu, ex_comment

        // req.files 가져와야 하는 것 : image

        // userName 통해서 id, current_group_id를 user_id,group_id에 넣기
        // parse_date는 다음에 불러올 때 ?

        // 인증횟수 +1 (나중에)

        try {
            // sport_id와 group_maker 는 다른 테이블에 저장
            const user_name = req.params.userName;
            const { ex_time, ex_intensity, ex_evalu, ex_comment } = req.body;
            const images = req.files;

            // null 값 처리
            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            if (!ex_time) {
                ex_time = "20분";
            } else if (!ex_intensity) {
                ex_intensity = "중";
            }

            const user = await User.findOne({
                where : {
                    name: user_name,
                },
                attributes : ['id', 'current_group_id'],
            });

            const newCerti = await Certification.create({
                ex_time,
                ex_intensity,
                ex_evalu,
                ex_comment,
                user_id : user.id,
                group_id : user.current_group_id,
            })

            // 나중에 인증횟수 추가 하는거 구현)
            const addCountRate = await certiService.countAndRate();

            res.status(code.OK).send(util.success(code.OK, message.NEW_CERTI_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 
}