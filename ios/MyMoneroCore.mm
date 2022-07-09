#import "MyMoneroCore.h"
#include "mymonero-methods.hpp"

@implementation MyMoneroCore

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup { return NO; }

RCT_REMAP_METHOD(
  callMyMonero,
  callMyMoneroMethod:(NSString *)method
  arguments:(NSArray *)arguments
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
  const std::string methodString = [method UTF8String];

  // Re-package the arguments:
  NSUInteger length = [arguments count];
  std::vector<const std::string> strings;
  strings.reserve(length);
  for (NSUInteger i = 0; i < length; ++i) {
    NSString *string = [arguments objectAtIndex:i];
    strings.push_back([string UTF8String]);
  }

  // Find the named method:
  for (int i = 0; i < myMoneroMethodCount; ++i) {
    if (myMoneroMethods[i].name != methodString) continue;

    // Validate the argument count:
    if (myMoneroMethods[i].argc != strings.size()) {
      reject(@"Error", @"mymonero incorrect C++ argument count", nil);
      return;
    }

    // Call the method, with error handling:
    try {
      const std::string out = myMoneroMethods[i].method(strings);
      resolve(
        [NSString stringWithCString:out.c_str() encoding:NSUTF8StringEncoding]
      );
    } catch (std::exception e) {
      reject(
        @"Error",
        [NSString stringWithCString:e.what() encoding:NSUTF8StringEncoding],
        nil
      );
    } catch (...) {
      reject(@"Error", @"mymonero threw a C++ exception", nil);
    }
    return;
  }

  reject(
    @"TypeError",
    [NSString stringWithFormat:@"No mymonero C++ method %@", method],
    nil
  );
}

- (NSDictionary *)constantsToExport
{
  NSMutableArray *out = [NSMutableArray arrayWithCapacity:myMoneroMethodCount];
  for (int i = 0; i < myMoneroMethodCount; ++i) {
    NSString *name = [NSString stringWithCString:myMoneroMethods[i].name
      encoding:NSUTF8StringEncoding];
    out[i] = name;
  }
  return @{ @"methodNames": out };
}

@end
