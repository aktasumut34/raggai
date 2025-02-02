import { deterministicUUID } from '@raggai/utils';
import { DefaultEmbeddingFunction, ChromaClient, type IEmbeddingFunction, type Collection } from 'chromadb';
import { DataFrame, concat } from 'danfojs';
import type { VectorStore } from '@raggai/interfaces';

export type ChromaDBConfig = {
    path?: string;
    nResults?: number;
    nResultsSQL?: number;
    nResultsDocumentation?: number;
    nResultsDDL?: number;
    collectionMetadata?: Record<string, string | number>;
    embeddingFunction?: IEmbeddingFunction;
};

export default class ChromaDB implements VectorStore {
    private embeddingFunction: IEmbeddingFunction;
    private chromaClient: ChromaClient;
    private documentationCollection?: Collection;
    private ddlCollection?: Collection;
    private sqlCollection?: Collection;
    private nResultsSql: number;
    private nResultsDocumentation: number;
    private nResultsDDL: number;
    private config?: ChromaDBConfig;

    constructor(config?: ChromaDBConfig) {
        this.config = config;
        const path: string = this.config?.path || '.';
        this.embeddingFunction = this.config?.embeddingFunction || new DefaultEmbeddingFunction();
        this.nResultsSql = this.config?.nResultsSQL || this.config?.nResults || 10;
        this.nResultsDocumentation = this.config?.nResultsDocumentation || this.config?.nResults || 10;
        this.nResultsDDL = this.config?.nResultsDDL || this.config?.nResults || 10;

        this.chromaClient = new ChromaClient({
            path: path,
        });
    }

    async init() {
        this.documentationCollection = await this.chromaClient.getOrCreateCollection({
            name: 'documentation',
            embeddingFunction: this.embeddingFunction,
            metadata: this.config?.collectionMetadata ?? {},
        });
        this.ddlCollection = await this.chromaClient.getOrCreateCollection({
            name: 'ddl',
            embeddingFunction: this.embeddingFunction,
            metadata: this.config?.collectionMetadata ?? {},
        });
        this.sqlCollection = await this.chromaClient.getOrCreateCollection({
            name: 'sql',
            embeddingFunction: this.embeddingFunction,
            metadata: this.config?.collectionMetadata ?? {},
        });
    }

    public async generateEmbedding(data: string): Promise<number[]> {
        const embedding = await this.embeddingFunction.generate([data]);
        return embedding?.[0] ?? [];
    }

    public async addQuestionSQL(question: string, sql: string): Promise<string> {
        const questionSqlJson = JSON.stringify(
            {
                question: question,
                sql: sql,
            },
            undefined,
            0
        );
        const id = deterministicUUID(questionSqlJson) + '-sql';
        this.sqlCollection?.add({
            documents: questionSqlJson,
            embeddings: await this.generateEmbedding(questionSqlJson),
            ids: id,
        });
        return id;
    }

    public async addDDL(ddl: string): Promise<string> {
        const id = deterministicUUID(ddl) + '-ddl';
        this.ddlCollection?.add({
            documents: ddl,
            embeddings: await this.generateEmbedding(ddl),
            ids: id,
        });
        return id;
    }

    public async addDocumentation(documentation: string): Promise<string> {
        const id = deterministicUUID(documentation) + '-doc';
        this.documentationCollection?.add({
            documents: documentation,
            embeddings: await this.generateEmbedding(documentation),
            ids: id,
        });
        return id;
    }

    public async getTrainingData(): Promise<DataFrame> {
        let df = new DataFrame([]);
        const sqlData = await this.sqlCollection?.get();
        if (sqlData) {
            const documents = (sqlData.documents as string[]).map((doc) => JSON.parse(doc));
            const ids = sqlData.ids as string[];
            const dfSQL = new DataFrame({
                id: ids,
                question: documents.map((doc) => doc.question),
                content: documents.map((doc) => doc.sql),
            });
            dfSQL.addColumn('training_data_type', Array(dfSQL.shape[0]).fill('sql'));
            df = concat({
                dfList: [df, dfSQL],
                axis: 0,
            }) as DataFrame;
        }

        const ddlData = await this.ddlCollection?.get();
        if (ddlData) {
            const documents = ddlData.documents as string[];
            const ids = ddlData.ids as string[];
            const dfDDL = new DataFrame({
                id: ids,
                question: documents.map(() => null),
                content: documents,
            });
            dfDDL.addColumn('training_data_type', Array(dfDDL.shape[0]).fill('ddl'));
            df = concat({
                dfList: [df, dfDDL],
                axis: 0,
            }) as DataFrame;
        }

        const docData = await this.documentationCollection?.get();
        if (docData) {
            const documents = docData.documents as string[];
            const ids = docData.ids as string[];
            const dfDoc = new DataFrame({
                id: ids,
                question: documents.map(() => null),
                content: documents,
            });
            dfDoc.addColumn('training_data_type', Array(dfDoc.shape[0]).fill('documentation'));
            df = concat({
                dfList: [df, dfDoc],
                axis: 0,
            }) as DataFrame;
        }

        return df;
    }

    public removeTrainingData(id: string): boolean {
        if (id.endsWith('-sql')) {
            this.sqlCollection?.delete({
                ids: id,
            });
            return true;
        } else if (id.endsWith('-ddl')) {
            this.ddlCollection?.delete({
                ids: id,
            });
            return true;
        } else if (id.endsWith('-doc')) {
            this.documentationCollection?.delete({
                ids: id,
            });
            return true;
        } else {
            return false;
        }
    }

    public async removeCollection(collectionName: string): Promise<boolean> {
        if (collectionName === 'sql') {
            await this.chromaClient.deleteCollection({
                name: 'sql',
            });
            this.sqlCollection = await this.chromaClient.getOrCreateCollection({
                name: 'sql',
                embeddingFunction: this.embeddingFunction,
            });
            return true;
        } else if (collectionName === 'ddl') {
            await this.chromaClient.deleteCollection({
                name: 'ddl',
            });
            this.ddlCollection = await this.chromaClient.getOrCreateCollection({
                name: 'ddl',
                embeddingFunction: this.embeddingFunction,
            });
            return true;
        } else if (collectionName === 'documentation') {
            await this.chromaClient.deleteCollection({
                name: 'documentation',
            });
            this.documentationCollection = await this.chromaClient.getOrCreateCollection({
                name: 'documentation',
                embeddingFunction: this.embeddingFunction,
            });
            return true;
        } else {
            return false;
        }
    }

    private async getDocuments(
        collection: Collection,
        question: string,
        nResults: number = 10
    ): Promise<(string | null)[][]> {
        const documents = await collection.query({
            queryTexts: [question],
            nResults,
        });
        return documents.documents;
    }

    public async getSimilarQuestionSQL(question: string): Promise<(string | null)[][]> {
        if (!this.sqlCollection) {
            return [];
        }
        return this.getDocuments(this.sqlCollection, question, this.nResultsSql);
    }

    public async getRelatedDDL(question: string): Promise<(string | null)[][]> {
        if (!this.ddlCollection) {
            return [];
        }
        return this.getDocuments(this.ddlCollection, question, this.nResultsDDL);
    }

    public async getRelatedDocumentation(question: string): Promise<(string | null)[][]> {
        if (!this.documentationCollection) {
            return [];
        }
        return this.getDocuments(this.documentationCollection, question, this.nResultsDocumentation);
    }
}
