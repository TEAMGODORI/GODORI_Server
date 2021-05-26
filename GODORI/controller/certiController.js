const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Like, Sport, Certification, CertiImage, CertiSport } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
const certiService = require('../service/certiService');

module.exports = {

    postCertiImage : async (req, res) => {

        try {
            const certi_id = req.params.certiId;
            const image = await certiService.getImageUrl(req.file);
            console.log(image)

            if (image != null) {
                const addImages = await certiService.addImages(certi_id, image);
            } else if (image == null) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            return res.status(code.OK).send(util.success(code.OK, message.POST_CERTI_IMAGE_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    postCertiBody : async (req, res) => {

        try {
            const kakao_id = req.params.kakaoId;
            let { ex_time, ex_intensity, ex_evalu, ex_comment, certi_sport } = req.body;
            console.log(req.body)
            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (!ex_time) {
                ex_time = "20분";
            } else if (!ex_intensity) {
                ex_intensity = "중";
            }

            const user = await User.findOne({
                where : {
                    kakao_id: kakao_id,
                },
                attributes : ['id', 'current_group_id'],
            });
            if (!user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }

            const newCerti = await Certification.create({
                ex_time : ex_time,
                ex_intensity : ex_intensity,
                ex_evalu : ex_evalu,
                ex_comment : ex_comment,
                user_id : user.id,
                group_id : user.current_group_id,
            })
            const id = newCerti.id

            const addCountRate = await certiService.countAndRate(user.id, user.current_group_id);

            console.log(certi_sport);
            const certiSports = certi_sport.split(",");
            for (sport of certiSports) {

                // 스포츠 아이디 find
                let sportName = await Sport.findOne({
                    where : {
                        name: sport
                    },
                    attributes : ['id'],
                    raw: true,
                })
                console.log(sportName);
                //  인증 운동종목 저장
                let newCertiSports = await CertiSport.create({
                    certi_id: newCerti.id,
                    sport_id: sportName.id
                });
            }

            return res.status(code.OK).send(util.success(code.OK, message.POST_CERTI_BODY_SUCCESS, id));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    getCertiDetail : async (req, res) => {

        try {
            const kakao_id = req.params.kakaoId;
            const certi_id = req.query.certiId;
            console.log(kakao_id) 
            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
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

            const kakao_id = req.params.kakaoId;

            const date = req.query.date;
            let startDate = date + " 00:00:00";
            startDate = Date.parse(startDate);
            let endDate = date + " 23:59:59";
            endDate = Date.parse(endDate);

            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (!date) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
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
                order : [['created_at', 'DESC']],
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

            const kakao_id = req.params.kakaoId;
            const certi_id = req.query.certiId;

            if (!certi_id || !kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
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