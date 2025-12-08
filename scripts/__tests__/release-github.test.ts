import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { GitHubReleaseAutomation } from '../release-github';

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
  const mockProjectRoot = '/mock/project';
  const mockBuildsDir = '/mock/project/builds';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create instance
    githubReleaseAutomation = new GitHubReleaseAutomation();

    // Mock path.resolve to return the mock project root
    jest.spyOn(path, 'resolve').mockReturnValue(mockProjectRoot);

    // Mock path.join to return expected paths
    jest.spyOn(path, 'join').mockImplementation((...paths: string[]) => {
      return paths.join('/');
    });
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
        '/mock/project/package.json',
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
        { stdio: 'inherit', cwd: '/mock/project' }
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
      mockedFs.existsSync.mockReturnValueOnce(true); // APK exists
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify({ version: '0.8.2' })); // package.json
      mockedExecSync.mockReturnValueOnce(Buffer.from('gh version 2.0.0')); // gh version check
      mockedExecSync.mockReturnValueOnce(Buffer.from('')); // release command
      mockedExecSync.mockReturnValueOnce('0.8.1\n0.8.0\n'); // git tags
      mockedExecSync.mockReturnValueOnce('a1b2c3d Update docs\n'); // git log

      await githubReleaseAutomation.run('0.8.2', 'v0.8.2', 'Release v0.8.2', 'Custom notes');

      // Check that all necessary steps were performed
      expect(mockedFs.existsSync).toHaveBeenCalledWith('/mock/project/builds/Rapunzel-0.8.2.apk');
      expect(mockedExecSync).toHaveBeenCalledWith('gh --version', { stdio: 'pipe' });
      expect(mockedExecSync).toHaveBeenCalledWith(
        'gh release create v0.8.2 -t "Release v0.8.2" -n "Custom notes" --draft=false "/mock/project/builds/Rapunzel-0.8.2.apk"',
        { stdio: 'inherit', cwd: '/mock/project' }
      );
    });

    it('should generate release notes when none are provided', async () => {
      // Mock all necessary methods
      mockedFs.existsSync.mockReturnValueOnce(true); // APK exists
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify({ version: '0.8.2' })); // package.json
      mockedExecSync.mockReturnValueOnce(Buffer.from('gh version 2.0.0')); // gh version check
      mockedExecSync.mockReturnValueOnce(Buffer.from('')); // release command
      mockedExecSync.mockReturnValueOnce('0.8.1\n0.8.0\n'); // git tags
      mockedExecSync.mockReturnValueOnce('a1b2c3d Update docs\n'); // git log

      await githubReleaseAutomation.run('0.8.2', 'v0.8.2', 'Release v0.8.2');

      // Check that the release notes were auto-generated
      expect(mockedExecSync).toHaveBeenCalledWith(
        'gh release create v0.8.2 -t "Release v0.8.2" -n "## Changes in this release\n\n- a1b2c3d Update docs" --draft=false "/mock/project/builds/Rapunzel-0.8.2.apk"',
        { stdio: 'inherit', cwd: '/mock/project' }
      );
    });

    it('should throw an error if APK does not exist', async () => {
      mockedFs.existsSync.mockReturnValueOnce(false); // APK does not exist

      await expect(githubReleaseAutomation.run('0.8.2')).rejects.toThrow(
        'APK file not found at /mock/project/builds/Rapunzel-0.8.2.apk. Please build the APK first.'
      );
    });
  });
});