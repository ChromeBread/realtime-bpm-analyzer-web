async function startBpmAnalysis() {
  try {
    console.log('マイクアクセスをリクエスト中...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('マイクアクセス成功:', stream);
    const audioContext = new AudioContext();
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
    console.error('マイクアクセスエラー:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    alert(`マイクアクセスに失敗しました。\nエラー: ${err.name} - ${err.message}\n1. Safari/Chromeのマイク許可を確認\n2. 他のアプリでマイクが占有されていないか確認\n3. HTTPS環境（またはlocalhost）でテスト\n4. コンソールログを確認してください`);
  }
}

// ボタンクリックで解析開始
document.getElementById('startBtn').addEventListener('click', () => {
  console.log('スタートボタンクリック');
  startBpmAnalysis();
});
