import { Menu, PrismaClient } from "@prisma/client";
import { SearchOption } from "./schema";

export class MenuModel {
  private readonly conn: PrismaClient;
  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async getMany(option?: SearchOption): Promise<Menu[]> {
    const from = new Date(option?.from ?? Date.now());
    const count = option?.count ?? 20;
    const type = option?.type ?? null;
    const name = option?.name ?? null;
    return this.conn.menu.findMany({
      where: {
        created_at: { lt: from },
        type: type ?? undefined,
        name: name ? { contains: name } : undefined,
      },
      include: { owner: true },
      orderBy: [{ created_at: "desc" }],
      take: count,
    });
  }
}
