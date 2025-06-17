import React, { useState, useEffect, useCallback } from 'react';
import humanIcon from './img/human.png';

function Congestion({ area, onBack }) {
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const [iconPositions, setIconPositions] = useState([]);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/items?minutes=60&area=${encodeURIComponent(area)}`);
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

  useEffect(() => { fetchCongestion(); }, [fetchCongestion]);

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
    <div>
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
              style={{ position: 'absolute', left: pos.x, top: pos.y - 50, width: 300 }}
              className="human-icon-style"
            />
          ))}
        </>
      )}
    </div>
  );
}

export default Congestion;
