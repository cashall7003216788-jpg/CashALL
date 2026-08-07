import { prisma } from "../db";
console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
