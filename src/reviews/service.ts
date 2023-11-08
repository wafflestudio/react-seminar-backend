import { notYourReview, reviewNotFound } from "../lib/errors";
import { verifyAccessToken } from "../lib/tokens";
import { ReviewModel } from "./model";
import {
  CreateReviewInput,
  ReviewDto,
  reviewToDto,
  SearchReviewInput,
  UpdateReviewInput,
} from "./schema";

export class ReviewService {
  private readonly model: ReviewModel;
  constructor(model: ReviewModel) {
    this.model = model;
  }

  async list(
    options: SearchReviewInput
  ): Promise<ReviewDto[]> {
    const reviews = await this.model.list(options);
    return reviews.map((review) => reviewToDto(review));
  }

  async getById(id: number): Promise<ReviewDto> {
    const review = await this.model.getById(id);
    if (!review) throw reviewNotFound();
    return reviewToDto(review);
  }

  async create(token: string, data: CreateReviewInput): Promise<ReviewDto> {
    const { id } = await verifyAccessToken(token);
    const review = await this.model.create(data, id);
    return reviewToDto(review);
  }

  async update(
    token: string,
    review_id: number,
    data: UpdateReviewInput
  ): Promise<ReviewDto> {
    const { id: author_id } = await verifyAccessToken(token);
    if (!(await this.model.checkAuthor(review_id, author_id)))
      throw notYourReview();
    const review = await this.model.update(review_id, data);
    return reviewToDto(review);
  }

  async remove(token: string, review_id: number): Promise<void> {
    const { id: author_id } = await verifyAccessToken(token);
    if (!(await this.model.checkAuthor(review_id, author_id)))
      throw notYourReview();
    await this.model.remove(review_id);
  }
}
