export type LLMRole = 'system' | 'user' | 'assistant';

export abstract class LLM {
    constructor() {}
    abstract message(role: LLMRole, message: string): Record<string, string>;
    abstract submitPrompt(prompt: Array<Record<string, string>>): void;
}
