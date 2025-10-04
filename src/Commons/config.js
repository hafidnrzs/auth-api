import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV === "test") {
  dotenv.config({
    path: path.resolve(process.cwd(), ".test.env"),
  });
} else {
  dotenv.config();
}

export const config = {
  database: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
};
