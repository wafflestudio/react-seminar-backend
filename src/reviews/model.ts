import { PrismaClient } from "@prisma/client";
import { reviewNotFound } from "../lib/errors";
import {
  CreateReviewInput,
  ReviewWithMenuAuthor,
  SearchReviewInput,
  UpdateReviewInput,
} from "./schema";

export class ReviewModel {
  private readonly conn: PrismaClient;

  constructor(conn: PrismaClient) {
    this.conn = conn;
  }

  async list(req: SearchReviewInput): Promise<ReviewWithMenuAuthor[]> {
    const from = new Date(req.from ?? Date.now());
    const count = req.count;
    const menu_id = req.menu;
    return this.conn.review.findMany({
      where: {
        created_at: { lt: from },
        menu_id,
      },
      include: {
        menu: {
          include: { owner: true, reviews: { select: { rating: true } } },
        },
        author: true,
      },
      orderBy: [{ created_at: "desc" }],
      take: count,
    });
  }

  async getById(id: number): Promise<ReviewWithMenuAuthor | null> {
    return this.conn.review.findUnique({
      where: { id },
      include: {
        menu: {
          include: { owner: true, reviews: { select: { rating: true } } },
        },
        author: true,
      },
    });
  }

  async create(
    data: CreateReviewInput,
    author_id: number
  ): Promise<ReviewWithMenuAuthor> {
    return await this.conn.review.create({
      data: {
        content: data.content,
        menu: { connect: { id: data.menu } },
        rating: data.rating,
        author: { connect: { id: author_id } },
      },
      include: {
        menu: {
          include: { owner: true, reviews: { select: { rating: true } } },
        },
        author: true,
      },
    });
  }

  async update(
    id: number,
    data: UpdateReviewInput
  ): Promise<ReviewWithMenuAuthor> {
    return await this.conn.review
      .update({
        where: { id },
        data,
        include: {
          menu: {
            include: { owner: true, reviews: { select: { rating: true } } },
          },
          author: true,
        },
      })
      .catch(() => {
        throw reviewNotFound();
      });
  }

  async remove(id: number): Promise<void> {
    await this.conn.review.delete({ where: { id } }).catch(() => {
      throw reviewNotFound();
    });
  }

  async checkAuthor(review_id: number, author_id: number): Promise<boolean> {
    const review = await this.conn.review.findUnique({
      where: {
        id: review_id,
      },
      select: { author_id: true },
      rejectOnNotFound: () => reviewNotFound(),
    });
    return review.author_id === author_id;
  }
}
