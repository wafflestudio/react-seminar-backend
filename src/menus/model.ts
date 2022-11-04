import { Prisma, PrismaClient } from "@prisma/client";
import {
  SearchMenuOption,
  MenuWithOwnerRating,
  CreateMenuInput,
} from "./schema";
import { menuNotFound } from "../lib/errors";

export class MenuModel {
  private readonly conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async getMany(option?: SearchMenuOption): Promise<MenuWithOwnerRating[]> {
    const from = new Date(option?.from ?? Date.now());
    const count = option?.count;
    const type = option?.type;
    const search = option?.search;
    const owner = option?.owner;
    console.log("from=", option?.from);
    return this.conn.menu.findMany({
      where: {
        created_at: { lt: from },
        type,
        name: search ? { contains: search } : undefined,
        owner_id: owner,
      },
      include: { owner: true, reviews: { select: { rating: true } } },
      orderBy: [{ created_at: "desc" }],
      take: count,
    });
  }

  async create(
    owner_id: number,
    menu: CreateMenuInput
  ): Promise<MenuWithOwnerRating> {
    return this.conn.menu.create({
      data: {
        ...menu,
        owner: {
          connect: { id: owner_id },
        },
      },
      include: { owner: true, reviews: { select: { rating: true } } },
    });
  }

  async getById(id: number): Promise<MenuWithOwnerRating | null> {
    return this.conn.menu.findUnique({
      where: { id },
      include: { owner: true, reviews: { select: { rating: true } } },
    });
  }

  async checkOwner(menu_id: number, owner_id: number): Promise<boolean> {
    const menu = await this.conn.menu.findUnique({
      where: { id: menu_id },
      select: { owner_id: true },
    });
    if (!menu) throw menuNotFound();
    return menu.owner_id === owner_id;
  }

  async update(
    id: number,
    menu: Prisma.MenuUpdateInput
  ): Promise<MenuWithOwnerRating> {
    return this.conn.menu
      .update({
        data: menu,
        where: { id },
        include: { owner: true, reviews: { select: { rating: true } } },
      })
      .catch(() => {
        throw menuNotFound();
      });
  }

  async remove(id: number): Promise<void> {
    await this.conn.menu
      .delete({
        where: { id },
      })
      .catch((reason) => {
        throw menuNotFound();
      });
  }
}
