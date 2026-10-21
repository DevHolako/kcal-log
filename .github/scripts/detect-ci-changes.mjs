import fs from 'node:fs';
import { execSync } from 'node:child_process';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function setOutput(key, value) {
  console.log(`[CI Matrix] Output: ${key}=${value}`);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

const eventName = process.env.GITHUB_EVENT_NAME || 'push';
const ref = process.env.GITHUB_REF || '';
const refType = process.env.GITHUB_REF_TYPE || '';
const isTag = ref.startsWith('refs/tags/v') || (refType === 'tag' && ref.startsWith('v'));
const tagName = isTag ? ref.replace(/^refs\/tags\//, '') : '';
const isMainBranch = ref === 'refs/heads/main';

const forceBuildApk = process.env.INPUT_FORCE_BUILD_APK === 'true';
const forceDeployWeb = process.env.INPUT_FORCE_DEPLOY_WEB === 'true';
const inputReleaseTag = (process.env.INPUT_RELEASE_TAG || '').trim();

console.log('[CI Matrix] Context:', {
  eventName,
  ref,
  refType,
  isTag,
  tagName,
  isMainBranch,
  forceBuildApk,
  forceDeployWeb,
  inputReleaseTag
});

// Resolve current mobile app version
let currentVersion = '0.1.0';
let currentVersionCode = 1;
try {
  const currentAppJson = JSON.parse(fs.readFileSync('apps/mobile/app.json', 'utf8'));
  currentVersion = currentAppJson.expo?.version || '0.1.0';
  currentVersionCode = currentAppJson.expo?.android?.versionCode || 1;
} catch (e) {
  console.warn('[CI Matrix] Warning reading current app.json:', e);
}

// Resolve base commit for diffing
let baseCommit = '';
if (eventName === 'pull_request') {
  const baseRef = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main';
  baseCommit = run(`git merge-base HEAD ${baseRef}`) || run(`git rev-parse ${baseRef}`) || 'HEAD~1';
} else if (eventName === 'push') {
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    try {
      const eventData = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
      if (eventData.before && eventData.before !== '0000000000000000000000000000000000000000') {
        const verify = run(`git rev-parse --verify ${eventData.before}`);
        if (verify) {
          baseCommit = eventData.before;
        }
      }
    } catch {}
  }
  if (!baseCommit) {
    baseCommit = run('git rev-parse --verify HEAD~1') || '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
  }
} else {
  baseCommit = run('git rev-parse --verify HEAD~1') || '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
}

console.log('[CI Matrix] Base commit for diff:', baseCommit);

// Inspect changed files
const diffOutput = run(`git diff --name-only ${baseCommit} HEAD`) || '';
const changedFiles = diffOutput.split('\n').map((s) => s.trim()).filter(Boolean);
console.log(`[CI Matrix] ${changedFiles.length} files changed against base.`);

const webPatterns = [
  /^apps\/web\//,
  /^packages\//,
  /^docker\//,
  /^Dockerfile/,
  /^docker-compose\.ya?ml/,
  /^\.github\/workflows\/ci\.ya?ml/,
  /^package\.json/,
  /^pnpm-lock\.yaml/
];

const webChanged = isTag ? false : (changedFiles.some((f) => webPatterns.some((p) => p.test(f))) || forceDeployWeb);

// Inspect if mobile version was bumped
let mobileVersionBumped = false;
if (!isTag && changedFiles.includes('apps/mobile/app.json')) {
  const baseAppJsonRaw = run(`git show ${baseCommit}:apps/mobile/app.json`);
  if (baseAppJsonRaw) {
    try {
      const baseAppJson = JSON.parse(baseAppJsonRaw);
      const baseVersion = baseAppJson.expo?.version;
      const baseVersionCode = baseAppJson.expo?.android?.versionCode;
      if (currentVersion !== baseVersion || currentVersionCode !== baseVersionCode) {
        mobileVersionBumped = true;
        console.log(`[CI Matrix] Mobile version bumped: ${baseVersion} (code: ${baseVersionCode}) -> ${currentVersion} (code: ${currentVersionCode})`);
      }
    } catch {}
  } else {
    mobileVersionBumped = true;
  }
}

// Compute target tag for APK release
let releaseTag = '';
if (isTag) {
  releaseTag = tagName;
} else if (inputReleaseTag) {
  releaseTag = inputReleaseTag;
} else {
  releaseTag = currentVersion.startsWith('v') ? currentVersion : `v${currentVersion}`;
}

const shouldBuildApk = isTag || (isMainBranch && mobileVersionBumped) || forceBuildApk;
const shouldDeployWeb = (isMainBranch && eventName === 'push' && webChanged) || forceDeployWeb;

console.log('[CI Matrix] Decisions:', {
  web_changed: webChanged,
  mobile_version_bumped: mobileVersionBumped,
  is_tag: isTag,
  release_tag: releaseTag,
  should_build_apk: shouldBuildApk,
  should_deploy_web: shouldDeployWeb
});

setOutput('web_changed', String(webChanged));
setOutput('mobile_version_bumped', String(mobileVersionBumped));
setOutput('is_tag', String(isTag));
setOutput('release_tag', releaseTag);
setOutput('should_build_apk', String(shouldBuildApk));
setOutput('should_deploy_web', String(shouldDeployWeb));
