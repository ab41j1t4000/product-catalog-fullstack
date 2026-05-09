import { prisma } from "../src/db/prisma.js";

const products = [
  {
    slug: "aurora-lamp",
    name: "Aurora Lamp",
    category: "Lighting",
    description:
      "A low-profile desk lamp with warm LED diffusion and USB-C power for focused work sessions.",
    priceCents: 8900,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    inventory: 18,
    isFeatured: true,
  },
  {
    slug: "ridge-notebook",
    name: "Ridge Notebook",
    category: "Stationery",
    description:
      "Thread-bound notebook with heavyweight dotted pages designed for planning, sketching, and sprint notes.",
    priceCents: 2400,
    imageUrl:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
    inventory: 64,
    isFeatured: true,
  },
  {
    slug: "summit-bottle",
    name: "Summit Bottle",
    category: "Hydration",
    description:
      "Powder-coated stainless bottle with double-wall insulation and a leak-resistant cap.",
    priceCents: 3200,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    inventory: 42,
    isFeatured: false,
  },
  {
    slug: "cascade-headphones",
    name: "Cascade Headphones",
    category: "Audio",
    description:
      "Wireless over-ear headphones tuned for long listening sessions with soft memory foam padding.",
    priceCents: 15900,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    inventory: 11,
    isFeatured: true,
  },
  {
    slug: "field-tote",
    name: "Field Tote",
    category: "Bags",
    description:
      "Structured canvas tote with internal bottle sleeve, laptop compartment, and reinforced handles.",
    priceCents: 6900,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    inventory: 27,
    isFeatured: false,
  },
  {
    slug: "atlas-keyboard",
    name: "Atlas Keyboard",
    category: "Workspace",
    description:
      "Compact mechanical keyboard with tactile switches, hot-swap sockets, and wired USB-C connectivity.",
    priceCents: 12900,
    imageUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    inventory: 9,
    isFeatured: true,
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({ data: products });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
