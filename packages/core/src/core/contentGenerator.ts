/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
} from '@google/genai';
import type { Config } from '../config/config.js';

import type { UserTierId } from '../code_assist/types.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { GrokAdapter } from './grokAdapter.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}

export enum AuthType {
  USE_GROK = 'grok-api',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
  proxy?: string | undefined;
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
): ContentGeneratorConfig {
  const xaiApiKey = process.env['XAI_API_KEY'] || undefined;

  // Use the model from config
  const effectiveModel = config.getModel();

  const contentGeneratorConfig: ContentGeneratorConfig = {
    model: effectiveModel,
    authType: AuthType.USE_GROK,
    proxy: config?.getProxy(),
  };

  if (xaiApiKey) {
    contentGeneratorConfig.apiKey = xaiApiKey;
    contentGeneratorConfig.vertexai = false;
    return contentGeneratorConfig;
  }

  return contentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const version = process.env['CLI_VERSION'] || process.version;
  const userAgent = `GrokCLI/${version} (${process.platform}; ${process.arch})`;
  const baseHeaders: Record<string, string> = {
    'User-Agent': userAgent,
  };

  const httpOptions = { headers: baseHeaders };
  const grokAdapter = new GrokAdapter({
    apiKey: config.apiKey || process.env['XAI_API_KEY'],
    baseURL: process.env['XAI_BASE_URL'] || 'https://api.x.ai/v1',
    httpOptions,
  });
  return new LoggingContentGenerator(grokAdapter, gcConfig);
}
