export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("Transactions", "qrisImage", {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("Transactions", "qrisImage");
}
