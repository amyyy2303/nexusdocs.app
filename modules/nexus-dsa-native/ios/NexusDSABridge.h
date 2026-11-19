
#import <Foundation/Foundation.h>

@interface NexusDSABridge : NSObject

// Tree operations

+ (BOOL)initializeTreeWithRootId:(NSString *)rootId
                        rootName:(NSString *)rootName;

+ (BOOL)addTreeNodeWithParentId:(NSString *)parentId
                             id:(NSString *)nodeId
                           name:(NSString *)name
                       isFolder:(BOOL)isFolder;

+ (BOOL)removeTreeNodeWithId:(NSString *)nodeId;

+ (NSString *)getTreeJson;

// Native status

+ (NSString *)getNativeStatus;

@end
