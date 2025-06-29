async function startBpmAnalysis() {
  try {
    // マイク入力の取得
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    // AudioContextを明示的に再開
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('AudioContextを再開しました');
    }
    const source = audioContext.createMediaStreamSource(stream);
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(200, audioContext.currentTime);

    const realtimeAnalyzerNode = await createRealTimeBpmProcessor(audioContext, {
      continuousAnalysis: true,
      stabilizationTime: 10000,
      minBpm: 160,
      maxBpm: 200,
      threshold: 0.75
    });

    source.connect(lowpass).connect(realtimeAnalyzerNode);
    source.connect(audioContext.destination);

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
    console.error('マイクアクセスエラー:', err.name, err.message);
    alert(`マイクアクセスに失敗しました。エラー: ${err.name} - ${err.message}\nSafariのマイク許可、HTTPS環境、またはマイクの状態を確認してください。`);
  }
}

// ボタンクリックで解析開始
document.getElementById('startBtn').addEventListener('click', () => {
  startBpmAnalysis();
});
