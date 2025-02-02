export abstract class VectorStore {
  constructor(public readonly config: any) {}
  abstract generateEmbedding: (text: string) => Promise<number[]>;
  abstract addQuestionToSql: (question: string, sql: string) => Promise<string>;
  abstract addDdl: (ddl: string) => Promise<string>;
  abstract addDocumentation: (documentation: string) => Promise<string>;
  abstract getTrainingData: () => Promise<string[][]>;
  abstract removeCollection: (collection: string) => Promise<boolean>;
  abstract getSimilarQuestionSql: (question: string) => Promise<string>;
  abstract getRelatedDdl: (question: string) => Promise<string>;
  abstract getRelatedDocumentation: (question: string) => Promise<string>;
}
