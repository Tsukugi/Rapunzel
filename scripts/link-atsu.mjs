import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');
const ignored = new Set(['node_modules', '.git', '.expo', '.vscode']);
const linkPrefix = path.join(repoRoot, '.npm-link-global');
mkdirSync(linkPrefix, { recursive: true });

const rapunzelPkg = JSON.parse(
  readFileSync(path.join(appRoot, 'package.json'), 'utf8'),
);
const desiredAtsu = new Set(
  [
    ...Object.keys(rapunzelPkg.dependencies || {}),
    ...Object.keys(rapunzelPkg.devDependencies || {}),
    ...Object.keys(rapunzelPkg.peerDependencies || {}),
  ].filter(name => name.startsWith('@atsu/')),
);

const localAtsuPackages = readdirSync(repoRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !ignored.has(entry.name))
  .map(entry => {
    const pkgJsonPath = path.join(repoRoot, entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) return null;

    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    if (
      !pkg.name ||
      !pkg.name.startsWith('@atsu/') ||
      pkg.name === '@atsu/rapunzel' ||
      (desiredAtsu.size > 0 && !desiredAtsu.has(pkg.name))
    ) {
      return null;
    }

    return {
      name: pkg.name,
      dir: path.dirname(pkgJsonPath),
    };
  })
  .filter(Boolean);

if (localAtsuPackages.length === 0) {
  console.log('No local @atsu packages found to link.');
  process.exit(0);
}

const runNpm = (cwd, args) => {
  const result = spawnSync('npm', args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, npm_config_prefix: linkPrefix },
  });
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(' ')} failed in ${cwd}`);
  }
};

console.log(
  `Creating global links for local @atsu packages (prefix: ${linkPrefix})...`,
);
localAtsuPackages.forEach(pkg => runNpm(pkg.dir, ['link']));

console.log('Linking @atsu packages into Rapunzel...');
localAtsuPackages.forEach(pkg => runNpm(appRoot, ['link', pkg.name]));

console.log(
  'Linked packages:\n' +
    localAtsuPackages.map(pkg => ` - ${pkg.name}`).join('\n'),
);
