const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const myPageService = require('../service/myPageService');

module.exports = {
    getMyPageInfo : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            // null 값 처리
            if (!kakao_id) {
                console.log(message.NULL_VALUE);
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
                },
                attributes : ['id', 'nickname', 'current_group_id', 'profile_img']
            });

            const profile = {
                name : user.nickname,
                image : user.profile_img
            }

            let join = {
                achive_rate : 0,
                week_count : 0
            }

            if (user.current_group_id != 0) {
                join = await Join.findOne({
                    where : {
                        user_id : user.id,
                        group_id : user.current_group_id
                    },
                    attributes : ['achive_rate', 'week_count'],
                    raw : true
                });

            }
        
            let certi_list = await myPageService.formatCertiImage(user.id);

            if (certi_list == 0) {
                console.log(message.NO_CERTI_YET);
                certi_list = []
                //return res.status(code.OK).send(util.success(code.OK, message.NO_CERTI_YET));
            }

            return res.status(code.OK).send(util.success(code.OK, message.GET_MYPAGE_INFO_SUCCESS, {profile, join, certi_list}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}