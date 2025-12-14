import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { GitHubReleaseAutomation } from '../release-github';

// Avoid killing the test process when release scripts call process.exit.
jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

// Mock the execSync function
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Mock the fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  renameSync: jest.fn(),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('GitHubReleaseAutomation', () => {
  let githubReleaseAutomation: GitHubReleaseAutomation;
  const realProjectRoot = path.resolve(__dirname, '..', '..');
  const realBuildsDir = path.join(realProjectRoot, 'builds');

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.0.0' }));

    // Create instance
    githubReleaseAutomation = new GitHubReleaseAutomation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentVersion', () => {
    it('should return the version from package.json', () => {
      const mockPackageJson = { version: '0.8.3' };
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockPackageJson));

      const version = (githubReleaseAutomation as any).getCurrentVersion();

      expect(version).toBe('0.8.3');
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        path.join(realProjectRoot, 'package.json'),
        'utf8'
      );
    });
  });

  describe('checkGitHubCLI', () => {
    it('should verify GitHub CLI is installed', () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from('gh version 2.0.0'));

      (githubReleaseAutomation as any).checkGitHubCLI();

      expect(mockedExecSync).toHaveBeenCalledWith('gh --version', { stdio: 'pipe' });
    });

    it('should throw an error if GitHub CLI is not installed', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('command not found: gh');
      });

      expect(() => {
        (githubReleaseAutomation as any).checkGitHubCLI();
      }).toThrow('GitHub CLI is not installed. Please install it from https://cli.github.com/');
    });
  });

  describe('createGitHubRelease', () => {
    it('should run the gh release create command', () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from(''));

      (githubReleaseAutomation as any).createGitHubRelease('v0.8.3', 'Release v0.8.3', 'Release notes', '/path/to/apk');

      expect(mockedExecSync).toHaveBeenCalledWith(
        'gh release create v0.8.3 -t "Release v0.8.3" -n "Release notes" --draft=false "/path/to/apk"',
        { stdio: 'inherit', cwd: realProjectRoot }
      );
    });

    it('should throw an error if the release creation fails', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Release failed');
      });

      expect(() => {
        (githubReleaseAutomation as any).createGitHubRelease('v0.8.3', 'Release v0.8.3', 'Release notes', '/path/to/apk');
      }).toThrow('Failed to create GitHub release: Error: Release failed');
    });
  });

  describe('generateReleaseNotes', () => {
    it('should generate release notes from commits since the last tag', async () => {
      // Mock git tag command to return previous tags
      mockedExecSync.mockReturnValueOnce('0.8.1\n0.8.0\n0.7.2\n') // git tag --sort=-v:refname
        .mockReturnValueOnce('a1b2c3d Update docs\n e4f5g6h Fix bug in browser item\n') // git log command
        .mockReturnValueOnce('gh version 2.0.0'); // gh --version check

      const result = await (githubReleaseAutomation as any).generateReleaseNotes('v0.8.2');

      expect(result).toContain('Changes in this release');
      expect(result).toContain('- a1b2c3d Update docs');
      expect(result).toContain('- e4f5g6h Fix bug in browser item');
      expect(mockedExecSync).toHaveBeenCalledWith('git tag --sort=-v:refname', { encoding: 'utf8' });
    });

    it('should handle case when no previous tag exists', async () => {
      // Mock git commands
      mockedExecSync
        .mockImplementation((command: string) => {
          if (command.includes('tag')) {
            throw new Error('No tags exist');
          } else if (command.includes('log')) {
            return 'a1b2c3d Initial commit\n e4f5g6h Add feature\n';
          } else if (command.includes('gh --version')) {
            return 'gh version 2.0.0';
          }
          return '';
        });

      const result = await (githubReleaseAutomation as any).generateReleaseNotes('v0.8.2');

      expect(result).toContain('Changes in this release');
      expect(result).toContain('- a1b2c3d Initial commit');
      expect(result).toContain('- e4f5g6h Add feature');
    });

    it('should return default when no commits are found', async () => {
      mockedExecSync
        .mockReturnValueOnce('0.8.1\n0.8.0\n') // git tag command
        .mockReturnValueOnce('') // git log command (no commits)
        .mockReturnValueOnce('gh version 2.0.0'); // gh --version check

      const result = await (githubReleaseAutomation as any).generateReleaseNotes('v0.8.2');

      expect(result).toContain('Release v0.8.2');
      expect(result).toContain('Automated release');
    });
  });

  describe('run', () => {
    it('should run the full GitHub release process', async () => {
      // Mock all necessary methods
      mockedFs.existsSync.mockReturnValue(true); // APK exists
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' })); // package.json
      mockedExecSync.mockReturnValueOnce(Buffer.from('gh version 2.0.0')); // gh version check
      mockedExecSync.mockReturnValueOnce(Buffer.from('')); // release command
      mockedExecSync.mockReturnValueOnce('0.8.1\n0.8.0\n'); // git tags
      mockedExecSync.mockReturnValueOnce('a1b2c3d Update docs\n'); // git log

      await githubReleaseAutomation.run('0.8.2', 'v0.8.2', 'Release v0.8.2', 'Custom notes');

      // Check that all necessary steps were performed
      expect(mockedFs.existsSync).toHaveBeenCalledWith(
        path.join(realBuildsDir, 'Rapunzel-0.8.2.apk')
      );
      const releaseCall = mockedExecSync.mock.calls.find(
        ([cmd]) => typeof cmd === 'string' && cmd.includes('gh release create')
      );
      expect(releaseCall?.[0]).toContain('gh release create v0.8.2');
      expect(releaseCall?.[0]).toContain(
        path.join(realBuildsDir, 'Rapunzel-0.8.2.apk')
      );
    });

    it('should generate release notes when none are provided', async () => {
      // Mock all necessary methods
      mockedFs.existsSync.mockReturnValue(true); // APK exists
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' })); // package.json
      mockedExecSync.mockReturnValueOnce(Buffer.from('gh version 2.0.0')); // gh version check
      mockedExecSync.mockReturnValueOnce(Buffer.from('')); // release command
      mockedExecSync.mockReturnValueOnce('0.8.1\n0.8.0\n'); // git tags
      mockedExecSync.mockReturnValueOnce('a1b2c3d Update docs\n'); // git log

      await githubReleaseAutomation.run('0.8.2', 'v0.8.2', 'Release v0.8.2');

      // Check that the release notes were auto-generated
      const releaseCall = mockedExecSync.mock.calls.find(
        ([cmd]) => typeof cmd === 'string' && cmd.includes('gh release create')
      );
      expect(releaseCall?.[0]).toContain(
        'gh release create v0.8.2 -t "Release v0.8.2"'
      );
      expect(releaseCall?.[0]).toContain(
        path.join(realBuildsDir, 'Rapunzel-0.8.2.apk')
      );
    });

    it('should throw an error if APK does not exist', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
      mockedFs.existsSync.mockReturnValue(false); // APK does not exist

      await githubReleaseAutomation.run('0.8.2');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
