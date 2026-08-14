const { execFileSync } = require('child_process');
const path = require('path');
const packageJson = require('../package.json');

const repositoryRoot = path.join(__dirname, '..');
const FOUR_PART_VERSION = /^v?(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
const NPM_FALLBACK_VERSION = /^(\d+)\.(\d+)\.(\d+)(?:[+-](\d+))?$/;

function normalizeVersion(value) {
  const candidate = String(value || '').trim();
  const fourPartMatch = candidate.match(FOUR_PART_VERSION);
  if (fourPartMatch) return fourPartMatch.slice(1).join('.');

  // npm requires SemVer, so 1.1.0.3 is represented there as 1.1.0+3.
  const npmMatch = candidate.match(NPM_FALLBACK_VERSION);
  if (npmMatch) return [...npmMatch.slice(1, 4), npmMatch[4] || '0'].join('.');

  return null;
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 2000
  }).trim();
}

function resolveAppVersion({
  env = process.env,
  git = runGit,
  packageVersion = packageJson.version
} = {}) {
  const configuredVersion = normalizeVersion(env.APP_VERSION);
  if (configuredVersion) return configuredVersion;

  if (env.GITHUB_REF_TYPE === 'tag') {
    const workflowTag = normalizeVersion(env.GITHUB_REF_NAME);
    if (workflowTag) return workflowTag;
  }

  try {
    const exactTag = normalizeVersion(git([
      'describe', '--tags', '--exact-match',
      '--match', '[0-9]*.[0-9]*.[0-9]*.[0-9]*'
    ]));
    if (exactTag) return exactTag;
  } catch {
    // An untagged commit is expected during development.
  }

  try {
    const latestTag = normalizeVersion(git([
      'describe', '--tags', '--abbrev=0',
      '--match', '[0-9]*.[0-9]*.[0-9]*.[0-9]*'
    ]));
    if (latestTag) {
      const parts = latestTag.split('.').map(Number);
      parts[3] += 1;
      return parts.join('.');
    }
  } catch {
    // Production archives may not contain Git metadata.
  }

  return normalizeVersion(packageVersion) || '0.0.0.0';
}

const APP_VERSION = resolveAppVersion();

module.exports = { APP_VERSION, normalizeVersion, resolveAppVersion };
