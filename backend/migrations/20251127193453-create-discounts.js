export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("discounts", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    store_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    percentage: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    start_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    end_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "inactive",
    },

    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("discounts");
}
