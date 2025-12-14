import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function buildAndInstallAndroid(): void {
  try {
    console.log('Starting Android build...');
    
    // Build the APK
    execSync('cd android && ./gradlew assembleDebug', { stdio: 'inherit' });
    
    // Path to the built APK
    const apkPath = join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    
    if (existsSync(apkPath)) {
      console.log('APK built successfully. Installing...');
      
      // Install the APK
      execSync(`adb install "${apkPath}"`, { stdio: 'inherit' });
      console.log('APK installed successfully!');
    } else {
      throw new Error('APK was not found after build');
    }
  } catch (error) {
    console.error('Build or install failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildAndInstallAndroid();
}

export { buildAndInstallAndroid };