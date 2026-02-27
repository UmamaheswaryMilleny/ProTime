export interface ILevelResolver {
  getLevel(totalXp: number): number;

  getTitle(level: number): string;
}
