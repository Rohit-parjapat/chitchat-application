import { PrismaClient } from "../../generated/prisma";
declare const prisma: PrismaClient<{
    log: ("info" | "query" | "warn" | "error")[];
}, "info" | "query" | "warn" | "error", import("../../generated/prisma/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=db.config.d.ts.map