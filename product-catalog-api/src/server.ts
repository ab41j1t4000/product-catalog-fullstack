import "dotenv/config";
import { buildServer } from "./app.js";

const server = await buildServer();
const port = Number(process.env.PORT ?? 4000);
const host = "0.0.0.0";

const close = async () => {
  await server.close();
};

process.once("SIGINT", close);
process.once("SIGTERM", close);

try {
  await server.listen({ port, host });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
