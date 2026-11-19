
import {
  NativeModule,
  requireOptionalNativeModule,
} from 'expo';
import { NexusDSAModuleEvents } from './NexusDSA.types';

declare class NexusDSAModule extends NativeModule<NexusDSAModuleEvents> {
  sortFiles(
  ids: string[],
  names: string[],
  sizes: number[],
  modifiedAt: string[],
  algorithm: number,
  field: number,
  ascending: boolean
): string;

  PI: number;

  hello(): string;
  nativeStatus(): string;

  // ==================== TREE ====================

  initializeTree(
    rootId: string,
    rootName: string
  ): boolean;

  addTreeNode(
    parentId: string,
    id: string,
    name: string,
    isFolder: boolean
  ): boolean;

  removeTreeNode(id: string): boolean;

  getTreeJson(): string;

  // ==================== HASH TABLE ====================

  initializeHashTable(capacity: number): boolean;

  insertDocument(
    id: string,
    name: string,
    storage: string,
    size: number
  ): boolean;

  searchDocument(id: string): string;

  removeDocument(id: string): boolean;

  getHashTableStats(): string;

  // ==================== EXISTING ====================

  setValueAsync(value: string): Promise<void>;
}

const NexusDSA =
  requireOptionalNativeModule<NexusDSAModule>('NexusDSA');

export default NexusDSA;