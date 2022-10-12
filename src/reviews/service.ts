import { verifyAccessToken } from "../lib/tokens";
import { ReviewModel } from "./model";
import {
  CreateReviewInput,
  ReviewDto,
  reviewToDto,
  SearchReviewInput,
} from "./schema";

export class ReviewService {
  private readonly model: ReviewModel;
  constructor(model: ReviewModel) {
    this.model = model;
  }

  async list(options: SearchReviewInput): Promise<ReviewDto[]> {
    const reviews = await this.model.list(options);
    return reviews.map((review) => reviewToDto(review));
  }

  async create(token: string, data: CreateReviewInput): Promise<ReviewDto> {
    const { id } = await verifyAccessToken(token);
    const review = await this.model.create(data, id);
    return reviewToDto(review);
  }
}
