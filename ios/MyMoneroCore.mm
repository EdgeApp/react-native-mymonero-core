#import "MyMoneroCore.h"
#include "mymonero-methods.hpp"

@implementation MyMoneroCore

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(
  callMyMonero,
  callMyMoneroMethod:(NSString *)method
  arguments:(NSString *)arguments
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
  const std::string methodString = [method UTF8String];
  const std::string argumentsString = [arguments UTF8String];

  // Find the named method:
  for (int i = 0; i < myMoneroMethodCount; ++i) {
      if (myMoneroMethods[i].name != methodString) continue;

      // Call the method, with error handling:
      try {
          const std::string out = myMoneroMethods[i].method(argumentsString);
          resolve([NSString stringWithCString:out.c_str() encoding:NSUTF8StringEncoding]);
      } catch (...) {
          reject(@"Error", @"mymonero-core-cpp threw an exception", nil);
      }
      return;
  }

  reject(
    @"TypeError",
    [NSString stringWithFormat:@"No mymonero-core-cpp method %@", method],
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
