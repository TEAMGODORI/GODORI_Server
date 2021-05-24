const { UserSport, Sport, Certification, CertiImage}  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

module.exports = {

    formatCertiImage : async (user_id) => {

        try {

            let certi_list = await Certification.findAll({
                where : {
                    user_id
                },
                attributes : ['id', 'created_at'],
                order : [['created_at', 'DESC']],
                raw : true,
            });

            if (!certi_list) {
                return 0;
            }

            for (certi of certi_list) {
   
                let certiImage = await CertiImage.findOne({
                    where : {
                        certi_id : certi.id
                    }, 
                    attributes : ['image']
                });

                if (certiImage) {
                    certi.image = certiImage.image;
                } else {
                    certi.image = "";
                }

            }

            return certi_list;

        } catch (err) {
            throw err;
        }

    },

}