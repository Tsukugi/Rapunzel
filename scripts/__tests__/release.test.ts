import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ReleaseAutomation } from '../release';

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

describe('ReleaseAutomation', () => {
  let releaseAutomation: ReleaseAutomation;
  const realProjectRoot = path.resolve(__dirname, '..', '..');
  const realBuildsDir = path.join(realProjectRoot, 'builds');

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    // Create instance
    releaseAutomation = new ReleaseAutomation();

    // Keep path.resolve as-is, but allow join to behave normally.
    jest.spyOn(path, 'join').mockImplementation((...paths: string[]) => paths.join('/'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentVersion', () => {
    it('should return the version from package.json', () => {
      const mockPackageJson = { version: '0.8.3' };
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockPackageJson));

      const version = (releaseAutomation as any).getCurrentVersion();

      expect(version).toBe('0.8.3');
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        path.join(realProjectRoot, 'package.json'),
        'utf8'
      );
    });
  });

  describe('updatePackageJsonVersion', () => {
    it('should update the version in package.json', () => {
      const mockOldPackageJson = { version: '0.8.2', name: '@atsu/rapunzel' };
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockOldPackageJson));

      (releaseAutomation as any).updatePackageJsonVersion('0.8.3');

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.join(realProjectRoot, 'package.json'),
        JSON.stringify({ version: '0.8.3', name: '@atsu/rapunzel' }, null, 2)
      );
    });
  });

  describe('updateAndroidVersion', () => {
    it('should update the versionName in build.gradle', () => {
      const mockBuildGradle = `
        defaultConfig {
          applicationId "com.rapunzel"
          minSdkVersion rootProject.ext.minSdkVersion
          targetSdkVersion rootProject.ext.targetSdkVersion
          versionCode 1
          versionName "0.8.2"
        }
      `;
      mockedFs.readFileSync.mockReturnValueOnce(mockBuildGradle);

      (releaseAutomation as any).updateAndroidVersion('0.8.3');

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.join(realProjectRoot, 'android', 'app', 'build.gradle'),
        expect.stringContaining('versionName "0.8.3"')
      );
    });

    it('should throw an error if versionName is not found', () => {
      const mockBuildGradle = `
        defaultConfig {
          applicationId "com.rapunzel"
        }
      `;
      mockedFs.readFileSync.mockReturnValueOnce(mockBuildGradle);

      expect(() => {
        (releaseAutomation as any).updateAndroidVersion('0.8.3');
      }).toThrow('Could not find versionName in build.gradle');
    });
  });

  describe('createBuildsDirectory', () => {
    it('should create the builds directory if it does not exist', () => {
      mockedFs.existsSync.mockReturnValueOnce(false);

      (releaseAutomation as any).createBuildsDirectory();

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(realBuildsDir);
    });

    it('should not create the builds directory if it already exists', () => {
      mockedFs.existsSync.mockReturnValueOnce(true);

      (releaseAutomation as any).createBuildsDirectory();

      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('stageReleaseChanges', () => {
    it('should stage package, lockfile, gradle, and apk when they exist', () => {
      mockedFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath !== 'string') return false;
        return (
          filePath.includes('package.json') ||
          filePath.includes('package-lock.json') ||
          filePath.includes('build.gradle') ||
          filePath.includes('Rapunzel-0.8.3.apk')
        );
      });
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const staged = (releaseAutomation as any).stageReleaseChanges('0.8.3');

      expect(staged).toEqual([
        'package.json',
        'package-lock.json',
        'android/app/build.gradle',
        'builds/Rapunzel-0.8.3.apk',
      ]);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'git add "package.json" "package-lock.json" "android/app/build.gradle" "builds/Rapunzel-0.8.3.apk"',
        { cwd: realProjectRoot, stdio: 'inherit' }
      );
    });

    it('should skip staging when no release files exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const staged = (releaseAutomation as any).stageReleaseChanges('0.8.3');

      expect(staged).toEqual([]);
      expect(mockedExecSync).not.toHaveBeenCalled();
    });
  });

  describe('commitReleaseChanges', () => {
    it('should commit staged changes when present', () => {
      mockedExecSync.mockImplementation((command: string) => {
        if (command.startsWith('git diff --cached --quiet')) {
          throw new Error('changes present');
        }
        return Buffer.from('');
      });

      const committed = (releaseAutomation as any).commitReleaseChanges('0.8.3');

      expect(committed).toBe(true);
      const commitCall = mockedExecSync.mock.calls.find(
        ([cmd]) => typeof cmd === 'string' && cmd.startsWith('git commit')
      );
      expect(commitCall?.[0]).toBe('git commit -m "chore(release): v0.8.3"');
      expect(commitCall?.[1]).toEqual({ cwd: realProjectRoot, stdio: 'inherit' });
    });

    it('should not commit when no staged changes exist', () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      const committed = (releaseAutomation as any).commitReleaseChanges('0.8.3');

      expect(committed).toBe(false);
      const commitCall = mockedExecSync.mock.calls.find(
        ([cmd]) => typeof cmd === 'string' && cmd.startsWith('git commit')
      );
      expect(commitCall).toBeUndefined();
    });
  });

  describe('pushReleaseChanges', () => {
    it('should push staged changes', () => {
      mockedExecSync.mockReturnValue(Buffer.from(''));

      (releaseAutomation as any).pushReleaseChanges();

      expect(mockedExecSync).toHaveBeenCalledWith('git push', {
        cwd: realProjectRoot,
        stdio: 'inherit',
      });
    });
  });

  describe('buildReleaseAPK', () => {
    it('should run the gradle assembleRelease command', () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from(''));

      (releaseAutomation as any).buildReleaseAPK();

      expect(mockedExecSync).toHaveBeenCalledWith('./gradlew assembleRelease', {
        cwd: path.join(realProjectRoot, 'android'),
        stdio: 'inherit',
        env: expect.anything(),
      });
    });

    it('should throw an error if the gradle command fails', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => {
        (releaseAutomation as any).buildReleaseAPK();
      }).toThrow('Failed to build APK: Error: Command failed');
    });
  });

  describe('moveAPKToBuildsFolder', () => {
    it('should move the APK to the builds folder with the correct name', () => {
      mockedFs.existsSync.mockReturnValueOnce(true);

      (releaseAutomation as any).moveAPKToBuildsFolder('0.8.3');

      expect(mockedFs.renameSync).toHaveBeenCalledWith(
        path.join(
          realProjectRoot,
          'android',
          'app',
          'build',
          'outputs',
          'apk',
          'release',
          'app-release.apk'
        ),
        path.join(realBuildsDir, 'Rapunzel-0.8.3.apk')
      );
    });

    it('should throw an error if the source APK does not exist', () => {
      mockedFs.existsSync.mockReturnValueOnce(false);

      expect(() => {
        (releaseAutomation as any).moveAPKToBuildsFolder('0.8.3');
      }).toThrow(
        `APK file not found at ${path.join(
          realProjectRoot,
          'android',
          'app',
          'build',
          'outputs',
          'apk',
          'release',
          'app-release.apk'
        )}`
      );
    });
  });

  describe('runGitHubReleaseScript', () => {
    it('should run the GitHub release script when requested', async () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from(''));
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);

      await (releaseAutomation as any).runGitHubReleaseScript('0.8.3');

      expect(mockedExecSync).toHaveBeenCalledWith(
        `ts-node ${path.join(realProjectRoot, 'scripts', 'release-github.ts')} --version 0.8.3`,
        { stdio: 'inherit', cwd: realProjectRoot }
      );
    });

    it('should throw an error if the GitHub release script fails', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      await expect(
        (releaseAutomation as any).runGitHubReleaseScript('0.8.3')
      ).rejects.toThrow('Failed to run GitHub release script: Error: Command failed');
    });
  });

  describe('run', () => {
    it('should run the full release process without GitHub release', async () => {
      // Mock all necessary methods
      const getCurrentVersionSpy = jest
        .spyOn(releaseAutomation as any, 'getCurrentVersion')
        .mockReturnValue('0.8.2');
      const updatePackageJsonVersionSpy = jest
        .spyOn(releaseAutomation as any, 'updatePackageJsonVersion')
        .mockImplementation(() => {});
      const updateAndroidVersionSpy = jest
        .spyOn(releaseAutomation as any, 'updateAndroidVersion')
        .mockImplementation(() => {});
      const createBuildsDirectorySpy = jest
        .spyOn(releaseAutomation as any, 'createBuildsDirectory')
        .mockImplementation(() => {});
      const buildReleaseAPKSpy = jest
        .spyOn(releaseAutomation as any, 'buildReleaseAPK')
        .mockImplementation(() => {});
      const moveAPKToBuildsFolderSpy = jest
        .spyOn(releaseAutomation as any, 'moveAPKToBuildsFolder')
        .mockImplementation(() => {});
      const stageReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'stageReleaseChanges')
        .mockReturnValue([]);
      const commitReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'commitReleaseChanges')
        .mockReturnValue(false);
      const pushReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'pushReleaseChanges')
        .mockImplementation(() => {});

      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockReturnValue(Buffer.from(''));

      await releaseAutomation.run('0.8.3', false);

      expect(createBuildsDirectorySpy).toHaveBeenCalled();
      expect(updatePackageJsonVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(updateAndroidVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(buildReleaseAPKSpy).toHaveBeenCalled();
      expect(moveAPKToBuildsFolderSpy).toHaveBeenCalledWith('0.8.3');
      expect(stageReleaseChangesSpy).toHaveBeenCalledWith('0.8.3');
      expect(commitReleaseChangesSpy).toHaveBeenCalledWith('0.8.3');
      expect(pushReleaseChangesSpy).not.toHaveBeenCalled();
    });

    it('should run the full release process with GitHub release', async () => {
      // Mock all necessary methods
      const getCurrentVersionSpy = jest
        .spyOn(releaseAutomation as any, 'getCurrentVersion')
        .mockReturnValue('0.8.2');
      const updatePackageJsonVersionSpy = jest
        .spyOn(releaseAutomation as any, 'updatePackageJsonVersion')
        .mockImplementation(() => {});
      const updateAndroidVersionSpy = jest
        .spyOn(releaseAutomation as any, 'updateAndroidVersion')
        .mockImplementation(() => {});
      const createBuildsDirectorySpy = jest
        .spyOn(releaseAutomation as any, 'createBuildsDirectory')
        .mockImplementation(() => {});
      const buildReleaseAPKSpy = jest
        .spyOn(releaseAutomation as any, 'buildReleaseAPK')
        .mockImplementation(() => {});
      const moveAPKToBuildsFolderSpy = jest
        .spyOn(releaseAutomation as any, 'moveAPKToBuildsFolder')
        .mockImplementation(() => {});
      const stageReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'stageReleaseChanges')
        .mockReturnValue([]);
      const commitReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'commitReleaseChanges')
        .mockReturnValue(true);
      const pushReleaseChangesSpy = jest
        .spyOn(releaseAutomation as any, 'pushReleaseChanges')
        .mockImplementation(() => {});
      const runGitHubReleaseScriptSpy = jest
        .spyOn(releaseAutomation as any, 'runGitHubReleaseScript')
        .mockResolvedValue(undefined);

      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockReturnValue(Buffer.from(''));

      await releaseAutomation.run('0.8.3', true);

      expect(createBuildsDirectorySpy).toHaveBeenCalled();
      expect(updatePackageJsonVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(updateAndroidVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(buildReleaseAPKSpy).toHaveBeenCalled();
      expect(moveAPKToBuildsFolderSpy).toHaveBeenCalledWith('0.8.3');
      expect(stageReleaseChangesSpy).toHaveBeenCalledWith('0.8.3');
      expect(commitReleaseChangesSpy).toHaveBeenCalledWith('0.8.3');
      expect(pushReleaseChangesSpy).toHaveBeenCalled();
      expect(runGitHubReleaseScriptSpy).toHaveBeenCalledWith('0.8.3');
    });
  });
});
