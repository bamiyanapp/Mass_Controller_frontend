import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import human1 from './img/human1.png';
import human2 from './img/human2.png';
import human3 from './img/human3.png';
import human4 from './img/human4.png';
import human5 from './img/human5.png';
import human6 from './img/human6.png';
import human7 from './img/human7.png';

import syokudoImg from './img/syokudo.jpg';
import daiyokujoImg from './img/daiyokujo.jpg';
import communitySpaceImg from './img/communitySpace.jpg';

const humanIcons = [human1, human2, human3, human4, human5, human6, human7];

function Congestion() {
  const { area } = useParams();
  const navigate = useNavigate();

  const areaMapReverse = {
    syokudo: '食堂',
    daiyokujo: '大浴場',
    communitySpace: 'コミュニティスペース',
  };
  const displayAreaName = areaMapReverse[area] || area;

  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iconPositions, setIconPositions] = useState([]);

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const WS_ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

  const backgroundImages = {
    '食堂': syokudoImg,
    '大浴場': daiyokujoImg,
    'コミュニティスペース': communitySpaceImg,
  };
  const backgroundImage = backgroundImages[displayAreaName] || syokudoImg;

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&field=${encodeURIComponent(displayAreaName)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();

      console.log('取得データ:', data);

      setCongestion(data.length.toString());

      const now = new Date();
      const positions = data.map((item) => {
        const itemTime = new Date(item.time);
        const minutesAgo = (now - itemTime) / (1000 * 60);

        let opacity = 1;
        if (minutesAgo > 45) opacity = 0.25;
        else if (minutesAgo > 30) opacity = 0.5;
        else if (minutesAgo > 15) opacity = 0.75;

        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity,
          icon: humanIcons[Math.floor(Math.random() * humanIcons.length)],
        };
      });
      setIconPositions(positions);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_ENDPOINT, displayAreaName]);

  useEffect(() => {
    fetchCongestion();

    const ws = new WebSocket(WS_ENDPOINT);
    ws.onopen = () => console.log('WebSocket接続成功');
    ws.onmessage = () => fetchCongestion();
    ws.onclose = () => console.log('WebSocket切断');
    ws.onerror = (err) => console.error('WebSocketエラー:', err);

    return () => ws.close();
  }, [fetchCongestion, WS_ENDPOINT]);

  const handleGoNow = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: displayAreaName }),
      });
      if (response.ok) {
        console.log('記録完了');
        fetchCongestion();
      } else {
        console.error(`記録失敗: ${response.status}`);
      }
    } catch (error) {
      console.error('送信エラー:', error);
    }
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
        <button className="button-style" onClick={() => navigate(-1)}>← 戻る</button>
        <button className="button-style" onClick={handleGoNow}>今行く</button>
      </div>

      <h1 style={{ marginTop: '80px', color: 'white', textShadow: '0 0 10px black' }}>
        {displayAreaName} の混雑状況
      </h1>

      {isLoading ? <p style={{ color: 'white' }}>読み込み中...</p> : (
        <>
          <p style={{ color: 'white', fontWeight: 'bold' }}>混雑具合: {congestion}</p>
          {iconPositions.map((pos, i) => (
            <img
              key={i}
              src={pos.icon}
              alt="icon"
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y - 50,
                width: 300,
                opacity: pos.opacity,
                animation: `moveRightToLeft ${Math.random() * 5 + 2}s linear infinite`,
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
