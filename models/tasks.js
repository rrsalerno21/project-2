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
    category: {
      type: DataTypes.STRING(50),
      defaultValue: "General"
    },
    complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User);
  };

  return Task;
};
