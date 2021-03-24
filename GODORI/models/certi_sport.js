const Certification = require('./certification')
const Sport = require('./sport')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CertiSport', {
        certi_id: { // 인증 게시물 아이디
            type: DataTypes.INTEGER,
            reference: {
                model: Certification,
                key: 'id',
            }
        },
        sport_id: { // 인증 게시물 운동 종류
            type: DataTypes.INTEGER,
            reference: {
                model: Sport,
                key: 'id',
            }
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
    });
};