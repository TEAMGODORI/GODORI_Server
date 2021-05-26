const { Group, Certification, CertiImage, Join, User, CertiSport, Sport, Like  }  = require('../models/');
const dateService = require('./dateService');
const {Op} = require('sequelize');

module.exports = {

    getImageUrl: async (files) => {
        try {
            // 원래 여러개인데 임시적으로 하나 받아오도록 바꿈 (이름 통일안됨)
            // if (files) {

            //     let imageArray = [];
            //     let image = "";
            //     for (file of files) {
            //         image = file.location
            //         imageArray.push(image);
            //     }
            //     return imageArray;
            // }
            if (files) {
                const image = files.location;
                return image;
            }
            return null;
        } catch (err) {
            console.error(err);
        }
    },

    // addImages: async (certi_id, imageArray) => {

    //     let file = ""
    //     console.log(imageArray);
    //     for (image of imageArray) {
    //         file = await CertiImage.create({
    //             certi_id,
    //             image
    //         })
    //     }

    //     return 1;

    // },

        addImages: async (certi_id, image) => {

        // let file = ""
        // console.log(image);
        // for (image of imageArray) {
        //     file = await CertiImage.create({
        //         certi_id,
        //         image
        //     })
        // }
        console.log(image)
        let file = await CertiImage.create({
            certi_id,
            image
        })
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
            
            const cycle = await Group.findOne({
                where : {
                    id : group_id,
                },
                attributes : ['ex_cycle']
            });

            let achive_rate = 0;
            if (countrate.achive_rate >= 100) {
                achive_rate = 100;
            } else {
                achive_rate = parseInt((count/cycle.ex_cycle)*100);
            }

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

    formatCerti : async (user_id, certi_id) => {
        try {

            const certi = await Certification.findOne({
                where : {
                    id : certi_id
                },
                attributes : ['ex_time', 'ex_intensity', 'ex_evalu', 'ex_comment', 'user_id'],
                raw : true,
            });

            console.log(certi.user_id)
            // 인증 게시물 올린 유저의 이름, 프로필 이미지
            const certiUser = await User.findOne({
                where : {
                    id : certi.user_id
                },
                attributes : ['id', ['nickname','name'], 'profile_img'],
                raw : true
            });
            

            // 인증 게시물에 포함된 인증 사진들
            let images = await CertiImage.findAll({
                where : {
                    certi_id,
                },
                attributes : ['image']
            });
            images = images.map(i => i.image)
            const certiImages = images.join()

            // 운동 종목
            let sports = await CertiSport.findAll({
                where : {
                    certi_id,
                },
                attributes : ['sport_id']
            });
            sports = sports.map(s => s.sport_id)

            let sportsName = await Sport.findAll({
                where : {
                    id : {
                        [Op.or] : [sports],
                    }
                },
                attributes : ['name'],
                raw : true
            });
            sportsName = sportsName.map(s => s.name)
            const certiSport = sportsName.join()

            // 좋아요 포함 (내가 좋아요 눌렀는지 안눌렀는지 & 해당 게시물의 총 좋아요 개수)
            const isLiked = await Like.findOne({
                where : {
                    user_id,
                    certi_id,
                }
            });
            if (! isLiked) {
                certi.is_liked = false;
            } else {
                certi.is_liked = true;
            }

            const likeCount = await Like.findAndCountAll ({
                where : {
                    certi_id,
                }
            });
            certi.like_count = likeCount.count;

            certi.user_name = certiUser.name;
            certi.user_image = certiUser.profile_img;
            if (!certiUser.profile_img) {
                certi.user_image = ""
            }
            certi.sports = certiSport;
            certi.certi_images = certiImages;
            if (!certiImages) {
                certi.certi_images = ""
            }

            return certi

        } catch (err) {
            throw err;
        }
    },

    formatCertiList : async (certiList) => {

        try {

            for (certi of certiList) {
                
                let certiUser = await User.findOne({
                    where : {
                        id : certi.user_id
                    },
                    attributes : [['nickname','name'], 'profile_img'],
                    raw: true,
                });
                certi.user_name = certiUser.name;
                
                if (certiUser.profile_img) {
                    certi.user_img = certiUser.profile_img;
                } else {
                    certi.user_img = "";
                }

                // certi list 에는 id와 user_id 리스트가 잇음 ["","",""]
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

            return certiList;

        } catch (err) {
            throw err;
        }
    },


}