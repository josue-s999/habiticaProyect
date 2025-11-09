
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';

/**
 * This component listens for custom Firestore permission errors and throws them.
 * In a Next.js development environment, this will display a detailed error
 * overlay, which is perfect for debugging security rules.
 * This component renders nothing to the DOM.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // In a Next.js development environment, uncaught errors
      // are automatically displayed in an overlay.
      // This is a deliberate choice to make security rule debugging easier.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
