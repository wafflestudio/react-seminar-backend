import { MenuModel } from "./models";
import {
  CreateMenuInput,
  MenuDto,
  SearchMenuOption,
  menuToDto,
} from "./schema";
import { verifyAccessToken } from "../lib/tokens";

export class MenuService {
  private readonly model: MenuModel;
  constructor(model: MenuModel) {
    this.model = model;
  }

  async search(
    options: SearchMenuOption
  ): Promise<{ data: MenuDto[]; next: number }> {
    const menus = await this.model.getMany(options);
    return {
      data: menus.map((menu) => menuToDto(menu)),
      next: menus[menus.length - 1].created_at.getDate(),
    };
  }

  async create(access_token: string, data: CreateMenuInput): Promise<MenuDto> {
    const { id } = await verifyAccessToken(access_token);
    const menu = await this.model.create(id, { ...data });
    return menuToDto(menu);
  }
}
