import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { JSONStorage } from '@noodl/platform';

import { api, cognito } from '@noodl-constants/NeueBackend';
import { Model } from '@noodl-utils/model';

import { NeueSession } from './type';

export class NeueService extends Model {
  public static instance: NeueService = new NeueService();

  private session?: NeueSession;

  constructor() {
    super();
  }

  public login(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
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
      this.asyncAuthenticateUser(cognitoUser, authDetails)
        .then((result) => {
          const accessToken = result.getIdToken().getJwtToken();
          this.session = {
            token: accessToken,
            tokenUpdatedAt: Date.now()
          };
          JSONStorage.set('neueSession', this.session);
          resolve(this.session);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  private asyncAuthenticateUser(cognitoUser, cognitoAuthenticationDetails) {
    return new Promise<any>(function (resolve, reject) {
      cognitoUser.authenticateUser(cognitoAuthenticationDetails, {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: resolve
      });
    });
  }

  public check(): boolean {
    return this.session !== undefined;
  }

  public logout() {
    this.reset();
    this.notifyListeners('signedIn', false);
  }

  private reset() {
    console.log('reset');
    this.session = undefined;
    JSONStorage.remove('neueSession');
  }

  public async load() {
    return new Promise<boolean>((resolve) => {
      JSONStorage.get('neueSession').then((data) => {
        const keys = Object.keys(data);
        if (keys && data.tokenUpdatedAt - Date.now() < cognito.tokenLifetime) {
          this.session = data;
          this.notifyListeners('session', this.session);
        } else {
          this.logout();
        }
        resolve(keys.length > 0);
      });
    });
  }

  private performRequest(url: string, method: string, body: any = {}): Promise<Response> {
    const promise = fetch(api.invokeUrl + url, {
      method,
      headers: {
        Authorization: this.session?.token || ''
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    }).then((response) => {
      if (response.status === 401) this.logout();
      return response;
    });
    return promise;
  }

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

  public saveFlow(flow: any) {
    return this.performRequest('/flows', 'POST', { flow });
  }

  public fetchFlow(id: string) {
    return new Promise<any>((resolve) => {
      this.performRequest('/flows/' + id, 'GET').then((response) =>
        response.json().then((data) => {
          if (data.Items) {
            resolve(data.Items[0].flow.S);
          } else {
            resolve('');
          }
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

  public deleteFlow(id: string) {
    return this.performRequest('/flows/' + id, 'DELETE');
  }
}
