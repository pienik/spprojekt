import React, { useState, useEffect } from 'react';

// Komponent główny gry
function LoopMasterGame() {
  // Definicje poziomów
  const levels = [
    {
      id: 1,
      title: "Pierwsze kroki",
      description: "Przesuń robota do mety, wykonując te same polecenia kilka razy.",
      gridSize: 5,
      startPosition: { x: 0, y: 2 },
      targetPosition: { x: 4, y: 2 },
      obstacles: [],
      maxCommands: 5,
      hint: "Użyj pętli for, aby powtórzyć polecenie 'moveRight' kilka razy."
    },
    {
      id: 2,
      title: "Omijanie przeszkód",
      description: "Doprowadź robota do celu, omijając przeszkody.",
      gridSize: 5,
      startPosition: { x: 0, y: 0 },
      targetPosition: { x: 4, y: 4 },
      obstacles: [
        { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }
      ],
      maxCommands: 7,
      hint: "Spróbuj połączyć różne ruchy w pętli."
    }
  ];

  // Stan gry
  const [currentLevel, setCurrentLevel] = useState(0);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 2 });
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);

  // Inicjalizacja poziomu
  useEffect(() => {
    if (levels[currentLevel]) {
      setRobotPosition(levels[currentLevel].startPosition);
      setUserCode('');
      setGameStatus('');
      setCommandHistory([]);
    }
  }, [currentLevel]);

  // Funkcje ruchu robota
  const moveRobot = (direction) => {
    setCommandHistory(prev => [...prev, direction]);
    
    setRobotPosition(prev => {
      let newPos = { ...prev };
      
      switch (direction) {
        case 'moveRight':
          newPos.x += 1;
          break;
        case 'moveLeft':
          newPos.x -= 1;
          break;
        case 'moveUp':
          newPos.y -= 1;
          break;
        case 'moveDown':
          newPos.y += 1;
          break;
        default:
          break;
      }
      
      // Sprawdzenie granic planszy
      const level = levels[currentLevel];
      if (newPos.x < 0 || newPos.x >= level.gridSize || 
          newPos.y < 0 || newPos.y >= level.gridSize) {
        setGameStatus('Ups! Robot wyszedł poza planszę.');
        return prev;
      }
      
      // Sprawdzenie kolizji z przeszkodami
      if (level.obstacles.some(obs => obs.x === newPos.x && obs.y === newPos.y)) {
        setGameStatus('Ups! Robot uderzył w przeszkodę.');
        return prev;
      }
      
      // Sprawdzenie czy osiągnięto cel
      if (newPos.x === level.targetPosition.x && newPos.y === level.targetPosition.y) {
        setGameStatus('Brawo! Przeszedłeś ten poziom!');
      }
      
      return newPos;
    });
  };

  // Dodanie bloku kodu
  const addCodeBlock = (blockType) => {
    let newBlock = '';
    
    switch (blockType) {
      case 'forLoop':
        newBlock = 'for (let i = 0; i < 3; i++) {\n  // Kod do powtórzenia\n}';
        break;
      case 'moveRight':
        newBlock = 'moveRight();';
        break;
      case 'moveLeft':
        newBlock = 'moveLeft();';
        break;
      case 'moveUp':
        newBlock = 'moveUp();';
        break;
      case 'moveDown':
        newBlock = 'moveDown();';
        break;
      default:
        break;
    }
    
    setUserCode(prev => prev + (prev ? '\n' : '') + newBlock);
  };

  // Interpretacja i wykonanie kodu użytkownika
  const runCode = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setGameStatus('');
    setCommandHistory([]);
    setRobotPosition(levels[currentLevel].startPosition);
    
    try {
      const moveRight = () => moveRobot('moveRight');
      const moveLeft = () => moveRobot('moveLeft');
      const moveUp = () => moveRobot('moveUp');
      const moveDown = () => moveRobot('moveDown');
      
      // Wykonanie kodu
      const execute = new Function('moveRight', 'moveLeft', 'moveUp', 'moveDown', userCode);
      execute(moveRight, moveLeft, moveUp, moveDown);
      
      setIsRunning(false);
    } catch (error) {
      setGameStatus(`Błąd: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Resetowanie poziomu
  const resetLevel = () => {
    setRobotPosition(levels[currentLevel].startPosition);
    setUserCode('');
    setGameStatus('');
    setCommandHistory([]);
    setIsRunning(false);
  };

  // Przejście do następnego poziomu
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Przejście do poprzedniego poziomu
  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  // Renderowanie planszy gry
  const renderGameBoard = () => {
    const level = levels[currentLevel];
    const gridSize = level.gridSize;
    
    return (
      <div className="mb-4">
        <div 
          className="grid gap-1 bg-blue-100 p-2 rounded-lg border-2 border-blue-300"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${gridSize * 50}px` 
          }}>
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            
            const isRobot = robotPosition.x === x && robotPosition.y === y;
            const isTarget = level.targetPosition.x === x && level.targetPosition.y === y;
            const isObstacle = level.obstacles.some(obs => obs.x === x && obs.y === y);
            
            let cellClass = "w-12 h-12 flex items-center justify-center rounded";
            
            if (isRobot) {
              cellClass += " bg-green-500 text-white";
            } else if (isTarget) {
              cellClass += " bg-red-500 text-white";
            } else if (isObstacle) {
              cellClass += " bg-gray-700";
            } else {
              cellClass += " bg-white border border-gray-300";
            }
            
            return (
              <div key={`${x}-${y}`} className={cellClass}>
                {isRobot && "🤖"}
                {isTarget && !isRobot && "🏁"}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-bold text-center mb-4">Mistrz Pętli</h1>
      
      {/* Informacje o poziomie */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Poziom {currentLevel + 1}: {levels[currentLevel].title}</h2>
          <div className="flex space-x-2">
            <button 
              onClick={prevLevel} 
              disabled={currentLevel === 0}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              ← Poprzedni
            </button>
            <button 
              onClick={nextLevel} 
              disabled={currentLevel === levels.length - 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Następny →
            </button>
          </div>
        </div>
        <p className="mb-2">{levels[currentLevel].description}</p>
        
        <div className="mt-2">
          <button 
            onClick={() => setShowHint(!showHint)} 
            className="text-blue-600 text-sm underline"
          >
            {showHint ? "Ukryj podpowiedź" : "Pokaż podpowiedź"}
          </button>
          {showHint && (
            <div className="mt-1 p-2 bg-yellow-100 rounded text-sm">
              💡 {levels[currentLevel].hint}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Lewa kolumna - plansza i przyciski */}
        <div className="flex flex-col items-center md:w-1/2">
          {renderGameBoard()}
          
          <div className="w-full bg-gray-100 p-3 rounded-lg mb-4">
            <div className="font-bold mb-2">Status:</div>
            <div className={`p-2 rounded ${gameStatus.includes('Brawo') ? 'bg-green-200' : gameStatus ? 'bg-red-200' : 'bg-gray-200'}`}>
              {gameStatus || 'Oczekiwanie na wykonanie kodu...'}
            </div>
          </div>
          
          <div className="w-full bg-gray-100 p-3 rounded-lg">
            <div className="font-bold mb-2">Bloki kodu:</div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => addCodeBlock('forLoop')} 
                className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Pętla for
              </button>
              <button 
                onClick={() => addCodeBlock('moveRight')} 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                moveRight()
              </button>
              <button 
                onClick={() => addCodeBlock('moveLeft')} 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                moveLeft()
              </button>
              <button 
                onClick={() => addCodeBlock('moveUp')} 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                moveUp()
              </button>
              <button 
                onClick={() => addCodeBlock('moveDown')} 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                moveDown()
              </button>
            </div>
          </div>
        </div>
        
        {/* Prawa kolumna - edytor kodu i przyciski kontrolne */}
        <div className="flex flex-col md:w-1/2">
          <div className="bg-gray-100 p-2 rounded-lg mb-4">
            <div className="font-bold mb-2">Twój kod:</div>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full h-48 p-2 font-mono text-sm bg-gray-900 text-green-400 rounded"
              disabled={isRunning}
            ></textarea>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <button
              onClick={runCode}
              disabled={isRunning || !userCode}
              className="flex-grow py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Uruchom
            </button>
            <button
              onClick={resetLevel}
              className="flex-grow py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="font-bold mb-2">Historia komend:</div>
            <div className="max-h-32 overflow-y-auto text-sm font-mono">
              {commandHistory.length > 0 ? (
                commandHistory.map((cmd, idx) => (
                  <div key={idx} className="p-1 border-b border-gray-200">
                    {idx + 1}. {cmd}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">Brak wykonanych komend</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sekcja pomocy */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Jak grać?</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Dodaj bloki kodu, klikając przyciski lub pisz bezpośrednio w edytorze.</li>
          <li>Użyj poleceń moveRight(), moveLeft(), moveUp() i moveDown() by poruszać robotem.</li>
          <li>Użyj pętli, aby wykonać te same instrukcje wielokrotnie.</li>
          <li>Kliknij "Uruchom", aby wykonać swój kod.</li>
          <li>Użyj przycisku "Reset", aby zacząć od nowa.</li>
        </ol>
      </div>
    </div>
  );
}

export default LoopMasterGame;