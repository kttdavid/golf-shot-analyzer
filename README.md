# Golf Shot Data Interpreter（高爾夫擊球數據分析）

上傳最多 10 張雷達或模擬器截圖，頁面會讀出數字、判斷球路和穩定度，並寫一份白話報告。支援英文和繁體中文。

這個資料夾是「不用 Claude 帳號也能用」的版本：頁面不變，AI 呼叫改由自己的後端（`api/analyze.js`）送出，API 金鑰放在伺服器上。

## 結構

| 檔案 | 作用 |
|---|---|
| `public/index.html` | 整個前端（畫面、判斷規則、中英文） |
| `public/claude-shim.js` | 在 Claude 以外的瀏覽器裡，把「呼叫 Claude」改送到 `/api/analyze`。在 Claude 裡開啟時它什麼都不做 |
| `api/analyze.js` | 後端：加上 API 金鑰、呼叫 Claude API、回傳 JSON。不儲存、不記錄任何圖片或文字 |
| `dev.js` | 本機測試伺服器（不需要安裝套件）。`MOCK=1` 時回傳假資料，不花 API 費用 |
| `dev-tools/` | 中文翻譯來源和測試腳本（見 `CLAUDE.md`） |

## 一、本機測試（不花錢）

需要 Node 18 以上。

```
npm run dev:mock
```

打開 http://localhost:3000，隨便上傳幾張圖、選一支桿，按分析。看到結果頁就表示整條流程是通的（內容是假資料）。

## 二、本機測試（真的呼叫 Claude）

1. 到 Claude Console（console.anthropic.com）開帳號、儲值、建立 API 金鑰。**Claude Pro 訂閱不含 API 額度，API 要另外付費。**
2. 在 Console 設定「每月花費上限」。這是最可靠的費用保險。
3. 複製 `.env.example` 成 `.env`，填入 `ANTHROPIC_API_KEY`。
4. `npm run dev`，用自己的截圖分析 3 到 5 次，然後到 Console 看用量，就知道每次分析大約多少錢。

## 三、上線（以 Vercel 為例）

1. 把這個資料夾放到 GitHub（`.env` 已在 `.gitignore`，不會被上傳）。
2. 在 Vercel 匯入這個 GitHub 專案。
3. 在 Vercel 的 Environment Variables 填入 `.env.example` 裡的變數，至少要有 `ANTHROPIC_API_KEY`。
4. 部署。
5. 一次分析會花幾十秒。`vercel.json` 設了 60 秒上限，請確認你的 Vercel 方案允許這個長度；如果不允許，分析會中途被中斷。

## 三之二、改用 Google Gemini（有免費額度，尚未用真實截圖驗證品質）

後端也能改呼叫 Gemini。在 Vercel 的 Environment Variables 只填 `GEMINI_API_KEY`（不填 `ANTHROPIC_API_KEY`）就會使用 Gemini；刪掉它、改填 `ANTHROPIC_API_KEY` 就換回 Claude。兩把都填時用 `AI_PROVIDER` 指定。用瀏覽器打開 `/api/analyze` 可以看到目前用的是哪一個、金鑰有沒有設好。報告的提示詞是照 Claude 調的，Gemini 的讀數和報告品質要自己用真實截圖確認。免費額度的圖片可能被 Google 用來改進產品。

## 四、控制費用和濫用

- **Console 每月上限：** 一定要設。
- **`ACCESS_CODE`：** 設了之後，訪客第一次分析時要輸入存取碼。第一輪測試建議開啟，把碼只給測試者。
- **`DAILY_LIMIT_PER_IP`：** 每個 IP 每天的呼叫次數（一次分析約 5 次呼叫）。這是記憶體內計數，伺服器重啟會歸零，只能當輔助，不能取代 Console 上限。

## 五、隱私

球友上傳的截圖會經過你的伺服器，再送到 Claude API。後端不儲存也不記錄內容，但託管服務本身可能有請求記錄。對外開放前，請寫一份簡短的隱私說明，告訴使用者圖片會被送去 AI 分析、不會被保存。

## 六、已知限制

- 沒有用真實的非 Trackman 截圖測過（GC Quad、其他模擬器）。
- 左手球友的正負號、HEIC 圖片沒有實測。
- 發射角、轉速、落地角的參考範圍表還沒放進知識庫，目前只顯示數字，沒有跟標準比。
- AI 寫的中文報告，只有寫作規則，沒有用真實模型跑過整份。
