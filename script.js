// Web Audio APIとrealtime-bpm-analyzerを使用したBPM解析
async function startBpmAnalysis() {
  try {
    // マイク入力の取得
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const lowpass = audioContext.createBiquadFilter(); // ローパスフィルタでノイズ軽減
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(200, audioContext.currentTime); // 低周波（キック）を強調

    // realtime-bpm-analyzerの設定
    const realtimeAnalyzerNode = await createRealTimeBpmProcessor(audioContext, {
      continuousAnalysis: true,
      stabilizationTime: 10000, // 10秒後にデータリセット
      minBpm: 160, // 音ゲー向けに160〜200 BPMを優先
      maxBpm: 200,
      threshold: 0.75 // キックドラムの強いビートを検出しやすく
    });

    // ノードを接続
    source.connect(lowpass).connect(realtimeAnalyzerNode);
    source.connect(audioContext.destination);

    // BPM出力処理
    const bpmOutput = document.getElementById('bpmOutput');
    const stableBpmOutput = document.getElementById('stableBpmOutput');
    realtimeAnalyzerNode.port.onmessage = (event) => {
      if (event.data.message === 'BPM') {
        bpmOutput.textContent = `BPM: ${Math.round(event.data.data.bpm)}`;
      }
      if (event.data.message === 'BPM_STABLE') {
        const bpm = Math.round(event.data.data.bpm);
        stableBpmOutput.textContent = `安定BPM: ${bpm}（音ゲーボス曲: ${bpm >= 170 && bpm <= 190 ? '最適' : '範囲外'}）`;
        stableBpmOutput.style.color = bpm >= 170 && bpm <= 190 ? 'green' : 'red';
      }
    };
  } catch (err) {
    console.error('エラー:', err);
    alert('マイクアクセスに失敗しました。ブラウザの許可を確認してください。');
  }
}

// ボタンクリックで解析開始
document.getElementById('startBtn').addEventListener('click', () => {
  startBpmAnalysis();
});
