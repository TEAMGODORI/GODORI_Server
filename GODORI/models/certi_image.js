const Certification = require('./certification')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CertiImage', {
        certi_id: { // 인증게시물 아이디
            type: DataTypes.INTEGER,
            reference: {
                model: Certification,
                key: 'id',
            }
        },
        image: { // 인증 게시물 사진
            type: DataTypes.STRING(200),
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
    });
};