#!/bin/bash

# Fix cookie handling in test files
# Replace headers.cookie with cookies.session

for file in tests/integration/*.test.ts tests/contract/api/*.test.ts; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Add import at the top if not already present
    if ! grep -q "extractSessionToken" "$file"; then
      # Add import after the last import line
      sed -i "/^import.*from/a import { extractSessionToken } from '../helpers/cookies';" "$file" 2>/dev/null || \
      sed -i "/^import.*from/a import { extractSessionToken } from '../../helpers/cookies';" "$file" 2>/dev/null
    fi

    # Replace .split(';')[0] with extractSessionToken()
    sed -i "s/loginRes\._getHeaders()\['set-cookie'\]\[0\]\.split(';')\[0\]/extractSessionToken(loginRes._getHeaders()['set-cookie'])!/g" "$file"
    sed -i "s/gmLoginRes\._getHeaders()\['set-cookie'\]\[0\]\.split(';')\[0\]/extractSessionToken(gmLoginRes._getHeaders()['set-cookie'])!/g" "$file"
    sed -i "s/playerLoginRes\._getHeaders()\['set-cookie'\]\[0\]\.split(';')\[0\]/extractSessionToken(playerLoginRes._getHeaders()['set-cookie'])!/g" "$file"
    sed -i "s/regRes\._getHeaders()\['set-cookie'\]\[0\]\.split(';')\[0\]/extractSessionToken(regRes._getHeaders()['set-cookie'])!/g" "$file"

  fi
done

echo "Done!"
