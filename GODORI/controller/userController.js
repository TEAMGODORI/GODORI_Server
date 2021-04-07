const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const userService = require('../service/userService');

module.exports = {
    updateExPrefer : async (req, res) => {

        try {

            const user_name = req.params.userName;
            const {ex_cycle, ex_intensity, sports} = req.body;
            // null 값 처리
            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    name : user_name
                },
                attributes : ['id']
            });

            const changeExPrefer = await User.update({ex_cycle, ex_intensity}, {
                where : {
                    name : user_name
                },
            });

            const destroyUserSports = await UserSport.destroy({
                where : {
                    user_id : user.id
                }
            });

            console.log(ex_intensity);
            const userSport = await userService.setUserSports(user.id, sports);

            return res.status(code.OK).send(util.success(code.OK, message.CHANGE_EXPREFER_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}