import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { JSONStorage } from '@noodl/platform';

import { api, cognito } from '@noodl-constants/NeueBackend';
import { CloudAiClient } from '@noodl-models/AiAssistant/cloud/CloudAiClient';
import { ProjectItem } from '@noodl-utils/LocalProjectsModel';
import { Model } from '@noodl-utils/model';

import { NeueSession } from './type';

export class NeueService extends Model {
  public static instance: NeueService = new NeueService();

  private session?: NeueSession;

  constructor() {
    super();
  }

  public async login(email: string, password: string) {
    console.log('Login started for:', email);

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const userPool = new CognitoUserPool({
      UserPoolId: cognito.userPoolId,
      ClientId: cognito.clientId
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    try {
      // Step 1. Authenticate against Cognito
      // If the code stops here (no log after), your 'authenticate' wrapper
      // isn't handling a specific Cognito challenge (like NewPasswordRequired).
      const session = await this.authenticate(cognitoUser, authDetails);
      console.log('Cognito authentication successful');

      const idToken = session.getIdToken();
      const refreshToken = session.getRefreshToken();

      // Note: refreshToken usually does not have .getExpiration() in standard AWS SDK
      // The ?. protects it, but it likely returns null.
      const tokens = {
        email,
        token: idToken.getJwtToken(),
        refreshToken: refreshToken.getToken(),
        tokenExpiresAt: idToken.getExpiration() * 1000,
        refreshTokenExpiresAt: refreshToken.getExpiration?.() ?? null,
        tokenUpdatedAt: Date.now()
      };

      this.session = tokens;

      // Persist session immediately
      try {
        JSONStorage.set('neueSession', this.session);
      } catch (err) {
        console.warn('Failed to persist session to storage:', err);
      }

      // Step 2. Exchange Cognito token for internal AI token
      // We wrap this in a separate try/catch so login succeeds even if AI fails
      try {
        console.log('Attempting AI Token exchange...');
        await CloudAiClient.exchangeTokenForAi(tokens.token);
        console.log('AI Token exchange successful');
      } catch (aiError) {
        console.error('AI Token exchange failed, but proceeding with login:', aiError);
        // Optional: decide if you want to throw here to block login
        // throw aiError;
      }

      return this.session;
    } catch (error) {
      console.error('Fatal Login Error:', error);
      throw error;
    }
  }

  private requireSession(): NeueSession {
    if (!this.session) {
      throw new Error('No active session. User must be logged in.');
    }
    return this.session;
  }

  private async refreshCognitoToken(): Promise<void> {
    const session = this.requireSession();

    const pool = new CognitoUserPool({
      UserPoolId: cognito.userPoolId,
      ClientId: cognito.clientId
    });

    const user = new CognitoUser({
      Username: session.email,
      Pool: pool
    });

    const refreshToken = new CognitoRefreshToken({
      RefreshToken: session.refreshToken
    });

    const refreshed = await new Promise<CognitoUserSession>((resolve, reject) => {
      user.refreshSession(refreshToken, (err, newSession) => {
        if (err) reject(err);
        else resolve(newSession);
      });
    });

    const idToken = refreshed.getIdToken();
    const refreshTok = refreshed.getRefreshToken();

    this.session = {
      ...session,
      token: idToken.getJwtToken(),
      refreshToken: refreshTok.getToken(),
      tokenExpiresAt: idToken.getExpiration() * 1000,
      tokenUpdatedAt: Date.now()
    };

    try {
      JSONStorage.set('neueSession', this.session);
    } catch (err) {
      console.warn('Failed to persist refreshed token to storage:', err);
    }
  }

  public async getValidAiToken(): Promise<string> {
    if (!this.session) {
      const ok = await this.load();
      if (!ok) throw new Error('Not authenticated');
    }

    const session = this.requireSession();
    const now = Date.now();

    // 1. Refresh Cognito ID token if needed
    if (session.tokenExpiresAt && now >= session.tokenExpiresAt - 15000) {
      await this.refreshCognitoToken();
    }

    const updated = this.requireSession();
    const aiToken = updated.aiToken;
    const aiExpires = updated.aiTokenExpiresAt;

    const expired = !aiToken || !aiExpires || aiExpires <= now;

    // 2. Refresh AI token if needed
    if (expired) {
      const newToken = await CloudAiClient.exchangeTokenForAi(updated.token);
      const decoded = this.decodeJwt(newToken);
      const expiresAt = decoded.exp * 1000;

      this.session = {
        ...updated,
        aiToken: newToken,
        aiTokenExpiresAt: expiresAt
      };

      try {
        JSONStorage.set('neueSession', this.session);
      } catch (err) {
        console.warn('Failed to persist AI token to storage:', err);
      }

      return newToken;
    }

    return aiToken;
  }

  private decodeJwt(token: string): any | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;

      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      return null;
    }
  }

  private authenticate(cognitoUser: CognitoUser, authDetails: AuthenticationDetails): Promise<any> {
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: resolve
      });
    });
  }

  public check(): boolean {
    return this.session !== undefined;
  }

  public getCurrentNeueSession() {
    return this.session;
  }

  public logout() {
    this.notifyListeners('signedIn', false);
    // Clear AI JWT and Cognito tokens
    if (this.session) {
      this.session.aiToken = undefined;
      this.session.token = '';
      this.session.refreshToken = '';
      try {
        JSONStorage.set('neueSession', this.session);
      } catch (err) {
        console.warn('Failed to clear session from storage:', err);
      }
    }
    return this.reset();
  }

  private reset() {
    this.session = undefined;
    return JSONStorage.remove('neueSession');
  }

  public async load() {
    return new Promise<boolean>((resolve) => {
      JSONStorage.get('neueSession')
        .then((data) => {
          const keys = Object.keys(data);

          if (keys && data.tokenUpdatedAt - Date.now() < cognito.tokenLifetime) {
            const userPool = new CognitoUserPool({
              UserPoolId: cognito.userPoolId,
              ClientId: cognito.clientId
            });
            const cognitoUser = new CognitoUser({
              Username: data.email,
              Pool: userPool
            });
            cognitoUser.refreshSession({ getToken: () => data.refreshToken }, (err, session) => {
              if (err) {
                console.log(err);
                resolve(false);
              } else {
                this.session = {
                  email: data.email,
                  refreshToken: data.refreshToken,
                  token: session.getIdToken().getJwtToken(),
                  tokenUpdatedAt: Date.now(),
                  tokenExpiresAt: session.getIdToken().getExpiration() * 1000
                };
                try {
                  JSONStorage.set('neueSession', this.session);
                } catch (err) {
                  console.warn('Failed to persist loaded session to storage:', err);
                }
                resolve(true);
              }
            });
            this.notifyListeners('session', this.session);
          } else {
            this.logout();
            resolve(false);
          }
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  private performRequest(url: string, method: string, body: any = {}): Promise<Response> {
    const token = this.session ? this.session.token : '';
    const promise = fetch(api.invokeUrl + url, {
      method,
      headers: {
        Authorization: token
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    }).then((response) => {
      if (response.status === 401) this.logout();
      return response;
    });
    return promise;
  }

  // DEVICES
  public fetchDevices() {
    return new Promise<Array<string>>((resolve) => {
      this.performRequest('/devices', 'GET')
        .then((response) => {
          response.json().then((data) => {
            resolve(data);
          });
        })
        .catch((err) => {
          console.log(err);
          this.logout();
        });
    });
  }

  // FLOW
  public saveFlow(flow: any) {
    return new Promise<string>((resolve) => {
      this.performRequest('/flows', 'POST', { flow }).then((response) =>
        response.json().then((data) => {
          resolve(data);
        })
      );
    });
  }

  public fetchFlow(id: string) {
    return new Promise<any>((resolve) => {
      this.performRequest('/flows/' + id, 'GET').then((response) =>
        response.json().then((data) => {
          resolve(JSON.parse(data));
        })
      );
    });
  }

  public updateFlow(id: string, flow: any) {
    return this.performRequest('/flow', 'PUT', { id, flow });
  }

  public fetchFlowIds() {
    return new Promise<Array<string>>((resolve) => {
      this.performRequest('/flows/id', 'GET').then((response) => response.json().then((data) => resolve(data)));
    });
  }

  public fetchFlows() {
    return new Promise<Array<any>>((resolve) => {
      this.performRequest('/flows', 'GET').then((response) => response.json().then((data) => resolve(data)));
    });
  }

  public deployFlow(deviceid: string, flow: string) {
    return this.performRequest('/devices/deploy', 'POST', { deviceid, flow });
  }

  public pushFlow(deviceid: string, flow: string, firmware: string) {
    return this.performRequest('/devices/push', 'POST', { deviceid, flow, firmware });
  }

  public deleteFlow(id: string) {
    return this.performRequest('/flows/' + id, 'DELETE');
  }

  // PROJECT
  public saveProject(fileData: ArrayBuffer | Blob, projectItem: ProjectItem, config: string) {
    return new Promise<ProjectItem>((resolve) => {
      this.performRequest('/project', 'POST', { ...projectItem, config }).then((response) =>
        response.json().then(async (presignedInfo) => {
          const form = new FormData();
          Object.entries(presignedInfo.fields).forEach(([field, value]) => {
            const str = value as string;
            form.append(field, str);
          });

          if (fileData instanceof ArrayBuffer) form.append('file', new Blob([fileData], { type: 'application/zip' }));
          else form.append('file', fileData);

          const result = await fetch(presignedInfo.url, {
            method: 'POST',
            body: form
          });
          resolve(presignedInfo.item);
        })
      );
    });
  }

  public fetchProject(id: string) {
    return new Promise<[ArrayBuffer, string]>((resolve, reject) => {
      this.performRequest('/project/' + id, 'GET').then((response) => {
        if (response.status !== 200) reject();
        response.json().then(async (data) => {
          fetch(data.url, { method: 'GET' }).then((response) => {
            response.arrayBuffer().then((buffer) => {
              resolve([buffer, data.config]);
            });
          });
        });
      });
    });
  }

  public updateProject(id: string, flow: any) {
    // TODO: Implement
    // return this.performRequest('/project', 'PUT', { id, flow });
  }

  public listProjects() {
    return new Promise<Array<ProjectItem>>((resolve) => {
      this.performRequest('/project', 'GET').then((response) => response.json().then((data) => resolve(data)));
    });
  }

  public deleteProject(id: string) {
    return new Promise<[ArrayBuffer, string]>((resolve) => {
      this.performRequest('/project/' + id, 'DELETE').then((response) =>
        response.json().then(async (data) => {
          resolve(data);
        })
      );
    });
  }

  // PROJECT TEMPLATES
  public saveTemplate(
    fileData: ArrayBuffer | Blob,
    projectItem: { id?: string; title: string; desc: string; category: string; iconURL?: string }
  ) {
    return new Promise<ProjectItem>((resolve) => {
      this.performRequest('/project/templates', 'POST', { ...projectItem }).then((response) =>
        response.json().then(async (presignedInfo) => {
          const form = new FormData();
          Object.entries(presignedInfo.fields).forEach(([field, value]) => {
            const str = value as string;
            form.append(field, str);
          });

          if (fileData instanceof ArrayBuffer) form.append('file', new Blob([fileData], { type: 'application/zip' }));
          else form.append('file', fileData);

          const result = await fetch(presignedInfo.url, {
            method: 'POST',
            body: form
          });
          resolve(presignedInfo.item);
        })
      );
    });
  }

  public fetchProjectTemplates() {
    return new Promise<[any]>((resolve) => {
      this.performRequest('/project/templates', 'GET').then((response) =>
        response.json().then(async (data) => {
          const templates = data.map((element: any) => {
            return {
              iconURL: element.iconURL,
              title: element.title,
              desc: element.desc,
              category: element.category,
              projectURL: element.id,
              useCloudServices: false,
              cloudServicesTemplateURL:
                'https://shthy94udd.execute-api.eu-west-1.amazonaws.com/dev2/project/20c77d05-8092-8da0-ccf9-6a16367f2e36'
            };
          });
          resolve(templates);
        })
      );
    });
  }

  public fetchProjectTemplate(id: string) {
    return new Promise<[ArrayBuffer, string]>((resolve, reject) => {
      this.performRequest('/project/templates/' + id, 'GET').then((response) => {
        if (response.status !== 200) reject();
        response.json().then(async (data) => {
          fetch(data.url, { method: 'GET' }).then((response) => {
            response.arrayBuffer().then((buffer) => {
              resolve([buffer, data.config]);
            });
          });
        });
      });
    });
  }

  public deployToSandbox(projectID: string, files: File[]) {
    return new Promise<ProjectItem>((resolve) => {
      files.forEach((file) => {
        const form = new FormData();
        form.append('content', file);
        let filename = file.name;
        const fileEnding = filename.split('.').pop();
        let contentType = 'text/javascript';
        switch (fileEnding) {
          case 'js':
            contentType = 'text/javascript';
            break;
          case 'html':
            contentType = 'text/html';
            break;
          case 'css':
            contentType = 'text/css';
            break;
          case 'json':
            contentType = 'application/json';
            break;
          case 'ttf':
            contentType = 'font/ttf';
            break;
          case 'png':
            contentType = 'image/png';
            break;
          default:
            contentType = 'text/text';
        }
        filename = filename.replace(/\\/g, '/');
        if (filename[0] === '-') filename = filename.slice(1);
        if (filename[0] === '/') filename = filename.slice(1);
        // filename = projectID + '/' + filename;
        fetch(`${api.invokeUrl}/project/sandbox/${filename}`, {
          method: 'PUT',
          headers: {
            Authorization: this.session ? this.session.token : '',
            'Content-Type': contentType
          },
          body: file
        }).then((response) => {
          console.log(response);
        });
      });
    });
  }
}
