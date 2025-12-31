
/**
 * Google Drive 同步服務 - 生活品質工程管理系統專用 (自動化版本)
 */

// 已預設內建 Client ID，使用者無需手動輸入
export const DEFAULT_CLIENT_ID = '942477382214-k7f0n0745v681b37q6mrv36a5tupatof.apps.googleusercontent.com'; 
export const BACKUP_FILENAME = 'life_quality_system_data.json';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private isInitialized: boolean = false;

  async init(clientId: string = DEFAULT_CLIENT_ID) {
    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      const google = window.google;
      if (!google || !google.accounts) {
        console.error('Google SDK 尚未載入');
        return reject('SDK_NOT_LOADED');
      }

      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error !== undefined) {
              console.error('OAuth Error:', response.error);
              reject(response);
            }
            this.accessToken = response.access_token;
            this.isInitialized = true;
            resolve();
          },
        });
        this.isInitialized = true;
        resolve();
      } catch (err) {
        console.error('Drive Init Failed:', err);
        reject(err);
      }
    });
  }

  async authenticate(prompt: 'none' | 'consent' = 'none') {
    return new Promise<string>((resolve, reject) => {
      if (!this.tokenClient) {
        // 如果尚未初始化，先執行預設初始化
        this.init().then(() => this.requestToken(prompt, resolve, reject)).catch(reject);
      } else {
        this.requestToken(prompt, resolve, reject);
      }
    });
  }

  private requestToken(prompt: string, resolve: any, reject: any) {
    this.tokenClient.callback = (response: any) => {
      if (response.error) {
          if (prompt === 'none') {
              return this.authenticate('consent').then(resolve).catch(reject);
          }
          return reject(response);
      }
      this.accessToken = response.access_token;
      resolve(this.accessToken!);
    };
    this.tokenClient.requestAccessToken({ prompt: prompt === 'none' ? '' : 'consent' });
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!this.accessToken) {
        await this.authenticate();
    }
    
    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (res.status === 401) {
        this.accessToken = null;
        await this.authenticate('consent');
        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
    }
    return res;
  }

  async findBackupFile() {
    try {
      const url = `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and trashed=false&fields=files(id,name)`;
      const response = await this.fetchWithAuth(url);
      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0] : null;
    } catch (e) {
      console.error('Find File Error:', e);
      return null;
    }
  }

  async saveToCloud(data: any) {
    if (!this.isInitialized) await this.init();
    try {
        const existingFile = await this.findBackupFile();
        const metadata = { name: BACKUP_FILENAME, mimeType: 'application/json' };
        const fileContent = JSON.stringify({
            ...data,
            cloudSyncTimestamp: new Date().toISOString()
        });
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        let method = 'POST';

        if (existingFile) {
          url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
          method = 'PATCH';
        }

        const response = await this.fetchWithAuth(url, { method, body: form });
        return response.ok;
    } catch (err) {
        console.error('Save to Drive failed:', err);
        return false;
    }
  }

  async loadFromCloud(): Promise<any | null> {
    if (!this.isInitialized) await this.init();
    try {
        const existingFile = await this.findBackupFile();
        if (!existingFile) return null;
        const url = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
        const response = await this.fetchWithAuth(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.error('Load from Drive failed:', err);
        return null;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
