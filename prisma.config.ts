import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
  schema: path.join("prisma", "schema.prisma"),
});
