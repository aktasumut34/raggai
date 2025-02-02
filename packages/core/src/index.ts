import { LLM, VectorStore, SQLDatabase } from "@raggai/interfaces";

export class Raggai {
  constructor(
    private llm: LLM,
    private vectorStore: VectorStore,
    private sqlDatabase: SQLDatabase
  ) {}

  private generatePrompt(question: string): string {
    return question;
  }

  trainWithSchema(): void {
    // generate schema from SQLDatabase and save embeddings in VectorStore
  }

  trainWithDDL(ddl: string): void {
    // generate schema from DDL and save embeddings in VectorStore
  }

  trainWithQuery(question: string, query: string): void {
    // generate embeddings from question and query and save in VectorStore
  }

  trainWithDocument(question: string, document: string): void {
    // generate embeddings from question and document and save in VectorStore
  }

  ask(question: string) {
    // generate embeddings from question and query the VectorStore
    this.generatePrompt(question);
  }
}
