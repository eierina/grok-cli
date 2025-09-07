/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modified for Grok API compatibility
 */

import OpenAI from 'openai';
import type {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  Part,
  GenerateContentConfig,
  Candidate,
  GenerateContentResponseUsageMetadata,
} from '@google/genai';
import { FinishReason } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import type { ContentGenerator } from './contentGenerator.js';

/**
 * Maps tool call IDs between Gemini and OpenAI formats
 */
interface ToolCallMapping {
  functionName: string;
  timestamp: number;
}

/**
 * Create a GenerateContentResponse with all required properties
 */
class GrokGenerateContentResponse implements GenerateContentResponse {
  candidates?: Candidate[];
  usageMetadata?: GenerateContentResponseUsageMetadata;
  modelVersion?: string;
  promptFeedback?: any;
  
  constructor(data: {
    candidates?: Candidate[];
    usageMetadata?: GenerateContentResponseUsageMetadata;
    modelVersion?: string;
  }) {
    this.candidates = data.candidates;
    this.usageMetadata = data.usageMetadata;
    this.modelVersion = data.modelVersion;
  }

  // Getter methods required by GenerateContentResponse
  get text(): string | undefined {
    if (!this.candidates || this.candidates.length === 0) return undefined;
    const parts = this.candidates[0].content?.parts;
    if (!parts) return undefined;
    
    return parts
      .filter(part => 'text' in part)
      .map(part => (part as any).text)
      .join('');
  }

  get data(): string | undefined {
    // For inline data parts - not used in our case
    return undefined;
  }

  get functionCalls(): any[] | undefined {
    if (!this.candidates || this.candidates.length === 0) return undefined;
    const parts = this.candidates[0].content?.parts;
    if (!parts) return undefined;
    
    return parts
      .filter(part => 'functionCall' in part)
      .map(part => (part as any).functionCall);
  }

  get executableCode(): any | undefined {
    // Not supported in Grok
    return undefined;
  }

  get codeExecutionResult(): any | undefined {
    // Not supported in Grok
    return undefined;
  }
}

/**
 * Adapter that makes Grok API (OpenAI-compatible) work with Gemini's interface
 */
export class GrokAdapter implements ContentGenerator {
  private openai: OpenAI;
  private toolCallIdMap = new Map<string, ToolCallMapping>();
  private readonly CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

  constructor(config: { 
    apiKey?: string; 
    baseURL?: string;
    httpOptions?: { headers?: Record<string, string> };
  }) {
    this.openai = new OpenAI({
      apiKey: config.apiKey || process.env['XAI_API_KEY'] || '',
      baseURL: config.baseURL || process.env['XAI_BASE_URL'] || 'https://api.x.ai/v1',
      defaultHeaders: config.httpOptions?.headers,
    });

    // Clean up expired IDs periodically
    setInterval(() => this.cleanupExpiredIds(), 5 * 60 * 1000);
  }

  /**
   * Convert Gemini role to OpenAI role
   */
  private mapGeminiRoleToOpenAI(role: string): 'user' | 'assistant' | 'system' | 'tool' {
    switch (role) {
      case 'user': return 'user';
      case 'model': return 'assistant';
      case 'function': return 'tool';
      default: return 'user';
    }
  }

  /**
   * Convert Gemini Content to OpenAI messages
   */
  private convertGeminiToOpenAI(content: Content): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    const role = this.mapGeminiRoleToOpenAI(content.role || 'user');
    const parts = content.parts || [];

    for (const part of parts) {
      if ('text' in part && part.text) {
        if (role === 'tool') {
          messages.push({
            role: 'tool',
            content: part.text,
            tool_call_id: 'unknown',
          });
        } else {
          messages.push({
            role: role as 'user' | 'assistant' | 'system',
            content: part.text,
          });
        }
      } else if ('functionCall' in part && part.functionCall) {
        const toolCallId = uuidv4();
        this.toolCallIdMap.set(toolCallId, {
          functionName: part.functionCall.name || '',
          timestamp: Date.now(),
        });

        messages.push({
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: toolCallId,
            type: 'function',
            function: {
              name: part.functionCall.name || '',
              arguments: JSON.stringify(part.functionCall.args || {}),
            },
          }],
        });
      } else if ('functionResponse' in part && part.functionResponse) {
        const toolCallId = this.findToolCallId(part.functionResponse.name || '') || 'unknown';
        messages.push({
          role: 'tool',
          content: JSON.stringify(part.functionResponse.response || {}),
          tool_call_id: toolCallId,
        });
      }
    }

    return messages;
  }

  /**
   * Convert OpenAI response to Gemini format
   */
  private convertOpenAIToGemini(
    message: OpenAI.ChatCompletionMessage,
    finishReason?: string,
  ): GrokGenerateContentResponse {
    const parts: Part[] = [];

    if (message.content) {
      parts.push({ text: message.content });
    }

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === 'function') {
          this.toolCallIdMap.set(toolCall.id, {
            functionName: toolCall.function.name,
            timestamp: Date.now(),
          });

          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments || '{}'),
            },
          });
        }
      }
    }

    // Map OpenAI finish reasons to Gemini format
    let geminiFinishReason: FinishReason | undefined;
    if (finishReason) {
      switch (finishReason) {
        case 'stop': geminiFinishReason = FinishReason.STOP; break;
        case 'length': geminiFinishReason = FinishReason.MAX_TOKENS; break;
        case 'function_call':
        case 'tool_calls': geminiFinishReason = FinishReason.STOP; break;
        case 'content_filter': geminiFinishReason = FinishReason.SAFETY; break;
        default: geminiFinishReason = FinishReason.STOP;
      }
    }

    return new GrokGenerateContentResponse({
      candidates: [{
        content: {
          role: 'model',
          parts,
        },
        finishReason: geminiFinishReason,
        index: 0,
        safetyRatings: [],
      }],
      modelVersion: 'grok-4',
    });
  }

  /**
   * Find tool call ID by function name
   */
  private findToolCallId(functionName: string): string | null {
    for (const [id, data] of this.toolCallIdMap.entries()) {
      if (data.functionName === functionName) {
        return id;
      }
    }
    return null;
  }

  /**
   * Clean up expired IDs
   */
  private cleanupExpiredIds(): void {
    const now = Date.now();
    for (const [id, data] of this.toolCallIdMap.entries()) {
      if (now - data.timestamp > this.CACHE_EXPIRY_MS) {
        this.toolCallIdMap.delete(id);
      }
    }
  }

  /**
   * Map model names
   */
  private mapModelName(geminiModel?: string): string {
    if (!geminiModel) return 'grok-4';
    
    const modelMap: Record<string, string> = {
      'gemini-2.5-pro': 'grok-4',
      'gemini-2.5-flash': 'grok-4',
      'gemini-1.5-pro': 'grok-4',
      'gemini-1.5-flash': 'grok-4',
    };

    return modelMap[geminiModel] || 'grok-4';
  }

  /**
   * Generate content (non-streaming)
   */
  async generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse> {
    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      
      // Handle system instruction if present in config
      const config = request.config as GenerateContentConfig & { 
        systemInstruction?: string | Content,
        responseJsonSchema?: Record<string, unknown>,
        responseMimeType?: string
      };
      
      if (config?.systemInstruction) {
        if (typeof config.systemInstruction === 'string') {
          messages.push({
            role: 'system',
            content: config.systemInstruction,
          });
        } else if (config.systemInstruction.parts) {
          // Handle Content type system instruction
          const systemParts = config.systemInstruction.parts
            .filter(p => 'text' in p)
            .map(p => (p as any).text)
            .join('\n');
          if (systemParts) {
            messages.push({
              role: 'system',
              content: systemParts,
            });
          }
        }
      }

      // Convert contents to messages
      if (Array.isArray(request.contents)) {
        for (const content of request.contents) {
          if (typeof content === 'object' && 'parts' in content) {
            messages.push(...this.convertGeminiToOpenAI(content as Content));
          }
        }
      }

      // Determine model
      const modelName = this.mapModelName(request.model);

      // Extract generation config
      const genConfig = request.config as GenerateContentConfig;

      // Check if JSON response is requested
      const isJsonRequest = config?.responseJsonSchema && config?.responseMimeType === 'application/json';

      if (isJsonRequest) {
        // Use function calling to get structured JSON output
        const functionName = 'generate_json_response';
        const completion = await this.openai.chat.completions.create({
          model: modelName,
          messages,
          temperature: genConfig?.temperature,
          max_tokens: genConfig?.maxOutputTokens,
          top_p: genConfig?.topP,
          stop: genConfig?.stopSequences,
          tools: [{
            type: 'function',
            function: {
              name: functionName,
              description: 'Generate a JSON response matching the required schema',
              parameters: config.responseJsonSchema as any,
            },
          }],
          tool_choice: { type: 'function', function: { name: functionName } },
        });

        // Extract JSON from function call
        if (completion.choices[0]?.message?.tool_calls?.[0]) {
          const toolCall = completion.choices[0].message.tool_calls[0];
          if (toolCall.type === 'function' && toolCall.function) {
            const jsonResponse = toolCall.function.arguments;
            // Return the JSON as text in the response
            return new GrokGenerateContentResponse({
              candidates: [{
                content: {
                  role: 'model',
                  parts: [{ text: jsonResponse }],
                },
                finishReason: FinishReason.STOP,
                index: 0,
                safetyRatings: [],
              }],
              modelVersion: 'grok-4',
              usageMetadata: completion.usage ? {
                promptTokenCount: completion.usage.prompt_tokens,
                candidatesTokenCount: completion.usage.completion_tokens,
                totalTokenCount: completion.usage.total_tokens,
              } : undefined,
            });
          }
        }
        
        throw new Error('No JSON response from Grok API');
      } else {
        // Regular content generation
        const completion = await this.openai.chat.completions.create({
          model: modelName,
          messages,
          temperature: genConfig?.temperature,
          max_tokens: genConfig?.maxOutputTokens,
          top_p: genConfig?.topP,
          stop: genConfig?.stopSequences,
        });

        // Convert response
        if (completion.choices[0]?.message) {
          const response = this.convertOpenAIToGemini(
            completion.choices[0].message,
            completion.choices[0].finish_reason || undefined
          );
          
          // Add usage metadata if available
          if (completion.usage) {
            response.usageMetadata = {
              promptTokenCount: completion.usage.prompt_tokens,
              candidatesTokenCount: completion.usage.completion_tokens,
              totalTokenCount: completion.usage.total_tokens,
            };
          }

          return response;
        }

        throw new Error('No response from Grok API');
      }
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Generate content (streaming)
   */
  async generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return this.generateContentStreamInternal(request, userPromptId);
  }

  private async *generateContentStreamInternal(
    request: GenerateContentParameters,
    userPromptId: string,
  ): AsyncGenerator<GenerateContentResponse> {
    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      
      // Handle system instruction
      const config = request.config as GenerateContentConfig & { 
        systemInstruction?: string | Content,
        responseJsonSchema?: Record<string, unknown>,
        responseMimeType?: string
      };
      
      if (config?.systemInstruction) {
        if (typeof config.systemInstruction === 'string') {
          messages.push({
            role: 'system',
            content: config.systemInstruction,
          });
        } else if (config.systemInstruction.parts) {
          const systemParts = config.systemInstruction.parts
            .filter(p => 'text' in p)
            .map(p => (p as any).text)
            .join('\n');
          if (systemParts) {
            messages.push({
              role: 'system',
              content: systemParts,
            });
          }
        }
      }

      // Convert contents
      if (Array.isArray(request.contents)) {
        for (const content of request.contents) {
          if (typeof content === 'object' && 'parts' in content) {
            messages.push(...this.convertGeminiToOpenAI(content as Content));
          }
        }
      }

      const modelName = this.mapModelName(request.model);
      const genConfig = request.config as GenerateContentConfig;

      // Check if JSON response is requested
      const isJsonRequest = config?.responseJsonSchema && config?.responseMimeType === 'application/json';

      if (isJsonRequest) {
        // For JSON requests, we can't stream - use non-streaming with function call
        const functionName = 'generate_json_response';
        const completion = await this.openai.chat.completions.create({
          model: modelName,
          messages,
          temperature: genConfig?.temperature,
          max_tokens: genConfig?.maxOutputTokens,
          top_p: genConfig?.topP,
          stop: genConfig?.stopSequences,
          tools: [{
            type: 'function',
            function: {
              name: functionName,
              description: 'Generate a JSON response matching the required schema',
              parameters: config.responseJsonSchema as any,
            },
          }],
          tool_choice: { type: 'function', function: { name: functionName } },
        });

        // Extract JSON from function call and yield as a single response
        if (completion.choices[0]?.message?.tool_calls?.[0]) {
          const toolCall = completion.choices[0].message.tool_calls[0];
          if (toolCall.type === 'function' && toolCall.function) {
            const jsonResponse = toolCall.function.arguments;
            yield new GrokGenerateContentResponse({
              candidates: [{
                content: {
                  role: 'model',
                  parts: [{ text: jsonResponse }],
                },
                finishReason: FinishReason.STOP,
                index: 0,
                safetyRatings: [],
              }],
              modelVersion: 'grok-4',
              usageMetadata: completion.usage ? {
                promptTokenCount: completion.usage.prompt_tokens,
                candidatesTokenCount: completion.usage.completion_tokens,
                totalTokenCount: completion.usage.total_tokens,
              } : undefined,
            });
            return;
          }
        }
        
        throw new Error('No JSON response from Grok API');
      }

      // Regular streaming for non-JSON requests
      const stream = await this.openai.chat.completions.create({
        model: modelName,
        messages,
        temperature: genConfig?.temperature,
        max_tokens: genConfig?.maxOutputTokens,
        top_p: genConfig?.topP,
        stop: genConfig?.stopSequences,
        stream: true,
      });

      // Process stream
      let functionCallBuffer: any = null;
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Handle text streaming
        if (delta.content) {
          yield new GrokGenerateContentResponse({
            candidates: [{
              content: {
                role: 'model',
                parts: [{ text: delta.content }],
              },
              finishReason: chunk.choices[0]?.finish_reason as any,
              index: 0,
              safetyRatings: [],
            }],
            modelVersion: 'grok-4',
          });
        }

        // Handle tool calls
        if (delta.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            if (!functionCallBuffer) {
              functionCallBuffer = {
                id: toolCall.id,
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '',
              };
            } else {
              if (toolCall.function?.arguments) {
                functionCallBuffer.arguments += toolCall.function.arguments;
              }
            }
          }
        }

        // Emit complete function call
        if (chunk.choices[0]?.finish_reason && functionCallBuffer) {
          const toolCallId = functionCallBuffer.id || uuidv4();
          this.toolCallIdMap.set(toolCallId, {
            functionName: functionCallBuffer.name,
            timestamp: Date.now(),
          });

          yield new GrokGenerateContentResponse({
            candidates: [{
              content: {
                role: 'model',
                parts: [{
                  functionCall: {
                    name: functionCallBuffer.name,
                    args: JSON.parse(functionCallBuffer.arguments || '{}'),
                  },
                }],
              },
              finishReason: chunk.choices[0].finish_reason as any,
              index: 0,
              safetyRatings: [],
            }],
            modelVersion: 'grok-4',
          });
          
          functionCallBuffer = null;
        }
      }
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Count tokens
   */
  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    // Rough approximation
    let totalChars = 0;

    if (Array.isArray(request.contents)) {
      for (const content of request.contents) {
        if (typeof content === 'object' && 'parts' in content && content.parts) {
          for (const part of content.parts) {
            if ('text' in part && part.text) {
              totalChars += part.text.length;
            }
          }
        }
      }
    }

    const estimatedTokens = Math.ceil(totalChars / 4);

    return {
      totalTokens: estimatedTokens,
    };
  }

  /**
   * Embed content (not supported)
   */
  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    throw new Error('Embeddings not supported by Grok API');
  }

  /**
   * Convert errors
   */
  private convertError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      const geminiError = new Error(error.message);
      (geminiError as any).status = error.status;
      (geminiError as any).code = error.code;
      return geminiError;
    }
    return error;
  }
}