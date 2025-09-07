/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import type { LoadedSettings } from '../../config/settings.js';
import { SettingScope } from '../../config/settings.js';
import { AuthType } from 'grok-cli-core';
import { validateAuthMethod } from '../../config/auth.js';
import { useKeypress } from '../hooks/useKeypress.js';

interface AuthDialogProps {
  onSelect: (authMethod: AuthType | undefined, scope: SettingScope) => void;
  settings: LoadedSettings;
  initialErrorMessage?: string | null;
}


export function AuthDialog({
  onSelect,
  settings,
  initialErrorMessage,
}: AuthDialogProps): React.JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (initialErrorMessage) {
      return initialErrorMessage;
    }

    if (process.env['GROK_API_KEY']) {
      return 'Existing Grok API key detected (GROK_API_KEY). The Grok API authentication will be used.';
    }
    
    return null;
  });
  const items = [
    {
      label: 'Use Grok API (xAI)',
      value: AuthType.USE_GROK,
    },
  ];

  const initialAuthIndex = 0; // Default to the only option: USE_GROK

  const handleAuthSelect = (authMethod: AuthType) => {
    const error = validateAuthMethod(authMethod);
    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage(null);
      onSelect(authMethod, SettingScope.User);
    }
  };

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        // Prevent exit if there is an error message.
        // This means they user is not authenticated yet.
        if (errorMessage) {
          return;
        }
        if (settings.merged.security?.auth?.selectedType === undefined) {
          // Prevent exiting if no auth method is set
          setErrorMessage(
            'You must select an auth method to proceed. Press Ctrl+C twice to exit.',
          );
          return;
        }
        onSelect(undefined, SettingScope.User);
      }
    },
    { isActive: true },
  );

  return (
    <Box
      borderStyle="round"
      borderColor={Colors.Gray}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>Get started</Text>
      <Box marginTop={1}>
        <Text>How would you like to authenticate for this project?</Text>
      </Box>
      <Box marginTop={1}>
        <RadioButtonSelect
          items={items}
          initialIndex={initialAuthIndex}
          onSelect={handleAuthSelect}
        />
      </Box>
      {errorMessage && (
        <Box marginTop={1}>
          <Text color={Colors.AccentRed}>{errorMessage}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={Colors.Gray}>(Use Enter to select)</Text>
      </Box>
      <Box marginTop={1}>
        <Text>Terms of Service and Privacy Notice</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={Colors.AccentBlue}>
          Please see xAI's Terms of Service and Privacy Policy
        </Text>
      </Box>
    </Box>
  );
}
