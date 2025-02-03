import { LLM, LLMRole } from '@raggai/interfaces';
import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { streamText, Tool, ToolSet } from 'ai';
import { z } from 'zod';
import * as readline from 'node:readline/promises';

export type OpenAIConfig = {
    provider: OpenAIProviderSettings;
    model:
        | 'o1'
        | 'o1-2024-12-17'
        | 'o1-mini'
        | 'o1-mini-2024-09-12'
        | 'o1-preview'
        | 'o1-preview-2024-09-12'
        | 'o3-mini'
        | 'o3-mini-2025-01-31'
        | 'gpt-4o'
        | 'gpt-4o-2024-05-13'
        | 'gpt-4o-2024-08-06'
        | 'gpt-4o-2024-11-20'
        | 'gpt-4o-audio-preview'
        | 'gpt-4o-audio-preview-2024-10-01'
        | 'gpt-4o-audio-preview-2024-12-17'
        | 'gpt-4o-mini'
        | 'gpt-4o-mini-2024-07-18'
        | 'gpt-4-turbo'
        | 'gpt-4-turbo-2024-04-09'
        | 'gpt-4-turbo-preview'
        | 'gpt-4-0125-preview'
        | 'gpt-4-1106-preview'
        | 'gpt-4'
        | 'gpt-4-0613'
        | 'gpt-3.5-turbo-0125'
        | 'gpt-3.5-turbo'
        | 'gpt-3.5-turbo-1106'
        | (string & {});
};

export class OpenAI implements LLM {
    private openai;
    private config: OpenAIConfig;
    public tools: ToolSet = {};

    constructor(config: OpenAIConfig = { provider: {}, model: 'gpt-3.5-turbo' }) {
        this.config = config;
        this.openai = createOpenAI(config.provider);
    }

    addTool(name: string, tool: Tool): void {
        this.tools[name] = tool;
    }

    ask(prompt: Array<{ role: LLMRole; message: string }>): AsyncIterable<string> {
        const chat = this.openai.chat(this.config.model);
        const result = streamText({
            model: chat,
            messages: prompt.map((p) => {
                return {
                    role: p.role,
                    content: p.message,
                };
            }),
            tools: this.tools,
            maxSteps: 5,
        });
        return result.textStream;
    }
}
