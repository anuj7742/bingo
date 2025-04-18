import { useEffect, useState } from 'react';
import './App.css';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

  const [showRules, setShowRules] = useState(false);
  const [wrongClickedForCurrNumber, setWrongClickedForCurrNumber] = useState()
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
    })

    socket.on('number-called', ({ number, time }) => {
      setCalledNumber(number);
      setCalledTime(time);
      setWrongClickedForCurrNumber(false);
    })

    socket.on('score-update', (newScore) => {
      
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
    if (!calledNumber || selectedNumbers.includes(number) || gameOver) return;

    if (number === calledNumber) {
      if (!selectedNumbers.includes(number)) {
        socket.emit('click-number', { number, createdAt: calledTime })

        setSelectedNumbers((prev) =>
          prev.includes(number) ? prev : [...prev, number]
        )
      }
    }
    else {
      if (!wrongClickedForCurrNumber && !selectedNumbers.includes(calledNumber)) {
        setWrongClickedForCurrNumber(true);
        toast.error("Wrong number! 10 points deducted.", {
          position: "top-center",
          autoClose:2000
        })
        socket.emit('wrong-click');

      }
    }
  }

  const checkBingo = () => {
    if (bingoClaimed) {
      toast.info("You have already claimed Bingo!", {
        position: "top-center",
        autoClose:2000
      });
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
      toast.success("🎉 BINGO! You did it!" , {
        position: "top-center",
        autoClose:2000
      })
      setBingoClaimed(true);
      setGameOver(true)
      socket.emit('click-number', { number: 0, createdAt: null, Bingo: true });
    } else {
      if(!gameOver){
        toast.warn("Not yet, Keep trying!" , {
          position: "top-center",
          autoClose:2000
        });
      }else{
        toast.warn("Not a Bingo, Start new game." , {
          position: "top-center",
          autoClose:2000
        });
      }
      
    }
  }


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
      <button
        style={{
          position: 'fixed', left: 10, top: 10,
          padding: "10px 20px",
          fontSize: "10px",
          backgroundColor: "#ed1313",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          transition: "transform 0.1s ease-in-out"
        }}
        onClick={() => setShowRules(true)}>
        Show Rules
      </button>

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
                            textAlign: "center", border: "1px solid #000", padding: "5px", border: "1px solid #000", borderRadius: "6px"
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

      {
        showRules && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
              justifyContent: "center", alignItems: "center", zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: "#fff", padding: "20px", borderRadius: "10px",
                width: '300px', textAlign: 'left'
              }}
            >
              <h3>Bingo Rules</h3>
              <ul style={{ fontSize: '15px' }}>
                <li>Select one of the given boards.</li>
                <li>Wait for the number to be called.</li>
                <li>Click the number on the board if it matches.</li>
                <li>Faster clicks = more points (within 2s = 100, 4s = 70, else 20).</li>
                <li>Wrong clicks deduct 10 points.</li>
                <li>Click "Bingo" when you complete a row, column or diagonal. You will get 1000 points.</li>
              </ul>

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
                onClick={() => setShowRules(false)}>
                Close
              </button>
            </div>

          </div>
        )
      }
      <ToastContainer/>
    </div>
  );
}

export default App;
