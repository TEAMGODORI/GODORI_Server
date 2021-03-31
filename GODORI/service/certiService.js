const { Group, Certification, CertiImage, Join, User  }  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

module.exports = {

    getImageUrl: async (files) => {
        try {
            if (files) {

                let imageArray = [];
                let image = "";
                for (file of files) {
                    image = file.location
                    imageArray.push(image);
                }
                return imageArray;
            }
            return null;
        } catch (err) {
            console.error(err);
        }
    },

    addImages: async (certi_id, imageArray) => {

        let file = ""
        for (image of imageArray) {
            file = await CertiImage.create({
                certi_id,
                image
            })
        }

        return 1;

    },

    countAndRate : async (user_id, group_id) => {

        try {

            // 달성률 계산 및 횟수 증가
            const countrate = await Join.findOne({
                where : {
                    user_id,
                    group_id
                },
                attributes : ['achive_rate', 'week_count']
            });
            const count = countrate.week_count + 1;
            console.log(count)
            
            const cycle = await Group.findOne({
                where : {
                    id : group_id,
                },
                attributes : ['ex_cycle']
            });
            const achive_rate = parseInt((count/cycle.ex_cycle)*100);
            console.log(achive_rate)

            //const update = {week_count:count, achive_rate}
            const updateCountrate = Join.update({week_count:count, achive_rate:achive_rate}, {
                where : {
                    user_id,
                    group_id
                }
            })

            return 1;

        } catch (err) {
            throw err;
        }

    },


}