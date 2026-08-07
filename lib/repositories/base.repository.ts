import { prisma } from "../db";

export class BaseRepository<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  protected get delegate() {
    return (prisma as any)[this.modelName];
  }

  async findById(id: string): Promise<T | null> {
    return this.delegate.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findMany(where: any = {}, options: any = {}): Promise<T[]> {
    return this.delegate.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      ...options,
    });
  }

  async findFirst(where: any = {}, options: any = {}): Promise<T | null> {
    return this.delegate.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      ...options,
    });
  }

  async create(data: any): Promise<T> {
    return this.delegate.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.delegate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    // Soft delete
    return this.delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<T> {
    return this.delegate.delete({
      where: { id },
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.delegate.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }
}
