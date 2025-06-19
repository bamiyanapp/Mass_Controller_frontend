import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import humanIcon from './img/human.png';

import syokudoImg from './img/syokudo.jpg';
import daiyokujoImg from './img/daiyokujo.jpg';
import communitySpaceImg from './img/communitySpace.jpeg';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';




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


  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&field=${encodeURIComponent(displayAreaName)}`);
      if (!response.ok) throw new Error(`status: ${response.status}`);
      const data = await response.json();

      console.log('取得データ:', data); // ← logの代わりに出力

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
        };
      });
      setIconPositions(positions);

    // 15分ごとの集計データを生成
   // 今後30分間のスロット（5分おき）ごとに、何人がその時間にまだ残っているかを計算
   const predictedPast = new Array(6).fill(0); // 0–30分を5分刻みで6区間
   const predictedFuture = new Array(6).fill(0); // 0–30分を5分刻みで6区間
   
const predictedPast = new Array(6).fill(0); // 過去30分の5分ごとの押下数
const predictedFuture = new Array(6).fill(0); // 今後30分間に滞在している人数

data.forEach(item => {
  const itemTime = new Date(item.time);
  const minutesSince = (now - itemTime) / (1000 * 60);

  if (minutesSince >= 0 && minutesSince <= 30) {
    const index = Math.floor(minutesSince / 5); // どの過去スロットか
    predictedPast[index]++;
  }
});

// 過去データを元に、各未来スロットの人数を累積加算
for (let i = 0; i < predictedFuture.length; i++) {
  for (let j = i; j < predictedPast.length; j++) {
    predictedFuture[i] += predictedPast[j];
  }
}




const futureData = predictedFuture.map((count, index) => {
  const start = (index + 1) * 5;
  return {
    name: `${start}分後予測`,
    実績: 0,
    予測: count,
  };
});

setChartData([...futureData.reverse()]);



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
      // style={{
      //   backgroundImage: `url(${backgroundImage})`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   height: '100vh',
      //   width: '100vw',
      //   textAlign: 'center',
      //   position: 'relative',
      //   overflow: 'hidden',
      // }}
    >
      <div className="button-group">
        <button className="button-style" onClick={() => navigate(-1)}>← 戻る</button>
        <button className="button-style" onClick={handleGoNow}>今行く</button>
      </div>

      <h1>{displayAreaName} の混雑状況</h1>
      {isLoading ? <p>読み込み中...</p> : (
        <>
          <p>混雑具合: {congestion}</p>
          <button className="button-style" onClick={handleGoNow}>今行く</button>

          {/* /棒グラフ作成追加 */}
              {chartData.length > 0 && (
      <div className="chart-container">
        <h2 className="chart-title">過去60分の混雑推移＋ 未来予測</h2>
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
