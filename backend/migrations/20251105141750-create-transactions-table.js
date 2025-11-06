export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("transactions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    reference_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    invoice_id: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
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
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    payment_method: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    payment_status: {
      type: Sequelize.ENUM("PENDING", "PAID", "FAILED", "EXPIRED"),
      defaultValue: "PENDING",
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
  await queryInterface.dropTable("transactions");
}
