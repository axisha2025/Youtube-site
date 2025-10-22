const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // .envファイルから環境変数を読み込む

const app = express();
// CodeSandboxなどホスティング環境に対応するためポートをprocess.env.PORTから取得
const port = process.env.PORT || 3000; 

// 環境変数の取得とチェック
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!API_KEY || !CHANNEL_ID) {
    console.error("エラー: .envファイルにAPI_KEYまたはCHANNEL_IDが設定されていません。");
    process.exit(1);
}

// 静的ファイル（publicフォルダ内のHTML, CSSなど）を公開
app.use(express.static(path.join(__dirname, 'public')));

// YouTube動画一覧を取得するAPIエンドポイント
app.get('/api/videos', async (req, res) => {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

    try {
        const response = await axios.get(url);
        
        // 必要な情報のみを抽出・整形
        const videoList = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium.url 
        }));

        res.json(videoList); 

    } catch (error) {
        console.error('YouTube APIエラー:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: '動画の取得に失敗しました。APIキーまたはチャンネルIDを確認してください。' });
    }
});

// ルート ('/') へのアクセスで index.html を送信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 個別動画の再生ページ (/watch/...) で watch.html を送信
app.get('/watch/:videoId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

app.listen(port, () => {
  console.log(`サーバーが起動しました: http://localhost:${port}`);
});
