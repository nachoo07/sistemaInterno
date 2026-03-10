const requiredMajor = 20;
const currentVersion = process.versions.node;
const currentMajor = Number.parseInt(currentVersion.split('.')[0], 10);

if (currentMajor !== requiredMajor) {
  console.error(
    [
      `Unsupported Node.js version: ${currentVersion}.`,
      `Backend requires Node ${requiredMajor}.x as declared in Backend/package.json.`,
      'Run `nvm use 20` before `npm run dev` or `npm start`.'
    ].join('\n')
  );

  process.exit(1);
}
