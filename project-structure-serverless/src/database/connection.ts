import { Sequelize } from "sequelize";
import { getSecret, areSecretsInitialized, initializeSecrets } from "../utils/secrets";

let sequelize: Sequelize | null = null;

export const getSequelizeInstance = async (): Promise<Sequelize> => {
  if (!areSecretsInitialized()) {
    await initializeSecrets();
  }

  if (!sequelize) {
    sequelize = new Sequelize(
      getSecret("DB_NAME"),
      getSecret("DB_USERNAME"),
      getSecret("DB_PASSWORD"),
      {
        host: getSecret("DB_HOSTNAME"),
        port: 5432,
        dialect: "postgres",
        logging: false,
        pool: {
          max: 15,
          min: 0,
          idle: 10000,
          acquire: 20000,
        },
        dialectOptions: {
          ssl:
            process.env.DB_SSL === "true"
              ? { require: true, rejectUnauthorized: false }
              : { rejectUnauthorized: false },
        },
      }
    );
  }

  return sequelize;
};

export const db = {
  query: async (sql: string, params?: any[]) => {
    const sequelizeInstance = await getSequelizeInstance();
    const [rows] = await sequelizeInstance.query(sql, {
      bind: params,
    });
    return { rows };
  },
};
