export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("transaction_items", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    transaction_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "transactions",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    addon_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "addons",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("transaction_items");
}
