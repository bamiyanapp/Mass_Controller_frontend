import React, { useState, useEffect, useCallback } from 'react';
import humanIcon from './img/human.png';

import syokudoImg from './img/syokudo.jpeg';
import daiyokujoImg from './img/daiyokujo.jpeg';
import communitySpaceImg from './img/communitySpace.jpeg';

function Congestion({ area, onBack }) {
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const [iconPositions, setIconPositions] = useState([]);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  // area に応じた背景画像を選択
  const backgroundImages = {
    '食堂': syokudoImg,
    '大浴場': daiyokujoImg,
    'コミュニティスペース': communitySpaceImg
  };
  const backgroundImage = backgroundImages[area] || syokudoImg; // デフォルト背景

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&field=${encodeURIComponent(area)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();
      const count = data.length;
      setCongestion(count.toString());
      setLog(JSON.stringify(data));
      const positions = Array.from({ length: count * 2 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }));
      setIconPositions(positions);
    } catch (error) {
      console.error(error);
      setLog(error.toString());
    } finally {
      setIsLoading(false);
    }
  }, [API_ENDPOINT, area]);

  useEffect(() => {
    fetchCongestion();
  }, [fetchCongestion]);

  const handleGoNow = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: area }),
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
      <button className="button-style" onClick={onBack}>← 戻る</button>
      <h1>{area} の混雑状況</h1>
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
                animation: `moveRightToLeft ${Math.random() * 5 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
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
