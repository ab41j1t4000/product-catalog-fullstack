import "dotenv/config";

import cors from "@fastify/cors";
import Fastify from "fastify";

async function bootstrap() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: true,
  });

  server.get("/health", async () => ({
    status: "ok",
    message: "Hello from the backend.",
  }));

  const port = Number(process.env.PORT ?? 4000);
  const host = "0.0.0.0";

  const close = async () => {
    await server.close();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  await server.listen({ port, host });
}

bootstrap().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
