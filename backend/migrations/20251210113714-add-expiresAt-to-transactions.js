export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("Transactions", "expiresAt", {
    type: Sequelize.DATE,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("Transactions", "expiresAt");
}
