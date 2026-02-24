// import { PrismaClient } from "@prisma/client";

// export default class PrismaSingleton {
//     private static prisma: PrismaClient | null = null;

//     static getPrisma(): PrismaClient {
//         // console.log("Getting prisma variable");
//         if (PrismaSingleton.prisma == null) {
//             console.log("Resetting prisma variable and creating a new one");
//             PrismaSingleton.prisma = new PrismaClient({
//                 // Log all database queries
//                 log: ["info", "warn", "error"],
//                 // Doesn't work for some reason even with omitApi
//                 // omit: {
//                 //     user: {
//                 //         password: true
//                 //     },
//                 // }
//             });
//         }

//         return PrismaSingleton.prisma;
//     }

//     static async disconnectPrisma() {
//         if (PrismaSingleton.prisma != null) {
//             await PrismaSingleton.prisma.$disconnect();
//             PrismaSingleton.prisma = null;
//         }
//     }
// }

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // avoid noisy "info" in prod
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;