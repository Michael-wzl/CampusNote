// Export an immutable, clean source snapshot for the marker; Git is only needed by the packager.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');

const REQUIRED = [
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

function git(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  if (result.error) throw new Error(`Git is required to package source: ${result.error.message}`);
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Git command failed');
  return result.stdout;
}

// Read the central directory, not local headers (Git ZIPs can use data descriptors).
function zipEntries(buffer) {
  let end = buffer.length - 22;
  const min = Math.max(0, buffer.length - 65557);
  while (end >= min && buffer.readUInt32LE(end) !== 0x06054b50) end -= 1;
  if (end < min) throw new Error('Invalid source ZIP: no central directory');
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  if (count === 65535 || offset === 0xffffffff)
    throw new Error('Source ZIP is too large for this packaging check');
  const files = [];
  for (let i = 0; i < count; i += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50)
      throw new Error('Invalid source ZIP central directory');
    const length = buffer.readUInt16LE(offset + 28);
    const extra = buffer.readUInt16LE(offset + 30);
    const comment = buffer.readUInt16LE(offset + 32);
    const next = offset + 46 + length + extra + comment;
    if (next > buffer.length) throw new Error('Truncated source ZIP');
    const name = buffer.subarray(offset + 46, offset + 46 + length).toString('utf8');
    if (!name.endsWith('/')) {
      const method = buffer.readUInt16LE(offset + 10);
      const compressedSize = buffer.readUInt32LE(offset + 20);
      const size = buffer.readUInt32LE(offset + 24);
      const local = buffer.readUInt32LE(offset + 42);
      if (local + 30 > buffer.length || buffer.readUInt32LE(local) !== 0x04034b50)
        throw new Error('Invalid source ZIP file header');
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      if (start + compressedSize > buffer.length) throw new Error('Truncated source ZIP file');
      const compressed = buffer.subarray(start, start + compressedSize);
      const data =
        method === 0
          ? compressed
          : method === 8
            ? zlib.inflateRawSync(compressed, { maxOutputLength: Math.max(size, 1) })
            : null;
      if (!data || data.length !== size) throw new Error('Invalid source ZIP file data');
      files.push({ name, data });
    }
    offset = next;
  }
  return files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

const zipFiles = (buffer) => zipEntries(buffer).map((entry) => entry.name);

function isPrivate(file) {
  const parts = file.split('/');
  return (
    parts.some((part) =>
      ['.git', 'node_modules', 'uploads', 'AI_work', 'coverage'].includes(part),
    ) ||
    parts.some(
      (part) => part === '.env' || (part.startsWith('.env.') && part !== '.env.example'),
    ) ||
    file.startsWith('docs/reference/triple-uni-screenshots/')
  );
}

function packageSource({ root = path.join(__dirname, '..'), ref = 'HEAD', out } = {}) {
  root = fs.realpathSync(path.resolve(root));
  if (fs.realpathSync(git(root, ['rev-parse', '--show-toplevel']).trim()) !== root)
    throw new Error('Run source packaging from the repository root');
  if (git(root, ['status', '--porcelain=v1', '--untracked-files=all']).trim())
    throw new Error('Commit or remove uncommitted source changes before packaging');
  const commit = git(root, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).trim();
  const tree = git(root, ['rev-parse', `${commit}^{tree}`]).trim();
  const entries = git(root, ['ls-tree', '-rz', '--full-tree', commit])
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const tab = entry.indexOf('\t');
      return {
        mode: entry.slice(0, 6),
        oid: entry.slice(0, tab).split(' ')[2],
        file: entry.slice(tab + 1),
      };
    });
  if (entries.some((entry) => !['100644', '100755'].includes(entry.mode)))
    throw new Error('Source must be self-contained regular files, without submodules or symlinks');
  const files = entries.map((entry) => entry.file).sort();
  const forbidden = files.filter(isPrivate);
  if (forbidden.length)
    throw new Error(`Remove private/generated tracked files: ${forbidden.join(', ')}`);
  const missing = REQUIRED.filter((file) => !files.includes(file));
  if (missing.length) throw new Error(`Required source files are missing: ${missing.join(', ')}`);

  out = path.resolve(root, out || '../Group_8_code.zip');
  out = path.join(fs.realpathSync(path.dirname(out)), path.basename(out));
  const relative = path.relative(root, out);
  if (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
    throw new Error('Write the source ZIP outside the repository');
  if (path.extname(out).toLowerCase() !== '.zip') throw new Error('Output must end in .zip');
  const manifestPath = `${out}.manifest.json`;
  if (fs.existsSync(out) || fs.existsSync(manifestPath))
    throw new Error(
      'Output already exists; choose a new path or archive the previous package first',
    );

  let created = false;
  let manifestCreated = false;
  try {
    const fd = fs.openSync(out, 'wx');
    created = true;
    let result;
    try {
      result = spawnSync(
        'git',
        ['-C', root, 'archive', '--format=zip', '--prefix=CampusNote/', commit],
        {
          stdio: ['ignore', fd, 'pipe'],
          encoding: 'utf8',
        },
      );
    } finally {
      fs.closeSync(fd);
    }
    if (result.error || result.status !== 0)
      throw new Error(result.error?.message || result.stderr.trim() || 'Source export failed');
    const archive = fs.readFileSync(out);
    const archived = zipEntries(archive);
    const actual = archived.map((entry) => entry.name);
    const expected = files.map((file) => `CampusNote/${file}`);
    if (actual.length !== expected.length || actual.some((file, i) => file !== expected[i]))
      throw new Error('ZIP contents differ from the source tree; check Git export attributes');
    const source = new Map(entries.map((entry) => [`CampusNote/${entry.file}`, entry.oid]));
    for (const entry of archived) {
      const oid = source.get(entry.name);
      const hash = crypto.createHash(oid.length === 64 ? 'sha256' : 'sha1');
      hash.update(`blob ${entry.data.length}\0`);
      hash.update(entry.data);
      if (hash.digest('hex') !== oid)
        throw new Error('ZIP contents differ from source file bytes; check Git export attributes');
    }
    const manifest = {
      schemaVersion: 1,
      project: 'CampusNote',
      sourceCommit: commit,
      sourceTree: tree,
      archive: path.basename(out),
      sha256: crypto.createHash('sha256').update(archive).digest('hex'),
      files,
    };
    const manifestFd = fs.openSync(manifestPath, 'wx');
    manifestCreated = true;
    try {
      fs.writeFileSync(manifestFd, `${JSON.stringify(manifest, null, 2)}\n`);
    } finally {
      fs.closeSync(manifestFd);
    }
    return { out, manifestPath, manifest };
  } catch (err) {
    if (created) fs.rmSync(out, { force: true });
    if (manifestCreated) fs.rmSync(manifestPath, { force: true });
    throw err;
  }
}

function main(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i];
    if (!['--ref', '--out'].includes(name) || !args[i + 1])
      throw new Error(
        'Usage: npm run package:source -- [--ref COMMIT_OR_TAG] [--out OUTSIDE_REPO.zip]',
      );
    options[name.slice(2)] = args[i + 1];
  }
  const { out, manifestPath, manifest } = packageSource(options);
  console.log(
    `Source ZIP: ${out}\nManifest: ${manifestPath}\nCommit: ${manifest.sourceCommit}\nSHA-256: ${manifest.sha256}`,
  );
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(`Source packaging failed: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { packageSource, zipFiles };
