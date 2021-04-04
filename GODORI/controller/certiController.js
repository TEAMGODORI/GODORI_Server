const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification, CertiImage, CertiSport } = require('../models');
const {Op} = require('sequelize');
const dateService = require('../service/dateService');
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
            let { ex_time, ex_intensity, ex_evalu, ex_comment, certi_sport } = req.body;
            const imageArray = await certiService.getImageUrl(req.files);

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

            const certiSports = certi_sport.split(",");
            for (sport of certiSports) {

                // 스포츠 아이디 find
                let sportName = await Sport.findOne({
                    where : {
                        name: sport
                    },
                    attributes : ['id']
                })

                // 그룹 운동종목 취향 저장
                let newCertiSports = await CertiSport.create({
                    certi_id: newCerti.id,
                    sport_id: sportName.id
                });
            }

            const addImages = await certiService.addImages(newCerti.id, imageArray);
            const addCountRate = await certiService.countAndRate(user.id, user.current_group_id);

            res.status(code.OK).send(util.success(code.OK, message.NEW_CERTI_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 

    getCertiDetail : async (req, res) => {

        // certi ID 를 받아옴
        // ex_time, ex_intensity, ex_evalu, ex_comment
        

        try {
            const certi_id = req.params.certiId;

            // null 값 처리
            if (!certi_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const certi = await Certification.findOne({
                where : {
                    id : certi_id
                },
                attributes : ['ex_time', 'ex_intensity', 'ex_evalu', 'ex_comment', 'user_id'],
                raw : true,
            })

            const formatCerti = await certiService.formatCerti(certi_id, certi);

            res.status(code.OK).send(util.success(code.OK, message.GET_CERTIDETAIL_SUCCESS, formatCerti));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    getCertiByCal : async (req, res) => {

        try {

            const date = req.query.date;
            let startDate = date + " 00:00:00";
            startDate = Date.parse(startDate);
            let endDate = date + " 23:59:59";
            endDate = Date.parse(endDate);
            
            let certiList = await Certification.findAll({
                where : {
                    created_at : {
                        [Op.between] : [startDate, endDate]
                    }
                },
                attributes : ['id', 'user_id'],
                raw : true,
            });

           certiList = await certiService.formatCertiList(certiList);
           
           res.status(code.OK).send(util.success(code.OK, message.GET_CERTILIST_SUCCESS, certiList));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }
}