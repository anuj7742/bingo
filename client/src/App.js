import { useEffect, useState } from 'react';
import './App.css';

import socket from './socket';

function App() {

  const [boards, setBoards] = useState([[]]);
  const [selectedBoard, setSelectedBoard] = useState([]);
  const [calledNumber, setCalledNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [calledTime, setCalledTime] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([0]);

  const [timer, setTimer] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [bingoClaimed, setBingoClaimed] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let countdown;

    if (selectedBoard.length > 0 && !gameStarted) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setGameStarted(true);
            socket.emit('start-game');
            return 0;
          }
          return prev - 1;
        })
      }, 1000);
    }
  }, [selectedBoard, gameStarted]);

  useEffect(() => {
    socket.on('choose-boards', (data) => {
      setBoards(data);
      // console.log(data);
    })

    socket.on('number-called', ({ number, time }) => {
      setCalledNumber(number);
      setCalledTime(time);
    })

    socket.on('score-update', (newScore) => {
      // console.log(newScore)
      setScore(newScore);
    })

    socket.on('game-over', ({ message }) => {
      // console.log(message);
      setGameOver(true);
    })

    return () => {
      socket.off('choose-boards');
      socket.off('number-called');
      socket.off('score-update');
      socket.off('game-over')
    }
  });

  const handleBoardSelect = (board) => {
    // console.log(board)
    setSelectedBoard(board);
    socket.emit('select-board', board);
  }

  const handleNumberClick = (number) => {
    if (number === calledNumber && !selectedNumbers.includes(number)) {
      socket.emit('click-number', { number, createdAt: calledTime })

      setSelectedNumbers((prev) =>
        prev.includes(number) ? prev : [...prev, number]
      )
    }else if (!selectedNumbers.includes(number)){
      // setScore((prev) => prev-10);
      socket.emit('wrong-click');
      
    }
  }

  const checkBingo = () => {
    if (bingoClaimed) {
      alert("You have already claimed bingo.");
      return;
    }
    const isBingo = () => {
      const board = toColumnViseBoard(selectedBoard);
      // For row
      for (let i = 0; i < 5; i++) {
        const row = board.slice(i * 5, i * 5 + 5);
        if (row.every(num => selectedNumbers.includes(num))) return true;
      }

      // For col
      for (let i = 0; i < 5; i++) {
        const col = [0, 1, 2, 3, 4].map(j => board[i + j * 5]);
        if (col.every(num => selectedNumbers.includes(num))) return true;
      }

      const dia1 = [0, 6, 12, 18, 24];
      const dia2 = [4, 8, 12, 16, 20];

      if (dia1.every(num => selectedNumbers.includes(board[num]))) return true;
      if (dia2.every(num => selectedNumbers.includes(board[num]))) return true;

      return false;
    }

    if (isBingo()) {
      alert("🎉 BINGO! You Won!");
      setBingoClaimed(true);
      socket.off('number-called')
      setGameOver(true)
      socket.emit('click-number', { number: 0, createdAt: null, Bingo: true });
    } else {
      alert("Not yet, Keep trying");
    }
  }


  // useEffect(() => {
  //   console.log(boards)
  // }, [boards])

  // useEffect(() => {
  //   console.log(selectedBoard)
  // }, [selectedBoard])

  // useEffect(() => {
  //   console.log(score)
  // }, [score])

  // useEffect(()=>{
  //   console.log(selectedNumbers);
  // },[selectedNumbers])

  const toColumnViseBoard = (board) => {
    const columns = [[], [], [], [], []];

    board.forEach((num, i) => {
      columns[i % 5].push(num);
    });

    return columns.flat();
  }

  return (
    <div className="App">
      <h1>Bingo Game</h1>

      {
        selectedBoard.length > 0 ? (
          <>

            <h2>Score: {score}</h2>
            {
              !gameStarted ? (
                <h3>Game Starting in : {timer} seconds</h3>
              ) : (
                !gameOver && <h3>Number Called: {calledNumber || 'Waiting..'}</h3>
              )
            }
            {
              gameOver &&
              <h3>Game Over! </h3>
            }

            <div style={{ display: "grid", justifyContent: "center", gridTemplateColumns: "repeat(5,60px)", gap: "5px", marginTop: "20px" }}>
              {toColumnViseBoard(selectedBoard).map((num, index) => (
                <button
                  key={index}
                  onClick={() => handleNumberClick(num)}
                  style={{
                    height: "60px",
                    width: "60px",
                    fontSize: "20px",
                    backgroundColor: selectedNumbers.includes(num) ? "#FFA500" : "#fff",
                    border: "1px solid #000",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}>
                  {num}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center" }} >
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "18px",
                  backgroundColor: "#ed1313",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                  transition: "transform 0.1s ease-in-out"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onClick={checkBingo}>
                Bingo
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "18px",
                  backgroundColor: "#ed1313",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                  transition: "transform 0.1s ease-in-out"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onClick={() => window.location.reload()}

              >
                New Game
              </button>
            </div>

          </>
        ) : (
          <>
            <h2>Select a Board</h2>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px", }}>
              {
                boards.map((board, boardIndex) => (
                  <div key={boardIndex}
                    style={{
                      border: "1px solid #ccc", padding: "10px", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", borderRadius: "8px", transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    onClick={() => handleBoardSelect(board)}>
                    <h4>Board {boardIndex + 1}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,40px)", gap: "5px" }}>

                      {toColumnViseBoard(board).map((num, numIndex) => (
                        <div key={numIndex} 
                          style={{ 
                            textAlign: "center", border: "1px solid #000", padding: "5px" ,border: "1px solid #000", borderRadius: "6px"
                          }}>
                          {num}
                        </div>
                      ))}
                    </div>

                  </div>

                ))
              }
            </div>
          </>
        )
      }
    </div>
  );
}

export default App;
