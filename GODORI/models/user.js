module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {

        nickname: { // 닉네임
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: 'nickname'
        },
        name: { // 이름
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        kakao_id: { // 카카오톡 회원 id
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        profile_img: { // 프로필 이미지
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ex_cycle: { // 운동 주기
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ex_intensity: { // 운동 목표
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        current_group_id: { // 현재 속한 그룹 id
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
};