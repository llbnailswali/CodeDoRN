#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>

@interface RCT_EXTERN_MODULE(WebStage, NSObject)
RCT_EXTERN_METHOD(copyToClipboard:(NSString *)value resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(warmUp)
RCT_EXTERN_METHOD(open:(NSString *)lessonKey stage:(NSString *)stage dark:(BOOL)dark practice:(BOOL)practice tryIt:(BOOL)tryIt prefillCode:(NSString *)prefillCode practiceHelpLevel:(NSString *)practiceHelpLevel resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
