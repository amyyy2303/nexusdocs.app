import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './NexusDSA.types';

type NexusDSAModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class NexusDSAModule extends NativeModule<NexusDSAModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(NexusDSAModule, 'NexusDSAModule');
