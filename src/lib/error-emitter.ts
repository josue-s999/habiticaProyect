
import { EventEmitter } from 'events';

// This is a singleton event emitter to be used across the application.
// We use the 'events' module, which is a Node.js core module but is
// available in the browser via polyfills provided by modern bundlers.
export const errorEmitter = new EventEmitter();
