export type LLMRole = 'system' | 'user' | 'assistant';

export abstract class LLM {
    constructor() {}
    abstract ask(prompt: Array<Record<string, string>>): AsyncIterable<string>;
}
