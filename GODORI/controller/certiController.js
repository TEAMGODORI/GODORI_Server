const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Like, Sport, Certification, CertiImage, CertiSport } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const certiService = require('../service/certiService');

module.exports = {
    postNewCerti : async (req, res) => {

        try {
            const user_name = req.params.userName;
            //let { ex_time, ex_intensity, ex_evalu, ex_comment, certi_sport } = req.body;
            const image = await certiService.getImageUrl(req.file);
            console.log(req.file);
            //console.log("로그")

            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            // if (!ex_time) {
            //     ex_time = "20분";
            // } else if (!ex_intensity) {
            //     ex_intensity = "중";
            // }

            const user = await User.findOne({
                where : {
                    name: user_name,
                },
                attributes : ['id', 'current_group_id'],
            });
            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }

            // const newCerti = await Certification.create({
            //     ex_time,
            //     ex_intensity,
            //     ex_evalu,
            //     ex_comment,
            //     user_id : user.id,
            //     group_id : user.current_group_id,
            // })

            if (image != null) {
                const addImages = await certiService.addImages(newCerti.id, image);
            }
            const addCountRate = await certiService.countAndRate(user.id, user.current_group_id);

            // const certiSports = certi_sport.split(",");
            // for (sport of certiSports) {

            //     // 스포츠 아이디 find
            //     let sportName = await Sport.findOne({
            //         where : {
            //             name: sport
            //         },
            //         attributes : ['id']
            //     })

            //     //  인증 운동종목 저장
            //     let newCertiSports = await CertiSport.create({
            //         certi_id: newCerti.id,
            //         sport_id: sportName.id
            //     });
            // }

            

            return res.status(code.OK).send(util.success(code.OK, message.NEW_CERTI_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    getCertiDetail : async (req, res) => {

        try {
            const user_name = req.params.userName;
            const certi_id = req.query.certiId;
            console.log(user_name) 
            const user = await User.findOne({
                where : {
                    name : user_name
                },
                attributes : ['id']
            });

            if (!certi_id || !user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const formatCerti = await certiService.formatCerti(user.id, certi_id);

            return res.status(code.OK).send(util.success(code.OK, message.GET_CERTIDETAIL_SUCCESS, formatCerti));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    getCertiByCal : async (req, res) => {

        try {

            const user_name = req.params.userName;

            const date = req.query.date;
            let startDate = date + " 00:00:00";
            startDate = Date.parse(startDate);
            let endDate = date + " 23:59:59";
            endDate = Date.parse(endDate);

            if (!user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (!date) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    name : user_name
                },
                attributes : ['current_group_id']
            });
            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }
            
            let certiList = await Certification.findAll({
                where : {
                    group_id : user.current_group_id,
                    created_at : {
                        [Op.between] : [startDate, endDate]
                    }
                },
                attributes : ['id', 'user_id'],
                raw : true,
            });

           certiList = await certiService.formatCertiList(certiList);
           
           return res.status(code.OK).send(util.success(code.OK, message.GET_CERTILIST_SUCCESS, certiList));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    likeOrCancel : async (req, res) => {

        try {

            const user_name = req.params.userName;
            const certi_id = req.query.certiId;

            if (!certi_id || !user_name) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    name : user_name
                },
                attributes : ['id'] 
            });

            const isLiked = await Like.findAll({
                where : {
                    user_id : user.id,
                    certi_id
                }
            });

            if (isLiked.length > 0) {
                const like = await Like.destroy({
                    where : {
                        user_id : user.id,
                        certi_id
                    }
                });
                return res.status(code.OK).send(util.success(code.OK, message.LIKE_CANCEL_SUCCESS));
            }

            const like = await Like.create({
                user_id : user.id,
                certi_id
            });
            return res.status(code.OK).send(util.success(code.OK, message.LIKE_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}