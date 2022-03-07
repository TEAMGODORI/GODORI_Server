const util = require('../modules/util');
const code = require('../modules/statusCode');
const message = require('../modules/responseMessage');

const { User, Group, Join, UserSport, Sport, Certification } = require('../models');
const {Op} = require('sequelize');
const groupService = require('../service/groupService');
const userService = require('../service/userService');
const certiService = require('../service/certiService');

const sch = require('node-schedule');
const rule = new sch.RecurrenceRule();

// 매주 월요일 오전 12시 마다 Join achive_rate 초기화
// const schedule = sch.scheduleJob('0 0 * * 1', async () => {
//     try {

//         const updateJoin = await Join.update

//     } catch (err) {
//         console.log(err);
//     }
// })

module.exports = {

    // iOS 회원가입
    signup2: async (req, res) => {
        const { email, nickname, password} = req.body;
        
        if (! email || ! password || ! nickname) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }

        try {
            // 이미 존재하는 email, nickname 인지 확인
            const paramsExist = await userService.isEmailNicknameExist(email, nickname);
            if ( paramsExist ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, paramsExist));
            }

            // hashedPassword 생성
            const {salt, hashedPassword} = await userService.hashPassword(password);
            
            
            const image = await userService.getImageUrl(req.file);
             
            const user = await User.create({
                email,
                password : hashedPassword,
                nickname,
                salt,
                profile_img : image,
                continued_visit: 0
            });

            await Answer.create({
                public_flag: 0,
                user_id: user.id,
                question_id: 1,
                answer_idx: 1,
            })
            
            return res.status(code.CREATED).send(util.success(code.CREATED, message.SIGN_UP_SUCCESS, {id : user.id, email : user.email, nickname : user.nickname, profile_img : user.profile_img}));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // iOS 로그인
    signIn2 : async (req, res) => {
        try {

            const {name, nickname, profile_img, kakao_id, user_sport} = req.body;
            const image = await certiService.getImageUrl(req.file);

            if (!name || !nickname || !profile_img || !kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const newUser = await User.create({
                name,
                nickname,
                profile_img,
                kakao_id,
                ex_cycle : 3,
                ex_intensity : "중",
                current_group_id : 0
            });
            const user_id = newUser.id

            const userSports = user_sport.split(",");
            for (sport of userSports) {

                // 스포츠 아이디 find
                let sportName = await Sport.findOne({
                    where : {
                        name: sport
                    },
                    attributes : ['id']
                })

                //  유저 운동종목 저장
                let newUserSports = await UserSport.create({
                    user_id,
                    sport_id: sportName.id
                });
            }

            return res.status(code.OK).send(util.success(code.OK, message.USER_LOGIN_SUCCESS, nickname));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // iOS 목표 운동 횟수 수정
    updateExPrefer2 : async (req, res) => {

        try {

            const kakao_id = req.params.kakaoId;
            const {ex_cycle, ex_intensity, sports} = req.body;
            // null 값 처리
            if (!kakao_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const user = await User.findOne({
                where : {
                    kakao_id : kakao_id
                },
                attributes : ['id']
            });

            const changeExPrefer = await User.update({ex_cycle, ex_intensity}, {
                where : {
                    kakao_id : kakao_id
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