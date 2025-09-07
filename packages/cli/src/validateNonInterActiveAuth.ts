/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config } from 'grok-cli-core';
import { AuthType } from 'grok-cli-core';
import { validateAuthMethod } from './config/auth.js';

function getAuthTypeFromEnv(): AuthType | undefined {
  if (process.env['XAI_API_KEY']) {
    return AuthType.USE_GROK;
  }
  return undefined;
}

export async function validateNonInteractiveAuth(
  configuredAuthType: AuthType | undefined,
  useExternalAuth: boolean | undefined,
  nonInteractiveConfig: Config,
) {
  const effectiveAuthType = configuredAuthType || getAuthTypeFromEnv();

  if (!effectiveAuthType) {
    console.error(
      `Please set the XAI_API_KEY environment variable before running grok-cli.`,
    );
    process.exit(1);
  }

  if (!useExternalAuth) {
    const err = validateAuthMethod(effectiveAuthType);
    if (err != null) {
      console.error(err);
      process.exit(1);
    }
  }

  await nonInteractiveConfig.refreshAuth(effectiveAuthType);
  return nonInteractiveConfig;
}
