import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
    }
  }
});

async function run() {
  const p = "7971172325";
  const quotes = await prisma.quote.findMany({
    where: {
      OR: [
        { breakdownJson: { contains: p } },
        { selectedAnswersJson: { contains: p } }
      ]
    },
    include: { orders: true, variant: { include: { model: { include: { brand: true } } } } }
  });
  console.log("Quotes matching 7971172325:", quotes.length);
  quotes.forEach(q => console.log("Quote:", q.quoteNumber, q.variant?.model?.name, q.breakdownJson?.slice(0, 200)));

  const leads = (prisma as any).lead?.findMany ? await (prisma as any).lead.findMany({
    where: { phone: { contains: p } }
  }) : [];
  console.log("Leads matching 7971172325:", leads.length);
}

run().catch(console.error).finally(() => prisma.$disconnect());
