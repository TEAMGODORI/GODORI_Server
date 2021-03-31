const Group = require('./group')
const User = require('./user')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Join', {

        user_id: { // 멤버인 유저
            type: DataTypes.INTEGER,
            reference: {
                model: User,
                key: 'id',
            }
        },
        group_id: { // 그룹 id
            type: DataTypes.INTEGER,
            reference: {
                model: Group,
                key: 'id',
            }
        },
        achive_rate: { // 달성률
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        week_count: { // 인증횟수
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
    });
};