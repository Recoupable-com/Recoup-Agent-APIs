#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/root/.bun/bin:$PATH"
cd ~/recoup-agent-apis
bun x tsc && nodemon --experimental-specifier-resolution=node --no-warnings ./dist/app.js 