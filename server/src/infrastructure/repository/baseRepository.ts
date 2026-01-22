import { Document, Model } from "mongoose";
import type { IBaseRepository } from "../../domain/repositoryInterface/baseRepository-interface.js";

export class BaseRepository<TDoc extends Document, TEntity>
  implements IBaseRepository<TEntity>
{
  protected model: Model<TDoc>;
  protected toDomain?: (doc: TDoc) => TEntity;
  protected toModel?: (data: Partial<TEntity>) => Partial<TDoc>;

  constructor(
    model: Model<TDoc>,
    toDomain?: (doc: TDoc) => TEntity,
    toModel?: (data: Partial<TEntity>) => Partial<TDoc>
  ) {
    this.model = model;
    this.toDomain = toDomain;
    this.toModel = toModel;
  }

  async save(data: Partial<TEntity>): Promise<TEntity> {
    const modelData = this.toModel
      ? this.toModel(data)
      : (data as Partial<TDoc>);

   
    const doc = new this.model(modelData);
    await doc.save();

    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async updateById(
    id: string,
    data: Partial<TEntity>
  ): Promise<TEntity | null> {
    const modelData = this.toModel
      ? this.toModel(data)
      : (data as Partial<TDoc>);

    const doc = await this.model
      .findByIdAndUpdate(id, modelData, { new: true })
      .exec();

    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async deleteById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }
}