export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("withdrawal_requests", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    store_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    bank_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    account_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    account_holder: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED", "TRANSFERRED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
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
  await queryInterface.dropTable("withdrawal_requests");
}
