# リアルタイムBPM解析（音ゲーボス曲向け）

## 概要
マイク入力からリアルタイムでBPMを解析し、音楽ゲームのボス曲で多い170〜190 BPMを優先的に検出するWebアプリです。クラブイベントのVJが音ゲージャンルの選曲でBPMを手動で探る手間を省くために設計されています。

## 特徴
- **クロスプラットフォーム**: iPhone、Android、Windows、Macの主要ブラウザで動作
- **リアルタイム解析**: Web Audio APIを使用し、マイクから入力された音声のBPMを継続的に解析
- **音ゲー向け最適化**: 170〜190 BPMを優先検出。安定したBPMを強調表示
- **オープンソース**: MITライセンスで公開

## インストール
1. リポジトリをクローン:
   ```bash
   git clone https://github.com/ChromeBread/realtime-bpm-analyzer-web.git
   cd realtime-bpm-analyzer-web
