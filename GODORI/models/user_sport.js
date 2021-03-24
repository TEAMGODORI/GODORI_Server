const Sport = require('./sport')
const User = require('./user')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('UserSport', {
        user_id: { // 유저 아이디
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        sport_id: { // 유저 취향 운동종목
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