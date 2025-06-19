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

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

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
  const [chartData, setChartData] = useState([]);

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
      const response = await fetch(`${API_ENDPOINT}/items?minutes=1&field=${encodeURIComponent(displayAreaName)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();

      console.log('取得データ:', data); // ← logの代わりに出力

      setCongestion(data.length.toString());

      const now = new Date();
      const positions = data.map((item) => {
        const itemTime = new Date(item.time);
        const secondsAgo = (now - itemTime) / 1000;

        let opacity = 1;

        if (secondsAgo > 60) {
          opacity = 0.1; // 60秒以上前はほぼ見えない
        } else if (secondsAgo > 50) {
          opacity = 0.2;
        } else if (secondsAgo > 40) {
          opacity = 0.4;
        } else if (secondsAgo > 30) {
          opacity = 0.6;
        } else if (secondsAgo > 20) {
          opacity = 0.75;
        } else if (secondsAgo > 10) {
          opacity = 0.9;
        } else {
          opacity = 1;
        }

        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity,
          icon: humanIcons[Math.floor(Math.random() * humanIcons.length)],
        };
      });
      setIconPositions(positions);

      const countsPer5Min = new Array(12).fill(0);
      data.forEach(item => {
        const itemTime = new Date(item.time);
        const minutesAgo = (now - itemTime) / (1000 * 60);
        if (minutesAgo >= 0 && minutesAgo <= 60) {
          const index = Math.floor(minutesAgo / 5);
          countsPer5Min[index]++;
        }
      });

      const goNowResponse = await fetch(`${API_ENDPOINT}/items?minutes=5&field=${encodeURIComponent(area)}`);
      const goNowRaw = await goNowResponse.json();
      const goNow = data.filter(item => {
        const itemTime = new Date(item.time);
        const minutesAgo = (now - itemTime) / (1000 * 60);
        return minutesAgo <= 1;
      });
      const goNowCount = goNow.length;
      const predicted5 = Math.round(goNowCount * 1.0);
      const predicted15 = Math.round(goNowCount * 0.6);

      const baseChartData = countsPer5Min.map((count, index) => {
        const end = (index + 1) * 5;
        return {
          name: `~${end}分前`,
          実績: count,
          予測: 0
        };
      });

      baseChartData.unshift(
        { name: '5分後予測', 実績: 0, 予測: predicted5 },
        { name: '15分後予測', 実績: 0, 予測: predicted15 }
      );

      setChartData(baseChartData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_ENDPOINT, displayAreaName, area]);

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
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '200px', background: 'rgba(255,255,255,0.8)', padding: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="実績" fill="#8884d8" />
                <Bar dataKey="予測" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default Congestion;
