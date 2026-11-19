import * as React from 'react';

import { NexusDSAViewProps } from './NexusDSA.types';

export default function NexusDSAView(props: NexusDSAViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
