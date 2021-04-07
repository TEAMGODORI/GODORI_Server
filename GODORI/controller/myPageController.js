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

            const user_name = req.params.userName;
            // null 값 처리
            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    name : user_name
                },
                attributes : ['id', 'current_group_id']
            });

            const join = await Join.findOne({
                where : {
                    user_id : user.id,
                    group_id : user.current_group_id
                },
                attributes : ['achive_rate', 'week_count'],
                raw : true
            });

            const certi_list = await myPageService.formatCertiImage(user.id);

            return res.status(code.OK).send(util.success(code.OK, message.GET_MYPAGE_INFO_SUCCESS, {join, certi_list}));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}