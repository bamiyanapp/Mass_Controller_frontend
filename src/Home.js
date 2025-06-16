import React from 'react';

function Home({ onSelect }) {
  return (
    <div className="Home">
      <h1>エリアを選んでください</h1>
      <button onClick={() => onSelect('食堂')}>食堂</button>
      <button onClick={() => onSelect('大浴場')}>大浴場</button>
      <button onClick={() => onSelect('コミュニティスペース')}>コミュニティスペース</button>
    </div>
  );
}

export default Home;
