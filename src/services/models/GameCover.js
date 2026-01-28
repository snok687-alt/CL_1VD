const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GameCover', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      index: true
    },
    plat_type: {
      type: DataTypes.STRING(20),
      defaultValue: 'ag',
      index: true
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    game_name: {
      type: DataTypes.STRING(255)
    },
    game_type: {
      type: DataTypes.STRING(10)
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      index: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'game_covers',
    timestamps: false,
    underscored: true
  });
};