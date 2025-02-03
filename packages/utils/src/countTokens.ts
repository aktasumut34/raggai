import { encoding_for_model, type TiktokenModel } from 'tiktoken';

export const countTokens = (text: string, model: TiktokenModel = 'gpt-4o-mini'): number => {
    const encoding = encoding_for_model(model);
    return encoding.encode(text).length;
};
