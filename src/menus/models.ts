import { Menu, Prisma, PrismaClient } from "@prisma/client";
import { SearchOption } from "./schema";

export class MenuModel {
  private readonly conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async getMany(option?: SearchOption): Promise<Menu[]> {
    const from = new Date(option?.from ?? Date.now());
    const count = option?.count ?? 20;
    const type = option?.type;
    const search = option?.search;
    const owner = option?.owner;
    return this.conn.menu.findMany({
      where: {
        created_at: { lt: from },
        type,
        name: search ? { contains: search } : undefined,
        owner_id: owner,
      },
      include: { owner: true },
      orderBy: [{ created_at: "desc" }],
      take: count,
    });
  }

  async create(menu: Prisma.MenuCreateInput): Promise<Menu> {
    return this.conn.menu.create({
      data: menu,
    });
  }

  async getById(id: number): Promise<Menu | null> {
    return this.conn.menu.findUnique({ where: { id } });
  }

  async update(id: number, menu: Prisma.MenuUpdateInput): Promise<Menu> {
    return this.conn.menu.update({
      data: menu,
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.conn.menu.delete({
      where: { id },
    });
  }
}
