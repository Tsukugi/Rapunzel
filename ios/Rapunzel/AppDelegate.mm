#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

static NSString *const kOtaNativeCompatibility = @"rn-0.72.6-hermes";
static NSInteger const kOtaSchema = 1;

static NSString *OtaDirectoryPath(void)
{
  NSString *documents = NSSearchPathForDirectoriesInDomains(
      NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
  return [documents stringByAppendingPathComponent:@"ota"];
}

static NSString *OtaActiveRecordPath(void)
{
  return [OtaDirectoryPath() stringByAppendingPathComponent:@"active.json"];
}

static BOOL IsOtaVersionNewer(NSString *candidate, NSString *current)
{
  if (![candidate isKindOfClass:[NSString class]] ||
      ![current isKindOfClass:[NSString class]]) {
    return NO;
  }

  NSString *candidateCore = [candidate componentsSeparatedByString:@"-"].firstObject;
  NSString *currentCore = [current componentsSeparatedByString:@"-"].firstObject;
  candidateCore = [candidateCore componentsSeparatedByString:@"+"].firstObject;
  currentCore = [currentCore componentsSeparatedByString:@"+"].firstObject;
  NSArray<NSString *> *candidateParts = [candidateCore componentsSeparatedByString:@"."];
  NSArray<NSString *> *currentParts = [currentCore componentsSeparatedByString:@"."];
  if (candidateParts.count != 3 || currentParts.count != 3) {
    return NO;
  }

  for (NSUInteger index = 0; index < 3; index += 1) {
    NSScanner *candidateScanner = [NSScanner scannerWithString:candidateParts[index]];
    NSScanner *currentScanner = [NSScanner scannerWithString:currentParts[index]];
    NSInteger candidatePart = 0;
    NSInteger currentPart = 0;
    if (![candidateScanner scanInteger:&candidatePart] ||
        ![currentScanner scanInteger:&currentPart] ||
        !candidateScanner.isAtEnd ||
        !currentScanner.isAtEnd) {
      return NO;
    }
    if (candidatePart != currentPart) {
      return candidatePart > currentPart;
    }
  }

  return NO;
}

static NSString *EmbeddedAppVersion(void)
{
  return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
}

static NSDictionary *ReadOtaRecord(void)
{
  NSData *data = [NSData dataWithContentsOfFile:OtaActiveRecordPath()];
  if (data == nil) {
    return nil;
  }

  id value = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  return [value isKindOfClass:[NSDictionary class]] ? value : nil;
}

static BOOL WriteOtaRecord(NSDictionary *record)
{
  if (![NSJSONSerialization isValidJSONObject:record]) {
    return NO;
  }

  NSString *directory = OtaDirectoryPath();
  [[NSFileManager defaultManager] createDirectoryAtPath:directory
                              withIntermediateDirectories:YES
                                               attributes:nil
                                                    error:nil];
  NSData *data = [NSJSONSerialization dataWithJSONObject:record options:0 error:nil];
  return data != nil && [data writeToFile:OtaActiveRecordPath() atomically:YES];
}

static NSString *OtaBundlePath(NSDictionary *reference, NSString *directory)
{
  if (![reference isKindOfClass:[NSDictionary class]] ||
      ![reference[@"version"] isKindOfClass:[NSString class]] ||
      ![reference[@"bundlePath"] isKindOfClass:[NSString class]] ||
      ![reference[@"assetRoot"] isKindOfClass:[NSString class]] ||
      ![reference[@"nativeCompatibility"] isEqualToString:kOtaNativeCompatibility]) {
    return nil;
  }

  NSString *root = [directory stringByStandardizingPath];
  NSString *path = [reference[@"bundlePath"] stringByStandardizingPath];
  NSString *prefix = [root stringByAppendingString:@"/"];
  BOOL isDirectory = NO;
  if (![path hasPrefix:prefix] ||
      ![[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDirectory] ||
      isDirectory) {
    return nil;
  }

  NSString *assetRoot = [reference[@"assetRoot"] stringByStandardizingPath];
  if (![assetRoot hasPrefix:prefix]) {
    return nil;
  }

  return path;
}

static NSURL *OtaBundleURL(void)
{
  NSString *directory = OtaDirectoryPath();
  NSDictionary *record = ReadOtaRecord();
  if (![record isKindOfClass:[NSDictionary class]] ||
      [record[@"schema"] integerValue] != kOtaSchema ||
      ![record[@"nativeCompatibility"] isEqualToString:kOtaNativeCompatibility]) {
    return nil;
  }

  NSDictionary *pending = record[@"pending"];
  if ([pending isKindOfClass:[NSDictionary class]]) {
    if (![pending[@"attempted"] isKindOfClass:[NSNumber class]]) {
      return nil;
    }

    NSMutableDictionary *mutableRecord = [record mutableCopy];
    if ([pending[@"attempted"] boolValue]) {
      [mutableRecord removeObjectForKey:@"pending"];
      WriteOtaRecord(mutableRecord);
      NSString *currentPath = IsOtaVersionNewer(record[@"current"][@"version"], EmbeddedAppVersion())
          ? OtaBundlePath(record[@"current"], directory)
          : nil;
      return currentPath == nil ? nil : [NSURL fileURLWithPath:currentPath];
    }

    NSString *pendingPath = IsOtaVersionNewer(pending[@"version"], EmbeddedAppVersion())
        ? OtaBundlePath(pending, directory)
        : nil;
    if (pendingPath == nil) {
      [mutableRecord removeObjectForKey:@"pending"];
      WriteOtaRecord(mutableRecord);
      NSString *currentPath = IsOtaVersionNewer(record[@"current"][@"version"], EmbeddedAppVersion())
          ? OtaBundlePath(record[@"current"], directory)
          : nil;
      return currentPath == nil ? nil : [NSURL fileURLWithPath:currentPath];
    }

    NSMutableDictionary *attempted = [pending mutableCopy];
    attempted[@"attempted"] = @YES;
    mutableRecord[@"pending"] = attempted;
    if (!WriteOtaRecord(mutableRecord)) {
      return nil;
    }
    return [NSURL fileURLWithPath:pendingPath];
  }

  NSString *currentPath = IsOtaVersionNewer(record[@"current"][@"version"], EmbeddedAppVersion())
      ? OtaBundlePath(record[@"current"], directory)
      : nil;
  return currentPath == nil ? nil : [NSURL fileURLWithPath:currentPath];
}

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Rapunzel";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  NSURL *otaBundleURL = OtaBundleURL();
  return otaBundleURL != nil
      ? otaBundleURL
      : [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
