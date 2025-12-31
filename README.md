
# 生活品質智慧工程管理系統 - 部署手冊

這是一個專為營造與裝修團隊設計的生產環境系統。

## 🚀 快速部署至 GitHub Pages (免費)

1. **建立 Repo**: 在 GitHub 建立一個名為 `build-track` 的新專案。
2. **上傳檔案**: 將資料夾內所有檔案（含 `index.html`, `App.tsx`, `public/` 等）上傳至 GitHub。
3. **啟動 Pages**: 前往 GitHub 專案的 `Settings` > `Pages`，將 Branch 設為 `main` 並儲存。
4. **設定 Google Drive**: 
   - 複製您的 Pages 網址（例如 `https://username.github.io/build-track/`）。
   - 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)。
   - 在 OAuth 2.0 Client ID 的「已授權的 JavaScript 來源」中貼上該網址。

## 🔑 預設登入資訊
- **帳號**: `admin`
- **密碼**: `1234`

## 🛠 技術架構
- **前端**: React 19 + Tailwind CSS (ESM 模式，免編譯)
- **AI**: Google Gemini API (自動分析風險與法規)
- **儲存**: Google Drive API (雲端自動備份)
