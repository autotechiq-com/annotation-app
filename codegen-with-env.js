const fs = require('fs');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
dotenv.config();
let codegenConfig = fs.readFileSync('codegen.yml', 'utf8');
codegenConfig = codegenConfig
  .replace('${HASURA_ENDPOINT}', process.env.HASURA_ENDPOINT)
  .replace('${HASURA_SECRET}', process.env.HASURA_SECRET);
fs.writeFileSync('codegen.temp.yml', codegenConfig);
execSync('graphql-codegen --config codegen.temp.yml', { stdio: 'inherit' });
fs.unlinkSync('codegen.temp.yml');
