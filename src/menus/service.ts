import { paginate, PaginationResponseType } from "../lib/schema";
import { MenuModel } from "./models";
import {
  CreateMenuInput,
  MenuDto,
  SearchMenuOption,
  menuToDto,
  EditMenuInput,
} from "./schema";
import { verifyAccessToken } from "../lib/tokens";
import { menuNotFound, notYourMenu } from "../lib/errors";

export class MenuService {
  private readonly model: MenuModel;
  constructor(model: MenuModel) {
    this.model = model;
  }

  async search(
    options: SearchMenuOption
  ): Promise<PaginationResponseType<MenuDto>> {
    const menus = await this.model.getMany(options);
    return paginate(
      menus.map((menu) => menuToDto(menu)),
      options.from ?? new Date().toISOString()
    );
  }

  async create(access_token: string, data: CreateMenuInput): Promise<MenuDto> {
    const { id } = await verifyAccessToken(access_token);
    const menu = await this.model.create(id, { ...data });
    return menuToDto(menu);
  }

  async getById(id: number): Promise<MenuDto> {
    const menu = await this.model.getById(id);
    if (!menu) throw menuNotFound();
    return menuToDto(menu);
  }

  async edit(
    access_token: string,
    id: number,
    data: EditMenuInput
  ): Promise<MenuDto> {
    const { id: owner_id } = await verifyAccessToken(access_token);
    if (!(await this.model.checkOwner(id, owner_id))) throw notYourMenu("수정");
    const menu = await this.model.update(id, data);
    return menuToDto(menu);
  }

  async remove(access_token: string, id: number): Promise<void> {
    const { id: owner_id } = await verifyAccessToken(access_token);
    if (!(await this.model.checkOwner(id, owner_id))) throw notYourMenu("수정");
    await this.model.remove(id);
  }
}
