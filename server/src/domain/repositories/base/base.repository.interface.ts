export interface IBaseRepository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  save(data: Partial<TEntity>): Promise<TEntity>;
    // save(data: Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TEntity>;
  updateById(id: string, data: Partial<TEntity>): Promise<TEntity | null>;
  // deleteById(id: string): Promise<TEntity | null | void>;
  deleteById(id: string): Promise<void>;
  // deleteById(id:string,data:Partial<TEntity>,):Promise<Boolean>;
}
