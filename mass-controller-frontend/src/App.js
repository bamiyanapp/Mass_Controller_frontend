import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [congestion, setCongestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  const fetchCongestion = useCallback(async () => {
    setIsLoading(true);
    // モックデータを使用
    setTimeout(() => {
      const mockData = [{ field: '食堂' }, { field: '食堂' }, { field: '食堂' }]; // 例: 3件のデータ
      const count = mockData.length;
      setCongestion(count.toString());
      setLog(JSON.stringify(mockData));
      setIsLoading(false);
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
      const status = response.status;
      const responseText = await response.text();
      if (response.ok) {
        setLog('今行くを記録しました');
        fetchCongestion(); // データを再取得
      } else {
        setLog(`記録に失敗しました: ${status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error sending go now data:', error);
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
          </>
        )}
    </div>
  );
}

export default App;
