const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { packageSource, zipFiles } = require('../../scripts/package-source');

const required = [
  'README.md',
  'package.json',
  'package-lock.json',
  '.env.example',
  'app.js',
  'server.js',
  'scripts/setup.js',
  'db/reset.js',
  'db/schema.sql',
  'db/seed/core.sql',
  'modules/messages/db/triggers.sql',
  'public/seed/film-night.svg',
];

function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'campus-source-test-'));
  const root = path.join(base, 'repo');
  fs.mkdirSync(root);
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git('init', '--template=', '--initial-branch=main');
  git('config', 'user.name', 'Source package test');
  git('config', 'user.email', 'source-test@example.invalid');
  git('config', 'core.autocrlf', 'false');
  git('config', 'commit.gpgsign', 'false');
  const write = (file, body) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
  };
  for (const file of required) write(file, `Fixture: ${file}\n`);
  write('.gitignore', '.env\nnode_modules/\n');
  const commit = () => {
    git('add', '-A');
    git('-c', 'core.hooksPath=', 'commit', '--no-verify', '-qm', 'Package fixture');
    return git('rev-parse', 'HEAD');
  };
  commit();
  return { root, out: path.join(base, 'Group_8_code.zip'), git, write, commit };
}

test('source ZIP contains the complete committed tree and a verifiable provenance manifest', (t) => {
  const f = fixture(t);
  f.write('.env', 'PRIVATE_LOCAL_VALUE=not-for-the-archive\n');
  f.write('node_modules/local-only.txt', 'not-for-the-archive');
  const result = packageSource(f);
  const archive = fs.readFileSync(f.out);
  const files = zipFiles(archive);
  assert.ok(files.includes('CampusNote/.env.example'));
  assert.ok(files.includes('CampusNote/modules/messages/db/triggers.sql'));
  assert.ok(files.includes('CampusNote/public/seed/film-night.svg'));
  assert.equal(
    files.some((file) => /(?:^|\/)(?:\.git|\.env|node_modules)(?:\/|$)/.test(file)),
    false,
  );
  assert.deepEqual(
    files,
    result.manifest.files.map((file) => `CampusNote/${file}`),
  );
  assert.equal(result.manifest.sourceCommit, f.git('rev-parse', 'HEAD'));
  assert.equal(result.manifest.sourceTree, f.git('rev-parse', 'HEAD^{tree}'));
  assert.equal(result.manifest.sha256, crypto.createHash('sha256').update(archive).digest('hex'));
  assert.deepEqual(JSON.parse(fs.readFileSync(result.manifestPath, 'utf8')), result.manifest);
});

test('source packaging refuses dirty or omitted untracked source', (t) => {
  const f = fixture(t);
  f.write('server.js', 'changed');
  assert.throws(() => packageSource(f), /uncommitted source/);
  f.git('checkout', '--', 'server.js');
  f.write('forgotten-source.js', 'new source');
  assert.throws(() => packageSource(f), /uncommitted source/);
  assert.equal(fs.existsSync(f.out), false);
});

test('source packaging refuses tracked secrets or generated assets', (t) => {
  const f = fixture(t);
  f.write('.env', 'PRIVATE_LOCAL_VALUE=never-export\n');
  f.git('add', '-f', '.env');
  f.commit();
  assert.throws(() => packageSource(f), /private\/generated tracked files.*\.env/);
  assert.equal(fs.existsSync(f.out), false);
});

test('source packaging refuses missing database inputs and export-ignored source', (t) => {
  const f = fixture(t);
  f.git('rm', 'db/seed/core.sql');
  f.commit();
  assert.throws(() => packageSource(f), /Required source files.*db\/seed\/core.sql/);
  f.write('db/seed/core.sql', 'restored seed');
  f.write('.gitattributes', 'server.js export-ignore\n');
  f.commit();
  assert.throws(() => packageSource(f), /ZIP contents differ/);
  assert.equal(fs.existsSync(f.out), false);
  assert.equal(fs.existsSync(`${f.out}.manifest.json`), false);
});

test('source packaging pins the requested commit instead of silently exporting the branch tip', (t) => {
  const f = fixture(t);
  const before = f.git('rev-parse', 'HEAD');
  f.write('later.js', 'not in the requested release');
  f.commit();
  const result = packageSource({ ...f, ref: before });
  assert.equal(result.manifest.sourceCommit, before);
  assert.equal(result.manifest.files.includes('later.js'), false);
});

test('source packaging detects export substitutions that change committed file contents', (t) => {
  const f = fixture(t);
  f.write('README.md', 'Release $Format:%H$\n');
  f.write('.gitattributes', 'README.md export-subst\n');
  f.commit();
  assert.throws(() => packageSource(f), /differ from source file bytes/);
  assert.equal(fs.existsSync(f.out), false);
  assert.equal(fs.existsSync(`${f.out}.manifest.json`), false);
});

test('source packaging refuses a nested root, in-repo output and existing artifacts', (t) => {
  const f = fixture(t);
  assert.throws(() => packageSource({ ...f, root: path.join(f.root, 'db') }), /repository root/);
  assert.throws(() => packageSource({ ...f, out: path.join(f.root, 'source.zip') }), /outside/);
  fs.writeFileSync(f.out, 'keep this archive');
  assert.throws(() => packageSource(f), /already exists/);
  assert.equal(fs.readFileSync(f.out, 'utf8'), 'keep this archive');
  fs.rmSync(f.out);
  fs.writeFileSync(`${f.out}.manifest.json`, 'keep this manifest');
  assert.throws(() => packageSource(f), /already exists/);
  assert.equal(fs.readFileSync(`${f.out}.manifest.json`, 'utf8'), 'keep this manifest');
});

test('an output-directory alias cannot bypass the outside-repository boundary', (t) => {
  const f = fixture(t);
  const alias = path.join(path.dirname(f.out), 'repo-alias');
  fs.symlinkSync(f.root, alias, 'junction');
  assert.throws(() => packageSource({ ...f, out: path.join(alias, 'source.zip') }), /outside/);
  assert.equal(fs.existsSync(path.join(f.root, 'source.zip')), false);
});
