const Group = require('./group')
const Sport = require('./sport')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('GroupSport', {
        group_id: { // 그룹 아이디
            type: DataTypes.INTEGER,
            reference: {
                model: Group,
                key: 'id',
            }
        },
        sport_id: { // 그룹 운동 취향 종류
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