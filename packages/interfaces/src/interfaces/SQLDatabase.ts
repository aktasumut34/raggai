export abstract class SQLDatabase {
    constructor() {}
    abstract runQuery(query: string): Promise<any>;
}
