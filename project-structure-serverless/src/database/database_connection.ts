import { getSequelizeInstance } from "./connection";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const sequelize = await getSequelizeInstance();
    await sequelize.query("SELECT 1");
    console.log("App : ✅ PostgreSQL connected (pg)");
  } catch (error) {
    console.error("App : ❌ Unable to connect to the database:", error);
  }
};
