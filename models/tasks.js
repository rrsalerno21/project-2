module.exports = function(sequelize, DataTypes) {
  const Task = sequelize.define("Task", {
    task: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    due_date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    due_date_time: {
      type: DataTypes.TIME,
      validate: {
        allowNull: false,
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: "General"
    }
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User);
  };

  return Task;
};
