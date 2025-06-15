import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import humanIcon from './img/human.png'; // アイコンのインポート

function App() {
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const [iconPositions, setIconPositions] = useState([]);

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    // モックデータを使用
    setTimeout(() => {
      const mockData = [{ field: '食堂' }, { field: '食堂' }, { field: '食堂' }]; // 例: 3件のデータ
      const count = mockData.length;
      setCongestion(count.toString());
      setLog(JSON.stringify(mockData));
      setIsLoading(false);

      // アイコンの位置を計算
      const numIcons = count * 2; // ログ件数と同じ数
      const positions = [];
      const gridWidth = 5; // グリッドの幅
      for (let i = 0; i < numIcons; i++) {
        const row = Math.floor(i / gridWidth);
        const col = i % gridWidth;
        const x = col * 100 + 50; // グリッドの間隔とオフセット
        const y = row * 100 + 50;
        positions.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        });
      }
      setIconPositions(positions);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchCongestion();
  }, [fetchCongestion]);

  const handleGoNow = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field: '食堂' }),
      });
      if (response.ok) {
        setLog('今行くを記録しました');
      } else {
        setLog(`記録に失敗しました: ${response.status}`);
      }
      fetchCongestion();
    } catch (error) {
      console.error('Error sending go now data:', error);
      console.error('Error details:', error.message, error.stack);
      setLog(error.toString());
    }
  };

  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p>混雑具合: {congestion}</p>
            <button onClick={handleGoNow}>今行く</button>
            <p>Log: {log}</p>
            {iconPositions.map((position, index) => (
              <img
                key={index}
                src={humanIcon}
                alt="human icon"
                  style={{
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    transform: `rotate(${position.rotate}deg)`,
                    width: '200px', // アイコンのサイズ
                  }}
                />
              ))}
            </>
          )}
    </div>
  );
}

export default App;
