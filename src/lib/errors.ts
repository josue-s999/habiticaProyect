
'use client';

import { getAuth } from "firebase/auth";

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors that includes
 * rich context about the failed request.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  private auth: any;
  private requestTime: string;

  constructor(context: SecurityRuleContext) {
    const contextualMessage = `
FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(
    {
        // We will populate auth dynamically
        requestTime: new Date().toISOString(),
        operation: context.operation,
        path: context.path,
        requestData: context.requestResourceData,
    },
    null,
    2
)}
`;
    super(contextualMessage);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.requestTime = new Date().toISOString();

    // Dynamically get current auth state
    const authInstance = getAuth();
    this.auth = authInstance.currentUser
      ? {
          uid: authInstance.currentUser.uid,
          token: {
            name: authInstance.currentUser.displayName,
            email: authInstance.currentUser.email,
            email_verified: authInstance.currentUser.emailVerified,
            picture: authInstance.currentUser.photoURL,
          },
        }
      : null;
    
    // Update the message to include the auth state
    this.message = `
FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(
    {
        auth: this.auth,
        requestTime: this.requestTime,
        operation: this.context.operation,
        path: this.context.path,
        requestData: this.context.requestResourceData,
    },
    null,
    2
)}
`;
  }
}
