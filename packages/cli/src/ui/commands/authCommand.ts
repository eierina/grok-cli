/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageActionReturn, SlashCommand } from './types.js';
import { CommandKind } from './types.js';

export const authCommand: SlashCommand = {
  name: 'auth',
  description: 'show authentication info (Grok CLI uses XAI_API_KEY)',
  kind: CommandKind.BUILT_IN,
  action: (_context, _args): MessageActionReturn => ({
    type: 'message',
    messageType: 'info',
    content: 'Grok CLI uses XAI_API_KEY environment variable for authentication. No other authentication methods are supported.',
  }),
};
