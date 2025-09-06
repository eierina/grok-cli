/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Defines valid event metadata keys for Clearcut logging.
export enum EventMetadataKey {
  GROK_CLI_KEY_UNKNOWN = 0,

  // ==========================================================================
  // Start Session Event Keys
  // ===========================================================================

  // Logs the model id used in the session.
  GROK_CLI_START_SESSION_MODEL = 1,

  // Logs the embedding model id used in the session.
  GROK_CLI_START_SESSION_EMBEDDING_MODEL = 2,

  // Logs the sandbox that was used in the session.
  GROK_CLI_START_SESSION_SANDBOX = 3,

  // Logs the core tools that were enabled in the session.
  GROK_CLI_START_SESSION_CORE_TOOLS = 4,

  // Logs the approval mode that was used in the session.
  GROK_CLI_START_SESSION_APPROVAL_MODE = 5,

  // Logs whether an API key was used in the session.
  GROK_CLI_START_SESSION_API_KEY_ENABLED = 6,

  // Logs whether the Vertex API was used in the session.
  GROK_CLI_START_SESSION_VERTEX_API_ENABLED = 7,

  // Logs whether debug mode was enabled in the session.
  GROK_CLI_START_SESSION_DEBUG_MODE_ENABLED = 8,

  // Logs the MCP servers that were enabled in the session.
  GROK_CLI_START_SESSION_MCP_SERVERS = 9,

  // Logs whether user-collected telemetry was enabled in the session.
  GROK_CLI_START_SESSION_TELEMETRY_ENABLED = 10,

  // Logs whether prompt collection was enabled for user-collected telemetry.
  GROK_CLI_START_SESSION_TELEMETRY_LOG_USER_PROMPTS_ENABLED = 11,

  // Logs whether the session was configured to respect gitignore files.
  GROK_CLI_START_SESSION_RESPECT_GITIGNORE = 12,

  // ==========================================================================
  // User Prompt Event Keys
  // ===========================================================================

  // Logs the length of the prompt.
  GROK_CLI_USER_PROMPT_LENGTH = 13,

  // ==========================================================================
  // Tool Call Event Keys
  // ===========================================================================

  // Logs the function name.
  GROK_CLI_TOOL_CALL_NAME = 14,

  // Logs the user's decision about how to handle the tool call.
  GROK_CLI_TOOL_CALL_DECISION = 15,

  // Logs whether the tool call succeeded.
  GROK_CLI_TOOL_CALL_SUCCESS = 16,

  // Logs the tool call duration in milliseconds.
  GROK_CLI_TOOL_CALL_DURATION_MS = 17,

  // Logs the tool call error message, if any.
  GROK_CLI_TOOL_ERROR_MESSAGE = 18,

  // Logs the tool call error type, if any.
  GROK_CLI_TOOL_CALL_ERROR_TYPE = 19,

  // ==========================================================================
  // GenAI API Request Event Keys
  // ===========================================================================

  // Logs the model id of the request.
  GROK_CLI_API_REQUEST_MODEL = 20,

  // ==========================================================================
  // GenAI API Response Event Keys
  // ===========================================================================

  // Logs the model id of the API call.
  GROK_CLI_API_RESPONSE_MODEL = 21,

  // Logs the status code of the response.
  GROK_CLI_API_RESPONSE_STATUS_CODE = 22,

  // Logs the duration of the API call in milliseconds.
  GROK_CLI_API_RESPONSE_DURATION_MS = 23,

  // Logs the error message of the API call, if any.
  GROK_CLI_API_ERROR_MESSAGE = 24,

  // Logs the input token count of the API call.
  GROK_CLI_API_RESPONSE_INPUT_TOKEN_COUNT = 25,

  // Logs the output token count of the API call.
  GROK_CLI_API_RESPONSE_OUTPUT_TOKEN_COUNT = 26,

  // Logs the cached token count of the API call.
  GROK_CLI_API_RESPONSE_CACHED_TOKEN_COUNT = 27,

  // Logs the thinking token count of the API call.
  GROK_CLI_API_RESPONSE_THINKING_TOKEN_COUNT = 28,

  // Logs the tool use token count of the API call.
  GROK_CLI_API_RESPONSE_TOOL_TOKEN_COUNT = 29,

  // ==========================================================================
  // GenAI API Error Event Keys
  // ===========================================================================

  // Logs the model id of the API call.
  GROK_CLI_API_ERROR_MODEL = 30,

  // Logs the error type.
  GROK_CLI_API_ERROR_TYPE = 31,

  // Logs the status code of the error response.
  GROK_CLI_API_ERROR_STATUS_CODE = 32,

  // Logs the duration of the API call in milliseconds.
  GROK_CLI_API_ERROR_DURATION_MS = 33,

  // ==========================================================================
  // End Session Event Keys
  // ===========================================================================

  // Logs the end of a session.
  GROK_CLI_END_SESSION_ID = 34,

  // ==========================================================================
  // Shared Keys
  // ===========================================================================

  // Logs the Prompt Id
  GROK_CLI_PROMPT_ID = 35,

  // Logs the Auth type for the prompt, api responses and errors.
  GROK_CLI_AUTH_TYPE = 36,

  // Logs the total number of Google accounts ever used.
  GROK_CLI_GOOGLE_ACCOUNTS_COUNT = 37,

  // Logs the Surface from where the Gemini CLI was invoked, eg: VSCode.
  GROK_CLI_SURFACE = 39,

  // Logs the session id
  GROK_CLI_SESSION_ID = 40,

  // Logs the Gemini CLI version
  GROK_CLI_VERSION = 54,

  // Logs the Gemini CLI Git commit hash
  GROK_CLI_GIT_COMMIT_HASH = 55,

  // Logs the Gemini CLI OS
  GROK_CLI_OS = 82,

  // ==========================================================================
  // Loop Detected Event Keys
  // ===========================================================================

  // Logs the type of loop detected.
  GROK_CLI_LOOP_DETECTED_TYPE = 38,

  // ==========================================================================
  // Slash Command Event Keys
  // ===========================================================================

  // Logs the name of the slash command.
  GROK_CLI_SLASH_COMMAND_NAME = 41,

  // Logs the subcommand of the slash command.
  GROK_CLI_SLASH_COMMAND_SUBCOMMAND = 42,

  // Logs the status of the slash command (e.g. 'success', 'error')
  GROK_CLI_SLASH_COMMAND_STATUS = 51,

  // ==========================================================================
  // Next Speaker Check Event Keys
  // ===========================================================================

  // Logs the finish reason of the previous streamGenerateContent response
  GROK_CLI_RESPONSE_FINISH_REASON = 43,

  // Logs the result of the next speaker check
  GROK_CLI_NEXT_SPEAKER_CHECK_RESULT = 44,

  // ==========================================================================
  // Malformed JSON Response Event Keys
  // ==========================================================================

  // Logs the model that produced the malformed JSON response.
  GROK_CLI_MALFORMED_JSON_RESPONSE_MODEL = 45,

  // ==========================================================================
  // IDE Connection Event Keys
  // ===========================================================================

  // Logs the type of the IDE connection.
  GROK_CLI_IDE_CONNECTION_TYPE = 46,

  // Logs AI added lines in edit/write tool response.
  GROK_CLI_AI_ADDED_LINES = 47,

  // Logs AI removed lines in edit/write tool response.
  GROK_CLI_AI_REMOVED_LINES = 48,

  // Logs user added lines in edit/write tool response.
  GROK_CLI_USER_ADDED_LINES = 49,

  // Logs user removed lines in edit/write tool response.
  GROK_CLI_USER_REMOVED_LINES = 50,

  // ==========================================================================
  // Kitty Sequence Overflow Event Keys
  // ===========================================================================

  // Logs the truncated kitty sequence.
  GROK_CLI_KITTY_TRUNCATED_SEQUENCE = 52,

  // Logs the length of the kitty sequence that overflowed.
  GROK_CLI_KITTY_SEQUENCE_LENGTH = 53,

  // ==========================================================================
  // Conversation Finished Event Keys
  // ===========================================================================

  // Logs the approval mode of the session.
  GROK_CLI_APPROVAL_MODE = 58,

  // Logs the number of turns
  GROK_CLI_CONVERSATION_TURN_COUNT = 59,

  // Logs the number of tokens before context window compression.
  GROK_CLI_COMPRESSION_TOKENS_BEFORE = 60,

  // Logs the number of tokens after context window compression.
  GROK_CLI_COMPRESSION_TOKENS_AFTER = 61,

  // Logs tool type whether it is mcp or native.
  GROK_CLI_TOOL_TYPE = 62,

  // Logs count of MCP servers in Start Session Event
  GROK_CLI_START_SESSION_MCP_SERVERS_COUNT = 63,

  // Logs count of MCP tools in Start Session Event
  GROK_CLI_START_SESSION_MCP_TOOLS_COUNT = 64,

  // Logs name of MCP tools as comma separated string
  GROK_CLI_START_SESSION_MCP_TOOLS = 65,

  // ==========================================================================
  // Research Event Keys
  // ===========================================================================

  // Logs the research opt-in status (true/false)
  GROK_CLI_RESEARCH_OPT_IN_STATUS = 66,

  // Logs the contact email for research participation
  GROK_CLI_RESEARCH_CONTACT_EMAIL = 67,

  // Logs the user ID for research events
  GROK_CLI_RESEARCH_USER_ID = 68,

  // Logs the type of research feedback
  GROK_CLI_RESEARCH_FEEDBACK_TYPE = 69,

  // Logs the content of research feedback
  GROK_CLI_RESEARCH_FEEDBACK_CONTENT = 70,

  // Logs survey responses for research feedback (JSON stringified)
  GROK_CLI_RESEARCH_SURVEY_RESPONSES = 71,

  // ==========================================================================
  // File Operation Event Keys
  // ===========================================================================

  // Logs the programming language of the project.
  GROK_CLI_PROGRAMMING_LANGUAGE = 56,

  // Logs the operation type of the file operation.
  GROK_CLI_FILE_OPERATION_TYPE = 57,

  // Logs the number of lines in the file operation.
  GROK_CLI_FILE_OPERATION_LINES = 72,

  // Logs the mimetype of the file in the file operation.
  GROK_CLI_FILE_OPERATION_MIMETYPE = 73,

  // Logs the extension of the file in the file operation.
  GROK_CLI_FILE_OPERATION_EXTENSION = 74,

  // ==========================================================================
  // Content Streaming Event Keys
  // ===========================================================================

  // Logs the error message for an invalid chunk.
  GROK_CLI_INVALID_CHUNK_ERROR_MESSAGE = 75,

  // Logs the attempt number for a content retry.
  GROK_CLI_CONTENT_RETRY_ATTEMPT_NUMBER = 76,

  // Logs the error type for a content retry.
  GROK_CLI_CONTENT_RETRY_ERROR_TYPE = 77,

  // Logs the delay in milliseconds for a content retry.
  GROK_CLI_CONTENT_RETRY_DELAY_MS = 78,

  // Logs the total number of attempts for a content retry failure.
  GROK_CLI_CONTENT_RETRY_FAILURE_TOTAL_ATTEMPTS = 79,

  // Logs the final error type for a content retry failure.
  GROK_CLI_CONTENT_RETRY_FAILURE_FINAL_ERROR_TYPE = 80,

  // Logs the total duration in milliseconds for a content retry failure.
  GROK_CLI_CONTENT_RETRY_FAILURE_TOTAL_DURATION_MS = 81,
}
