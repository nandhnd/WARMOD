export async function up(queryInterface, Sequelize) {
  await queryInterface.removeColumn("Discounts", "title");
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn("Discounts", "title", {
    type: Sequelize.STRING,
    allowNull: false,
  });
}
