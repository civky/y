module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        email: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                User.hasOne(models.Role)
            }
        }
    });
    return User;

};