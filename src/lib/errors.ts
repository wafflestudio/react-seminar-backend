import { STATUS } from "./utils";

export class ErrorWithStatus extends Error {
  error: string;
  statusCode: number;

  constructor(message: string | undefined, error: string, statusCode: number) {
    super(message);
    this.error = error;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends ErrorWithStatus {
  constructor(message?: string) {
    super(message, "not found", STATUS.NOT_FOUND);
  }
}

export class UnauthorizedError extends ErrorWithStatus {
  constructor(message?: string) {
    super(message, "unauthorized", STATUS.UNAUTHORIZED);
  }
}

export class AccessDeniedError extends ErrorWithStatus {
  constructor(message?: string) {
    super(message, "access denied", STATUS.ACCESS_DENIED);
  }
}

export class BadRequestError extends ErrorWithStatus {
  constructor(message?: string) {
    super(message, "bad request", STATUS.BAD_REQUEST);
  }
}

export const invalidLogin = () =>
  new UnauthorizedError("이름 또는 패스워드가 올바르지 않습니다");

export const invalidToken = () =>
  new UnauthorizedError("토큰이 올바르지 않습니다");

export const ownerNotFound = () =>
  new NotFoundError("사장님을 찾을 수 없습니다");

export const menuNotFound = () => new NotFoundError("메뉴를 찾을 수 없습니다");

export const nothingToUpdate = () =>
  new BadRequestError("수정할 사항이 없습니다");

export const notYourMenu = (verb = "변경") =>
  new AccessDeniedError(`다른 사람의 메뉴를 ${verb}할 수 없습니다`);

export const notYourReview = (verb = "변경") =>
  new AccessDeniedError(`다른 사람이 쓴 리뷰를 ${verb}할 수 없습니다`);

export const reviewNotFound = () =>
  new NotFoundError("리뷰를 찾을 수 없습니다");
