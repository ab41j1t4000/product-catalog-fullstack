import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { prisma } from "./db/prisma.js";
import { authRoutes } from "./routes/auth.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { productRoutes } from "./routes/product.routes.js";
async function bootstrap() {
    const server = Fastify({
        logger: true,
    });
    await server.register(cors, {
        origin: true,
    });
    server.get("/health", async () => ({ status: "ok" }));
    await server.register(productRoutes, { prefix: "/api" });
    await server.register(authRoutes, { prefix: "/api" });
    await server.register(cartRoutes, { prefix: "/api" });
    const port = Number(process.env.PORT ?? 4000);
    const host = "0.0.0.0";
    const close = async () => {
        await server.close();
        await prisma.$disconnect();
    };
    process.on("SIGINT", close);
    process.on("SIGTERM", close);
    await server.listen({ port, host });
}
bootstrap().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=server.js.map