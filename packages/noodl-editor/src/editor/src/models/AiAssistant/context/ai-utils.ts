import * as jwt from 'jsonwebtoken';
import { PromiseUtils, RandomUtils } from '@noodl/platform';

import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';

// NOTE: Would be nice to have a text buffer class where we can write text blocks,
//       perhaps with streaming and then fake stream out the text as it becomes ready.
//       This will create a really nice UX flow while the LLM is processing.
//       Maybe call it something like StreamingTextBuffer?

export namespace AiUtils {
  export function generateSnowflakeId() {
    const timestamp = Date.now().toString(16).padStart(12, '0');
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}`;
  }

  /**
   * Generates a JWT token for authorization with Cloud Run services.
   * The token includes the current user's ID and a session ID, signed with JWT_SECRET.
   *
   * @param options Optional configuration
   * @param options.sessionId Optional session ID. If not provided, a new one will be generated.
   * @param options.jwtSecret Optional JWT secret. If not provided, will use process.env.JWT_SECRET or a default.
   * @param options.expiresIn Token expiration time (default: '1h')
   * @returns The JWT token string
   */
  export function generateAuthToken(options?: { sessionId?: string; jwtSecret?: string; expiresIn?: string }): string {
    const userInfo = LocalUserIdentity.getUserInfo();
    const userId = userInfo.id || 'local';
    const sessionId = options?.sessionId || generateSnowflakeId();
    const jwtSecret =
      options?.jwtSecret ||
      (typeof process !== 'undefined' && process.env?.JWT_SECRET) ||
      'g5KD0pQxC74a1T8fR2V89A3YxLq2C1Sh';
    const expiresIn = options?.expiresIn || '1h';

    const token = jwt.sign(
      {
        user_id: userId,
        session_id: sessionId
      },
      jwtSecret,
      {
        expiresIn: expiresIn
      }
    );

    return token;
  }
}
