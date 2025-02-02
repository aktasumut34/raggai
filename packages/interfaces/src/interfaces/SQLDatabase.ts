export abstract class SQLDatabase {
  constructor(public readonly config: any) {}
  abstract runQuery(query: string): any;
}
