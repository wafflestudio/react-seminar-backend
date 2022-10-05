import { Menu, Prisma, PrismaClient } from "@prisma/client";
import { SearchMenuOption, MenuWithOwner, CreateMenuInput } from "./schema";

export class MenuModel {
  private readonly conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async getMany(option?: SearchMenuOption): Promise<MenuWithOwner[]> {
    const from = new Date(option?.from ?? Date.now());
    const count = option?.count;
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

  async create(
    owner_id: number,
    menu: CreateMenuInput
  ): Promise<MenuWithOwner> {
    return this.conn.menu.create({
      data: {
        ...menu,
        owner: {
          connect: { id: owner_id },
        },
      },
      include: { owner: true },
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
