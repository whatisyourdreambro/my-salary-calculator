// Pin the reviewed local patch, not merely its package version. No network access.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const TARBALL = 'braces-3.0.3-moneysalary.1.tgz';
const INTEGRITY = 'sha512-n+BhH9zDit5UzfhUx8Qby5ZA1016g3Z+COA4xJoz0b1Wylc7QTTbKRoC06qUdof+R75fe3e24df7wELNVHfpMQ==';
const VERSION = '3.0.3-moneysalary.1';
const HASHES = {
  "LICENSE": "35bdd8a44339719441900fb50fbefc5e2dca1ca662cbaed7a687de842c8b70f2",
  "SECURITY-PATCH.json": "26e04786fa3ed27550990ffb465ee09639df32d340bca47290a6c26087200b7a",
  "index.js": "332ea07c7b006361aad12aa994ca75dc1db8e8382b884909e2f38f10b85c88a4",
  "lib/compile.js": "feb9ea99f3779f2b1a17fa281335f04edfdd872c3a3ecb0649a5087a637d0379",
  "lib/constants.js": "c355cf54c07a89fd204eb08b747e27227e9a3522155885b45692455d9ac75f50",
  "lib/expand.js": "3da0ec6f9bcaa2420c2cf103d821da54f916c185b934e8833656294ad50e2f41",
  "lib/parse.js": "0615a0b5b23bb4a3c5f20717fb5ebda13d2b548322223edc6001e1dc3034d5ce",
  "lib/stringify.js": "59736c6b7603223b67a96a70f459d909404fb01c981107cdb98e0085cbc2da63",
  "lib/utils.js": "b5a7596aa67730412b3c029ef09e84e6b67b8e445cffd35d1d295549c89066c7",
  "package.json": "c243c082f7a5147927e3ca85dc67fbd8542fabe64d1609b1309a6b6c5f863173"
};

const hash = buffer => createHash('sha256').update(buffer).digest('hex');
function verifyDirectory(directory) {
  const names = readdirSync(directory, { recursive: true }).filter(file => statSync(path.join(directory, file)).isFile()).map(file => file.replaceAll('\\', '/')).sort();
  assert.deepEqual(names, Object.keys(HASHES).sort(), 'Unexpected or missing files in ' + directory);
  for (const [file, expected] of Object.entries(HASHES)) {
    assert.equal(hash(readFileSync(path.join(directory, file))), expected, 'Source mismatch: ' + path.join(directory, file));
  }
}
function verifyTar(buffer) {
  assert.equal('sha512-' + createHash('sha512').update(buffer).digest('base64'), INTEGRITY, 'Tarball integrity mismatch');
  const tar = gunzipSync(buffer, { maxOutputLength: 1024 * 1024 });
  const names = [];
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').split('\0')[0];
    const size = Number.parseInt(header.subarray(124, 136).toString('ascii').replace(/\0/g, '').trim(), 8);
    assert.ok(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length, 'Invalid tar entry');
    assert.ok(header[156] === 0 || header[156] === 48, 'Only ordinary package files are accepted');
    assert.ok(name.startsWith('package/'), 'Unexpected tar prefix');
    const file = name.slice(8);
    assert.ok(Object.hasOwn(HASHES, file) && !names.includes(file), 'Unexpected or repeated tar file');
    assert.equal(hash(tar.subarray(offset + 512, offset + 512 + size)), HASHES[file], 'Packed source differs: ' + file);
    names.push(file);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  assert.deepEqual(names.sort(), Object.keys(HASHES).sort(), 'Incomplete tarball');
}
export function verifyVendoredDependencies(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  root = realpathSync(root);
  verifyDirectory(path.join(root, 'vendor/braces'));
  verifyTar(readFileSync(path.join(root, 'vendor', TARBALL)));
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const declared = manifest.dependencies?.braces ?? manifest.devDependencies?.braces;
  assert.equal(declared, 'file:vendor/' + TARBALL, 'The reviewed local tarball must be a direct dependency');
  assert.equal(manifest.overrides?.braces, '$braces', 'Every dependency must use the pinned derivative');
  const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const entries = Object.entries(lock.packages ?? {}).filter(([name]) => /(?:^|\/)node_modules\/braces$/.test(name));
  assert.ok(entries.some(([name]) => name === 'node_modules/braces'), 'No installed fork in lockfile');
  for (const [name, info] of entries) {
    assert.equal(info.version, VERSION, 'Unpatched braces version in ' + name);
    assert.equal(info.integrity, INTEGRITY, 'Unreviewed braces tarball in ' + name);
    assert.equal(Boolean(info.link), false, 'Local symlink resolution is not permitted');
    const location = path.join(root, name);
    assert.equal(realpathSync(location).toLowerCase(), location.toLowerCase(), 'Package symlinks are not permitted');
    verifyDirectory(location);
    const installed = JSON.parse(readFileSync(path.join(location, 'package.json'), 'utf8'));
    assert.equal(installed.name, 'braces');
    assert.equal(installed.version, VERSION);
  }
  return { pass: true, package: 'braces', version: VERSION, integrity: INTEGRITY, checkedInstalledCopies: entries.length, sourceFiles: Object.keys(HASHES).length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(verifyVendoredDependencies(), null, 2));
}
