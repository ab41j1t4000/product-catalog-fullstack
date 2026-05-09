import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../db/prisma.js";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
function createPaymentReference() {
    return `pay_${randomBytes(8).toString("hex")}`;
}
function createSessionToken() {
    return randomBytes(24).toString("hex");
}
export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export async function signInUser(input) {
    const user = await prisma.user.upsert({
        where: { email: input.email },
        update: input.name ? { name: input.name } : {},
        create: {
            email: input.email,
            ...(input.name ? { name: input.name } : {}),
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
    const token = createSessionToken();
    await prisma.session.create({
        data: {
            token: hashToken(token),
            userId: user.id,
            expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        },
    });
    return { token, user };
}
export async function getUserFromRequest(request) {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return null;
    }
    const session = await prisma.session.findFirst({
        where: {
            token: hashToken(token),
            expiresAt: { gt: new Date() },
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
    return session?.user ?? null;
}
export async function createCheckout(userId, input) {
    const products = await prisma.product.findMany({
        where: {
            id: { in: input.items.map((item) => item.productId) },
        },
        select: {
            id: true,
            name: true,
            category: true,
            priceCents: true,
            inventory: true,
        },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));
    let subtotalCents = 0;
    const orderItems = input.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }
        if (product.inventory < item.quantity) {
            throw new Error(`${product.name} does not have enough inventory`);
        }
        subtotalCents += product.priceCents * item.quantity;
        return {
            productId: product.id,
            quantity: item.quantity,
            unitPriceCents: product.priceCents,
            productName: product.name,
            productCategory: product.category,
        };
    });
    const taxCents = Math.round(subtotalCents * 0.1);
    const totalCents = subtotalCents + taxCents;
    const paymentReference = createPaymentReference();
    const order = await prisma.$transaction(async (transaction) => {
        for (const item of orderItems) {
            await transaction.product.update({
                where: { id: item.productId },
                data: {
                    inventory: { decrement: item.quantity },
                },
            });
        }
        return transaction.order.create({
            data: {
                userId,
                status: "paid",
                subtotalCents,
                taxCents,
                totalCents,
                paymentReference,
                shippingAddress: input.shippingAddress,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: true,
            },
        });
    });
    return order;
}
//# sourceMappingURL=cart.service.js.map