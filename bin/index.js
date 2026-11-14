#!/usr/bin/env node

// The generator uses Node's built-in TypeScript stripper to produce JavaScript
// projects. It is stable in practice but still flagged experimental, so keep the
// terminal quiet for that one warning.
const emitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  const type = typeof args[0] === 'string' ? args[0] : args[0]?.type;
  if (type === 'ExperimentalWarning') return;
  return emitWarning.call(process, warning, ...args);
};

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(
    `create-node-api-kit needs Node.js 22.13 or newer (you have ${process.versions.node}).`,
  );
  process.exit(1);
}

const { main } = await import('../src/cli.js');
await main();
