import { requireNativeView } from 'expo';
import * as React from 'react';

import { NexusDSAViewProps } from './NexusDSA.types';

const NativeView: React.ComponentType<NexusDSAViewProps> =
  requireNativeView('NexusDSA');

export default function NexusDSAView(props: NexusDSAViewProps) {
  return <NativeView {...props} />;
}
