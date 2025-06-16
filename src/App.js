import React, { useState } from 'react';
import Home from './Home';
import Congestion from './Congestion';

function App() {
  const [area, setArea] = useState(null);

  return (
    <div className="App">
      {area === null
        ? <Home onSelect={setArea} />
        : <Congestion area={area} onBack={() => setArea(null)} />
      }
    </div>
  );
}

export default App;
