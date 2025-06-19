import React, { useState, useEffect, useCallback } from 'react';
import humanIcon from './img/human.png';

import syokudoImg from './img/syokudo.jpeg';
import daiyokujoImg from './img/daiyokujo.jpeg';
import communitySpaceImg from './img/communitySpace.jpeg';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

function Congestion({ area, onBack }) {
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const [iconPositions, setIconPositions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&field=${encodeURIComponent(area)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();
      setLog(JSON.stringify(data));

      const now = new Date();
      const count = data.length;
      setCongestion(count.toString());

      const positions = data.map(item => {
        const itemTime = new Date(item.time);
        const minutesAgo = (now - itemTime) / (1000 * 60);
        let opacity = 1;
        if (minutesAgo > 45) opacity = 0.25;
        else if (minutesAgo > 30) opacity = 0.5;
        else if (minutesAgo > 15) opacity = 0.75;

        return {
          x: Math.random() * window.innerWidth + window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: opacity,
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

      // 直近5分間の"今行く"データ取得
      const goNowResponse = await fetch(`${API_ENDPOINT}/items?minutes=5&field=${encodeURIComponent(area)}`);
      const goNowRaw = await goNowResponse.json();
      const goNow = goNowRaw.filter(item => item.type === 'go_now');

      const goNowCount = goNow.length;
      const predicted5 = Math.round(goNowCount * 1.0);
      const predicted15 = Math.round(goNowCount * 0.6);

      const baseChartData = countsPer5Min.map((count, index) => {
        const start = index * 5;
        const end = start + 5;
        return {
          name: `-${end}分前`,
          実績: count,
          予測: 0
        };
      });

      baseChartData.push(
        { name: '5分後予測', 実績: 0, 予測: predicted5 },
        { name: '15分後予測', 実績: 0, 予測: predicted15 }
      );

      setChartData(baseChartData);

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
        body: JSON.stringify({ field: area, type: 'go_now' }),
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

          {chartData.length > 0 && (
            <div className="chart-container">
              <h2 className="chart-title">過去60分の混雑推移 ＋ 未来予測</h2>
              <ResponsiveContainer width="95%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="実績" fill="#8884d8" />
                  <Bar dataKey="予測" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

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
