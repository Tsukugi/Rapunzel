import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ReleaseAutomation } from '../release';

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
  const mockProjectRoot = '/mock/project';
  const mockBuildsDir = '/mock/project/builds';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create instance
    releaseAutomation = new ReleaseAutomation();

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

      const version = (releaseAutomation as any).getCurrentVersion();

      expect(version).toBe('0.8.3');
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        '/mock/project/package.json',
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
        '/mock/project/package.json',
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
        '/mock/project/android/app/build.gradle',
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

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/mock/project/builds');
    });

    it('should not create the builds directory if it already exists', () => {
      mockedFs.existsSync.mockReturnValueOnce(true);

      (releaseAutomation as any).createBuildsDirectory();

      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('buildReleaseAPK', () => {
    it('should run the gradle assembleRelease command', () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from(''));

      (releaseAutomation as any).buildReleaseAPK();

      expect(mockedExecSync).toHaveBeenCalledWith('./gradlew assembleRelease', {
        cwd: '/mock/project/android',
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
        '/mock/project/android/app/build/outputs/apk/release/app-release.apk',
        '/mock/project/builds/Rapunzel-0.8.3.apk'
      );
    });

    it('should throw an error if the source APK does not exist', () => {
      mockedFs.existsSync.mockReturnValueOnce(false);

      expect(() => {
        (releaseAutomation as any).moveAPKToBuildsFolder('0.8.3');
      }).toThrow('APK file not found at /mock/project/android/app/build/outputs/apk/release/app-release.apk');
    });
  });

  describe('runGitHubReleaseScript', () => {
    it('should run the GitHub release script when requested', async () => {
      mockedExecSync.mockReturnValueOnce(Buffer.from(''));
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);

      await (releaseAutomation as any).runGitHubReleaseScript('0.8.3');

      expect(mockedExecSync).toHaveBeenCalledWith(
        'ts-node /mock/project/scripts/release-github.ts --version 0.8.3',
        { stdio: 'inherit', cwd: '/mock/project' }
      );
    });

    it('should throw an error if the GitHub release script fails', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => {
        (releaseAutomation as any).runGitHubReleaseScript('0.8.3');
      }).toThrow('Failed to run GitHub release script: Error: Command failed');
    });
  });

  describe('run', () => {
    it('should run the full release process without GitHub release', async () => {
      // Mock all necessary methods
      const getCurrentVersionSpy = jest.spyOn(releaseAutomation as any, 'getCurrentVersion').mockReturnValue('0.8.2');
      const updatePackageJsonVersionSpy = jest.spyOn(releaseAutomation as any, 'updatePackageJsonVersion');
      const updateAndroidVersionSpy = jest.spyOn(releaseAutomation as any, 'updateAndroidVersion');
      const createBuildsDirectorySpy = jest.spyOn(releaseAutomation as any, 'createBuildsDirectory');
      const buildReleaseAPKSpy = jest.spyOn(releaseAutomation as any, 'buildReleaseAPK');
      const moveAPKToBuildsFolderSpy = jest.spyOn(releaseAutomation as any, 'moveAPKToBuildsFolder');

      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockReturnValue(Buffer.from(''));

      await releaseAutomation.run('0.8.3', false);

      expect(createBuildsDirectorySpy).toHaveBeenCalled();
      expect(updatePackageJsonVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(updateAndroidVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(buildReleaseAPKSpy).toHaveBeenCalled();
      expect(moveAPKToBuildsFolderSpy).toHaveBeenCalledWith('0.8.3');
    });

    it('should run the full release process with GitHub release', async () => {
      // Mock all necessary methods
      const getCurrentVersionSpy = jest.spyOn(releaseAutomation as any, 'getCurrentVersion').mockReturnValue('0.8.2');
      const updatePackageJsonVersionSpy = jest.spyOn(releaseAutomation as any, 'updatePackageJsonVersion');
      const updateAndroidVersionSpy = jest.spyOn(releaseAutomation as any, 'updateAndroidVersion');
      const createBuildsDirectorySpy = jest.spyOn(releaseAutomation as any, 'createBuildsDirectory');
      const buildReleaseAPKSpy = jest.spyOn(releaseAutomation as any, 'buildReleaseAPK');
      const moveAPKToBuildsFolderSpy = jest.spyOn(releaseAutomation as any, 'moveAPKToBuildsFolder');
      const runGitHubReleaseScriptSpy = jest.spyOn(releaseAutomation as any, 'runGitHubReleaseScript');

      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '0.8.2' }));
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockReturnValue(Buffer.from(''));

      await releaseAutomation.run('0.8.3', true);

      expect(createBuildsDirectorySpy).toHaveBeenCalled();
      expect(updatePackageJsonVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(updateAndroidVersionSpy).toHaveBeenCalledWith('0.8.3');
      expect(buildReleaseAPKSpy).toHaveBeenCalled();
      expect(moveAPKToBuildsFolderSpy).toHaveBeenCalledWith('0.8.3');
      expect(runGitHubReleaseScriptSpy).toHaveBeenCalledWith('0.8.3');
    });
  });
});