import { Document, Model} from "mongoose";
import type { ClientSession } from "mongoose";
import type { IBaseRepository } from "../../domain/repositories/base.repository.interface.js";



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

  async save(
    data: Partial<TEntity>,
    session?: ClientSession
  ): Promise<TEntity> {
    const modelData = this.toModel
      ? this.toModel(data)
      : (data as Partial<TDoc>);

    const doc = new this.model(modelData);

    
    if (session) {
      await doc.save({ session });//Save this document as part of a transaction.
    } else {
      await doc.save();
    }

    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async findById(
    id: string,
    session?: ClientSession
  ): Promise<TEntity | null> {
    const query = this.model.findById(id);

    if (session) {
      query.session(session);
    }

    const doc = await query.exec();
    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async updateById(
    id: string,
    data: Partial<TEntity>,
    session?: ClientSession
  ): Promise<TEntity | null> {
    const modelData = this.toModel
      ? this.toModel(data)
      : (data as Partial<TDoc>);

    const query = this.model.findByIdAndUpdate(id, modelData, { new: true });

    if (session) {
      query.session(session);
    }

    const doc = await query.exec();

    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }

  async deleteById(
    id: string,
    session?: ClientSession
  ): Promise<TEntity | null> {
    const query = this.model.findByIdAndDelete(id);

    if (session) {
      query.session(session);
    }

    const doc = await query.exec();
    if (!doc) return null;
    return this.toDomain ? this.toDomain(doc) : (doc as unknown as TEntity);
  }
}