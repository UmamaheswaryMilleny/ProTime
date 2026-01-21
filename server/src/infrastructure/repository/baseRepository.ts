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


}