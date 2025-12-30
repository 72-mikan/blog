import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

// .env を読み込む
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
