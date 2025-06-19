import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleSelectArea = (areaName) => {
    const areaMap = {
      '食堂': 'syokudo',
      '大浴場': 'daiyokujo',
      'コミュニティスペース': 'communitySpace',
    };
    const path = areaMap[areaName] || areaName; // Fallback in case mapping not found
    navigate(`/congestion/${path}`);
  };

  return (
    <div className="Home">
      <h1>エリアを選んでください</h1>
      <button className="button-style" onClick={() => handleSelectArea('食堂')}>食堂</button>
      <button className="button-style" onClick={() => handleSelectArea('大浴場')}>大浴場</button>
      <button className="button-style" onClick={() => handleSelectArea('コミュニティスペース')}>コミュニティスペース</button>
    </div>
  );
}

export default Home;