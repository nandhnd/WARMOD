import bcrypt from "bcryptjs";

export async function up(queryInterface, Sequelize) {
  const hashedPassword = await bcrypt.hash("admin123", 10); // password default

  await queryInterface.bulkInsert("Users", [
    {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      has_store: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("Users", { email: "admin@example.com" }, {});
}
