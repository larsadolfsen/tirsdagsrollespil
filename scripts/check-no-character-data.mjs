import {spawnSync} from 'node:child_process';
import path from 'node:path';

const protectedPaths = [
  'data/character-progress.json',
  'data/character-notes',
  'data/character-status',
  'data/characters',
];

const gitCandidates = [
  process.env.GIT_BIN,
  'git',
  process.platform === 'win32' && process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'cmd', 'git.exe')
    : undefined,
].filter(Boolean);

let result;
let lastError;

for (const gitBin of gitCandidates) {
  result = spawnSync(gitBin, ['ls-files', '-z', '--', ...protectedPaths], {
    encoding: 'utf8',
  });

  if (!result.error) {
    break;
  }

  lastError = result.error;
}

if (!result || result.error) {
  console.error(`Could not run git to check protected character data: ${lastError?.message ?? 'unknown error'}`);
  process.exit(1);
}

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const trackedCharacterFiles = result.stdout.split('\0').filter(Boolean);

if (trackedCharacterFiles.length > 0) {
  console.error('Character data must not be tracked or pushed to Git.');
  console.error('');
  console.error('Protected files currently tracked:');
  for (const file of trackedCharacterFiles) {
    console.error(`  - ${file}`);
  }
  console.error('');
  console.error('Remove them from Git tracking with:');
  console.error('  git rm --cached <file>');
  console.error('');
  console.error('The local files can remain on disk; .gitignore will keep future saves private.');
  process.exit(1);
}
