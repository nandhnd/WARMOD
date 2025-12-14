export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("discount_items", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    discount_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "discounts",
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

  // Unique rule: 1 addon tidak boleh punya 2 diskon overlapped
  await queryInterface.addConstraint("discount_items", {
    fields: ["discount_id", "addon_id"],
    type: "unique",
    name: "unique_discount_addon_pair",
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("discount_items");
}
