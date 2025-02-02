import { type DataFrame } from 'danfojs';

export abstract class VectorStore {
    constructor() {}
    abstract init: () => Promise<void>;
    abstract generateEmbedding: (text: string) => Promise<number[]>;
    abstract addQuestionSQL: (question: string, sql: string) => Promise<string>;
    abstract addDDL: (ddl: string) => Promise<string>;
    abstract addDocumentation: (documentation: string) => Promise<string>;
    abstract getTrainingData: () => Promise<DataFrame>;
    abstract removeCollection: (collection: string) => Promise<boolean>;
    abstract getSimilarQuestionSQL: (question: string) => Promise<(string | null)[][]>;
    abstract getRelatedDDL: (question: string) => Promise<(string | null)[][]>;
    abstract getRelatedDocumentation: (question: string) => Promise<(string | null)[][]>;
}
