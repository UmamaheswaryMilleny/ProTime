export interface IBaseRepository<TEntity> {

  save(data: Partial<TEntity>): Promise<TEntity>;
  
}