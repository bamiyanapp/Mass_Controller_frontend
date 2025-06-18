import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import humanIcon from './img/human.png';

import syokudoImg from './img/syokudo.jpeg';
import daiyokujoImg from './img/daiyokujo.jpeg';
import communitySpaceImg from './img/communitySpace.jpeg';

function Congestion() {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const [iconPositions, setIconPositions] = useState([]);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const WS_ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

  // 背景画像の選択
  const backgroundImages = {
    '食堂': syokudoImg,
    '大浴場': daiyokujoImg,
    'コミュニティスペース': communitySpaceImg
  };

  const backgroundImage = backgroundImages[area] || syokudoImg;

  // 混雑状況の取得
  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&field=${encodeURIComponent(displayAreaName)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();
      const count = data.length;
      setCongestion(count.toString());
      setLog(JSON.stringify(data));

      const now = new Date();

      const positions = data.map(item => {
        const itemTime = new Date(item.time);
        const minutesAgo = (now - itemTime) / (1000 * 60);

        let opacity = 1;
        if (minutesAgo > 45) opacity = 0.25;
        else if (minutesAgo > 30) opacity = 0.5;
        else if (minutesAgo > 15) opacity = 0.75;

        return {
          x: Math.random() * window.innerWidth, // Adjusted to be within window width
          y: Math.random() * window.innerHeight,
          opacity,
        };
      });

      setIconPositions(positions);
    } catch (error) {
      console.error(error);
      setLog(error.toString());
    } finally {
      setIsLoading(false);
    }
  }, [API_ENDPOINT, displayAreaName]);

  // 初回読み込みとWebSocket設定
  useEffect(() => {
    fetchCongestion();

    const ws = new WebSocket(WS_ENDPOINT);

    ws.onopen = () => {
      console.log('WebSocket接続成功');
    };

    ws.onmessage = (event) => {
      console.log('WebSocket受信:', event.data);
      fetchCongestion(); // 自動更新
    };

    ws.onclose = () => {
      console.log('WebSocket切断');
    };

    ws.onerror = (err) => {
      console.error('WebSocketエラー:', err);
    };

    return () => ws.close(); // クリーンアップ
  }, [fetchCongestion, WS_ENDPOINT]);

  // 「今行く」ボタンの処理
  const handleGoNow = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: displayAreaName }),
      });
      if (response.ok) {
        setLog('記録完了');
        fetchCongestion();
      } else {
        setLog(`失敗: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      setLog(error.toString());
    }
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <button className="button-style" onClick={() => navigate('/')}>← 戻る</button>
      <h1>{displayAreaName} の混雑状況</h1>
      {isLoading ? <p>読み込み中...</p> : (
        <>
          <p>混雑具合: {congestion}</p>
          <button className="button-style" onClick={handleGoNow}>今行く</button>
          <p>Log: {log}</p>
          {iconPositions.map((pos, i) => (
            <img
              key={i}
              src={humanIcon}
              alt="icon"
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y - 50,
                width: 300,
                opacity: pos.opacity,
                animation: `moveRightToLeft ${Math.random() * 5 + 4}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
              className="human-icon-style"
            />
          ))}
        </>
      )}
    </div>
  );
}


export default Congestion;