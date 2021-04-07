const { UserSport, Sport }  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

module.exports = {

    setUserSports : async (user_id, sports) => {

        try {

            console.log(sports);
            const userSports = sports.split(",");
            for (sport of userSports) {

                // 스포츠 아이디 find
                let sportName = await Sport.findOne({
                    where : {
                        name: sport
                    },
                    attributes : ['id']
                })

                // 유저 취향 저장
                let newCertiSports = await UserSport.create({
                    user_id, 
                    sport_id : sportName.id
                });
            }

            return 1;

        } catch (err) {
            throw err;
        }

    },

}