import {get as getContent, getAttachments, getAttachmentStream, update as updateContent} from '/lib/xp/content';
import type {ContextUserParams} from '/lib/xp/context';
import {run as runInContext} from '/lib/xp/context';
import {get as getProject} from '/lib/xp/project';
import type {OperationRegistry} from '../utils/operations';
import {createOperationRegistry} from '../utils/operations';

import {MODES_DATA} from '../../shared/modes';
import {createAltTextInstructions} from '../../shared/prompts/altText';
import {getModelConfig} from '../google/options';
import {fieldsToSchema} from '../google/schema';
import {logDebug, LogDebugGroups, logError} from '../logger';
import {GeminiProxy} from '../proxy/gemini';
import {isObject, isString} from '../utils/objects';

export const CMS_REPO_PREFIX = 'com.enonic.cms.';
const DRAFT_BRANCH = 'draft';
const MEDIA_IMAGE_TYPE = 'media:image';
const MEDIA_VECTOR_TYPE = 'media:vector';
const DEFAULT_LANGUAGE = 'en';

type MediaImageData = {
    media?: {
        attachment?: string;
    };
    altText?: string;
};

type PreparedMedia = {
    mimeType: string;
    data: string;
};

type StreamSource = {
    openStream(): unknown;
};

let activeGenerations: OperationRegistry | null = null;

function getActiveGenerations(): OperationRegistry {
    activeGenerations = activeGenerations ?? createOperationRegistry();
    return activeGenerations;
}

export function generateAltTextForImage(repo: string, id: string, user: ContextUserParams): Optional<string> {
    return runInContext({repository: repo, branch: DRAFT_BRANCH, user}, () => {
        const operationId = `${repo}:${id}`;
        const registry = getActiveGenerations();
        if (!registry.add(operationId)) {
            logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, generation already in progress`);
            return null;
        }

        try {
            return processImage(repo, id);
        } catch (e) {
            logError(e);
            return null;
        } finally {
            registry.remove(operationId);
        }
    });
}

function processImage(repo: string, id: string): Optional<string> {
    const content = getContent({key: id});
    if (content == null || content.type !== MEDIA_IMAGE_TYPE && content.type !== MEDIA_VECTOR_TYPE) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, not an image or vector`);
        return null;
    }

    const data = content.data as MediaImageData;
    if (!isEmptyAltText(data.altText)) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, alt text present`);
        return null;
    }

    const attachmentName = data.media?.attachment;
    if (attachmentName == null) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, attachment not found`);
        return null;
    }

    const media = prepareImage(id, attachmentName);
    if (media == null) {
        return null;
    }

    const language = resolveLanguage(content.language, repo);
    const [altText, err] = generateAltText(media, language);
    if (err) {
        logDebug(LogDebugGroups.FUNC, `altText: generation failed for <${id}>`);
        logError(err);
        return null;
    }
    if (altText == null) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, generation returned no alt text`);
        return null;
    }
    logDebug(LogDebugGroups.FUNC, `altText: generation result for <${id}>: "${altText}"`);

    return updateAltText(id, altText, attachmentName) ? altText : null;
}

function prepareImage(id: string, attachmentName: string): Optional<PreparedMedia> {
    const stream = getAttachmentStream({key: id, name: attachmentName});
    if (stream == null) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, could not get attachment stream`);
        return null;
    }

    const attachments = getAttachments(id);
    const mimeType = attachments?.[attachmentName]?.mimeType ?? 'application/octet-stream';

    const downscaler = __.newBean<ImageDownscaler>('com.enonic.app.ai.contentoperator.image.ImageDownscaler');
    const prepared = downscaler.prepare((stream as unknown as StreamSource).openStream(), mimeType);
    if (!prepared) {
        logDebug(LogDebugGroups.FUNC, `altText: skipped <${id}>, could not prepare attachment`);
        return null;
    }

    return {mimeType: downscaler.getMimeType(), data: downscaler.getData()};
}

function resolveLanguage(contentLanguage: Optional<string>, repo: string): string {
    if (contentLanguage != null && contentLanguage.length > 0) {
        return contentLanguage;
    }

    try {
        const project = getProject({id: repo.substring(CMS_REPO_PREFIX.length)});
        if (project?.language != null && project.language.length > 0) {
            return project.language;
        }
    } catch (e) {
        logDebug(LogDebugGroups.FUNC, `altText: could not resolve project language for <${repo}>: ${String(e)}`);
    }

    return DEFAULT_LANGUAGE;
}

function generateAltText(media: PreparedMedia, language: string): Try<Optional<string>> {
    const [modelConfig, err] = getModelConfig('flash');
    if (err) {
        return [null, err];
    }

    const proxy = new GeminiProxy({
        ...modelConfig,
        instructions: createAltTextInstructions(language),
        modelParameters: MODES_DATA.balanced.gemini,
        messages: [{role: 'user', text: 'Write the alt text for the attached image.', media}],
        schema: fieldsToSchema({altText: {}}),
    });

    const [textResult, err2] = proxy.generate();
    if (err2) {
        return [null, err2];
    }

    return [parseAltTextResult(textResult), null];
}

export function parseAltTextResult(textResult: string): Optional<string> {
    try {
        const parsed: unknown = JSON.parse(textResult.replace(/^`+|`+$/g, ''));
        if (isObject(parsed) && isString(parsed.altText)) {
            const altText = parsed.altText.trim();
            return altText.length > 0 ? altText : null;
        }
        return null;
    } catch (_e) {
        return null;
    }
}

function isEmptyAltText(altText: Optional<string>): boolean {
    return altText == null || altText.trim().length === 0;
}

function updateAltText(id: string, altText: string, attachmentName: string): boolean {
    let updated = false;

    updateContent({
        key: id,
        requireValid: false,
        editor: (content) => {
            const data = content.data as MediaImageData;
            // ! Alt text may have been written, or the image replaced, while the model was generating
            if (!isEmptyAltText(data.altText) || data.media?.attachment !== attachmentName) {
                return content;
            }
            data.altText = altText;
            updated = true;
            return content;
        },
    });

    logDebug(
        LogDebugGroups.FUNC,
        updated ? `altText: updated <${id}>` : `altText: skipped <${id}>, content changed while generating`,
    );

    return updated;
}
