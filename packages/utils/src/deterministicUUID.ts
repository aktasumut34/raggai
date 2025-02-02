import { createHash } from 'crypto';
import { v5 as uuidv5, UUIDTypes } from 'uuid';

export const deterministicUUID = (content: string | number[]): string => {
    let contentBytes: Buffer;
    if (typeof content === 'string') {
        contentBytes = Buffer.from(content, 'utf-8');
    } else {
        contentBytes = Buffer.from(content);
    }
    const hash = createHash('sha256');
    hash.update(contentBytes);
    const namespace: UUIDTypes = '00000000-0000-0000-0000-000000000000';
    const digest = hash.digest('hex');
    return uuidv5(digest, namespace);
};
