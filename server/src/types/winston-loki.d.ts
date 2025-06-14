declare module 'winston-loki' {
  import { TransportStreamOptions } from 'winston-transport';
  import { Format } from 'logform';

  export interface LokiTransportOptions extends TransportStreamOptions {
    host: string;
    labels?: Record<string, string>;
    json?: boolean;
    format?: Format;
    replaceTimestamp?: boolean;
    onConnectionError?: (error: Error) => void;
    gracefulShutdown?: boolean;
    timeout?: number;
    clearOnError?: boolean;
    batching?: boolean;
    interval?: number;
  }

  export default class LokiTransport {
    constructor(opts: LokiTransportOptions);
  }
}
