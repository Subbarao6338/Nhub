import React, { useState, useEffect, useRef } from 'react';

const GameTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'dice', label: 'Dice Roller' },
    { id: 'coin', label: 'Heads or Tails' },
    { id: 'snake', label: 'Snake' },
    { id: '2048', label: '2048' },
    { id: 'sudoku', label: 'Sudoku' },
    { id: 'tictactoe', label: 'Tic-Tac-Toe' },
    { id: 'dino', label: 'Dino Jump' },
    { id: 'tetris', label: 'Tetris' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('dice');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'dice-roller': 'dice',
        'heads-tails': 'coin',
        'magic-8ball': 'magic8',
        'spin-wheel': 'spin-wheel',
        'spin-bottle': 'spin-bottle',
        'team-maker': 'team-maker',
        'tournament-maker': 'tournament',
        'scoreboard': 'scoreboard',
        'chess-clock': 'chess-clock',
        'chess960': 'chess960',
        'darts-scoreboard': 'darts',
        'tictactoe': 'tictactoe',
        'snake-game': 'snake',
        '2048': '2048',
        'dino-jump': 'dino'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`pill ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
      )}

      {activeTab === 'dice' && <DiceRoller onResultChange={onResultChange} />}
      {activeTab === 'coin' && <CoinFlipper onResultChange={onResultChange} />}
      {activeTab === 'snake' && <SnakeGame />}
      {activeTab === '2048' && <Game2048 />}
      {activeTab === 'sudoku' && <SudokuGame />}
      {activeTab === 'tictactoe' && <TicTacToe />}
      {activeTab === 'dino' && <DinoJump />}
      {activeTab === 'tetris' && <TetrisGame />}
      {['chess', 'carrom', 'cricket', 'ludo', 'bouncer'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>casino</span>
              <div>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} game is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const Game2048 = () => {
    const [grid, setGrid] = useState(Array(4).fill().map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);

    const addRandom = (g) => {
        let empty = [];
        for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(g[r][c] === 0) empty.push({r,c});
        if(empty.length) {
            let {r,c} = empty[Math.floor(Math.random()*empty.length)];
            g[r][c] = Math.random() > 0.1 ? 2 : 4;
        }
    };

    const init = () => {
        let newGrid = Array(4).fill().map(() => Array(4).fill(0));
        addRandom(newGrid);
        addRandom(newGrid);
        setGrid(newGrid);
        setScore(0);
    };

    useEffect(() => { init(); }, []);

    const move = (dir) => {
        let newGrid = JSON.parse(JSON.stringify(grid));
        let moved = false;
        let points = 0;

        const rotate = (g) => {
            let res = Array(4).fill().map(() => Array(4).fill(0));
            for(let r=0; r<4; r++) for(let c=0; c<4; c++) res[c][3-r] = g[r][c];
            return res;
        };

        let rotations = { 'left': 0, 'up': 1, 'right': 2, 'down': 3 }[dir];
        for(let i=0; i<rotations; i++) newGrid = rotate(newGrid);

        for(let r=0; r<4; r++) {
            let row = newGrid[r].filter(v => v !== 0);
            for(let i=0; i<row.length-1; i++) {
                if(row[i] === row[i+1]) {
                    row[i] *= 2;
                    points += row[i];
                    row.splice(i+1, 1);
                    moved = true;
                }
            }
            while(row.length < 4) row.push(0);
            if(JSON.stringify(newGrid[r]) !== JSON.stringify(row)) moved = true;
            newGrid[r] = row;
        }

        for(let i=0; i<(4-rotations)%4; i++) newGrid = rotate(newGrid);

        if(moved) {
            addRandom(newGrid);
            setGrid(newGrid);
            setScore(s => s + points);
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            if(e.key === 'ArrowLeft') move('left');
            if(e.key === 'ArrowRight') move('right');
            if(e.key === 'ArrowUp') move('up');
            if(e.key === 'ArrowDown') move('down');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [grid]);

    return (
        <div className="card p-15 text-center">
            <div className="flex-between mb-15"><span>Score: {score}</span></div>
            <div className="grid gap-5 m-auto" style={{gridTemplateColumns: 'repeat(4, 1fr)', width: '240px', background: 'var(--border)', padding: '10px', borderRadius: '12px'}}>
                {grid.flat().map((v, i) => (
                    <div key={i} className="flex-center font-bold" style={{
                        height: '50px', width: '50px',
                        background: v ? (v <= 4 ? 'var(--nature-moss)' : 'var(--nature-gold)') : 'var(--surface)',
                        color: v > 4 ? 'white' : 'inherit',
                        borderRadius: '8px', fontSize: '1.2rem'
                    }}>
                        {v || ''}
                    </div>
                ))}
            </div>
            <div className="grid grid-3 gap-5 mt-15 m-auto" style={{maxWidth: '120px'}}>
                <div/><button className="icon-btn" onClick={()=>move('up')}><span className="material-icons">expand_less</span></button><div/>
                <button className="icon-btn" onClick={()=>move('left')}><span className="material-icons">chevron_left</span></button>
                <button className="icon-btn" onClick={()=>move('down')}><span className="material-icons">expand_more</span></button>
                <button className="icon-btn" onClick={()=>move('right')}><span className="material-icons">chevron_right</span></button>
            </div>
            <button className="btn-primary mt-15" onClick={init}>New Game</button>
        </div>
    );
};

const DiceRoller = ({ onResultChange }) => {
    const [result, setResult] = useState(1);
    const roll = () => {
        const r = Math.floor(Math.random() * 6) + 1;
        setResult(r);
        onResultChange({ text: `Dice Roll: ${r}`, filename: 'dice.txt' });
    };
    return (
        <div className="text-center p-20 card">
            <div style={{fontSize: '5rem', color: 'var(--primary)'}} className="mb-20">
                <span className="material-icons" style={{fontSize: 'inherit'}}>casino</span>
                <div style={{marginTop: '-20px'}}>{result}</div>
            </div>
            <button className="btn-primary w-full" onClick={roll}>Roll Dice</button>
        </div>
    );
};

const SnakeGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let snake = [{x: 10, y: 10}];
        let food = {x: 15, y: 15};
        let dx = 1, dy = 0;
        let nextDx = 1, nextDy = 0;

        const draw = () => {
            if (gameOver) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw food
            ctx.fillStyle = 'var(--nature-gold)';
            ctx.fillRect(food.x * 20, food.y * 20, 18, 18);

            // Draw snake
            ctx.fillStyle = 'var(--nature-primary)';
            dx = nextDx; dy = nextDy;
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};

            if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.find(s => s.x === head.x && s.y === head.y)) {
                setGameOver(true);
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
            } else {
                snake.pop();
            }

            snake.forEach(p => ctx.fillRect(p.x * 20, p.y * 20, 18, 18));
        };

        const handleKey = (e) => {
            if (e.key === 'ArrowUp' && dy === 0) { nextDx = 0; nextDy = -1; }
            if (e.key === 'ArrowDown' && dy === 0) { nextDx = 0; nextDy = 1; }
            if (e.key === 'ArrowLeft' && dx === 0) { nextDx = -1; nextDy = 0; }
            if (e.key === 'ArrowRight' && dx === 0) { nextDx = 1; nextDy = 0; }
        };

        window.addEventListener('keydown', handleKey);
        const it = setInterval(draw, 150);
        return () => { clearInterval(it); window.removeEventListener('keydown', handleKey); };
    }, [gameOver]);

    return (
        <div className="card p-15 text-center">
            <div className="flex-between mb-10"><span>Score: {score}</span>{gameOver && <span style={{color: 'var(--danger)'}}>Game Over!</span>}</div>
            <canvas ref={canvasRef} width="400" height="400" style={{background: '#f0f0f0', borderRadius: '12px', width: '100%', maxWidth: '300px', margin: '0 auto'}} />
            <div className="grid grid-3 gap-5 mt-10" style={{maxWidth: '150px', margin: '10px auto'}}>
                <div /> <button className="pill" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}))}><span className="material-icons">expand_less</span></button> <div />
                <button className="pill" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}))}><span className="material-icons">chevron_left</span></button>
                <button className="pill" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))}><span className="material-icons">expand_more</span></button>
                <button className="pill" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}))}><span className="material-icons">chevron_right</span></button>
            </div>
            {gameOver && <button className="btn-primary mt-10" onClick={() => setGameOver(false)}>Restart</button>}
        </div>
    );
};

const SudokuGame = () => {
    const [grid, setGrid] = useState(Array(81).fill(0));
    const [initial, setInitial] = useState(Array(81).fill(false));
    const [selected, setSelected] = useState(null);

    const generate = () => {
        const newGrid = Array(81).fill(0);
        const isInit = Array(81).fill(false);
        for(let i=0; i<81; i++) {
            if(Math.random() > 0.75) {
                newGrid[i] = Math.floor(Math.random()*9)+1;
                isInit[i] = true;
            }
        }
        setGrid(newGrid);
        setInitial(isInit);
    };

    useEffect(() => { generate(); }, []);

    const setVal = (n) => {
        if (selected === null || initial[selected]) return;
        const next = [...grid];
        next[selected] = n;
        setGrid(next);
    };

    return (
        <div className="card p-20 text-center">
            <div className="grid gap-2 m-auto mb-20" style={{gridTemplateColumns: 'repeat(9, 1fr)', width: '270px', background: 'var(--on-surface)', border: '2px solid var(--on-surface)'}}>
                {grid.map((v, i) => (
                    <div key={i}
                        className={`flex-center cursor-pointer ${selected === i ? 'active' : 'bg-white'}`}
                        style={{
                            height: '30px', fontSize: '0.8rem', border: '1px solid #eee',
                            fontWeight: initial[i] ? '800' : 'normal',
                            color: initial[i] ? 'var(--primary)' : 'inherit',
                            backgroundColor: selected === i ? 'var(--primary-glow)' : 'white'
                        }}
                        onClick={() => setSelected(i)}
                    >
                        {v || ''}
                    </div>
                ))}
            </div>
            <div className="flex-center gap-5 flex-wrap mb-20">
                {[1,2,3,4,5,6,7,8,9,0].map(n => (
                    <button key={n} className="pill" style={{padding: '8px 12px', minWidth: '40px'}} onClick={()=>setVal(n)}>{n === 0 ? 'X' : n}</button>
                ))}
            </div>
            <button className="btn-primary w-full" onClick={generate}>Generate New</button>
        </div>
    );
};

const DinoJump = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameOver) return;
        const ctx = canvas.getContext('2d');
        let dino = { x: 50, y: 150, w: 30, h: 30, dy: 0, jump: -10, gravity: 0.6, grounded: false };
        let obstacles = [];
        let frame = 0;
        let speed = 5;

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ground
            ctx.strokeStyle = 'var(--border)';
            ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(canvas.width, 180); ctx.stroke();

            // Dino
            dino.dy += dino.gravity;
            dino.y += dino.dy;
            if (dino.y + dino.h > 180) { dino.y = 180 - dino.h; dino.dy = 0; dino.grounded = true; }
            else { dino.grounded = false; }
            ctx.fillStyle = 'var(--nature-primary)';
            ctx.fillRect(dino.x, dino.y, dino.w, dino.h);

            // Obstacles
            if (frame % 80 === 0) obstacles.push({ x: canvas.width, y: 150, w: 15, h: 30 });
            obstacles.forEach((o, i) => {
                o.x -= speed;
                ctx.fillStyle = 'var(--danger)';
                ctx.fillRect(o.x, o.y, o.w, o.h);
                if (dino.x < o.x + o.w && dino.x + dino.w > o.x && dino.y < o.y + o.h && dino.y + dino.h > o.y) {
                    setGameOver(true);
                }
            });
            obstacles = obstacles.filter(o => o.x > -20);

            setScore(s => s + 1);
            frame++;
            if (frame % 500 === 0) speed += 0.5;
            if (!gameOver) requestAnimationFrame(loop);
        };

        const handleAction = () => { if (dino.grounded) dino.dy = dino.jump; };
        const kd = e => { if (e.code === 'Space' || e.key === 'ArrowUp') handleAction(); };
        window.addEventListener('keydown', kd);
        canvas.addEventListener('touchstart', handleAction);

        loop();
        return () => { window.removeEventListener('keydown', kd); canvas.removeEventListener('touchstart', handleAction); };
    }, [gameOver]);

    return (
        <div className="card p-15 text-center">
            <div className="flex-between mb-10"><span>Score: {Math.floor(score/10)}</span>{gameOver && <span style={{color: 'var(--danger)'}}>Game Over!</span>}</div>
            <canvas ref={canvasRef} width="400" height="200" style={{background: 'var(--nature-mist)', borderRadius: '12px', width: '100%'}} onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space'}))} />
            <p className="opacity-6 small mt-10">Tap or Space to Jump</p>
            {gameOver && <button className="btn-primary mt-10" onClick={() => { setGameOver(false); setScore(0); }}>Restart</button>}
        </div>
    );
};

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPvp, setIsPvp] = useState(false);
    const [xIsNext, setXIsNext] = useState(true);
    const winner = calculateWinner(board);

    const handleClick = (i) => {
        if (winner || board[i]) return;
        const next = board.slice();
        next[i] = 'X';
        setBoard(next);
        setXIsNext(false);
        if (!isPvp && !calculateWinner(next)) {
            setTimeout(() => {
                const empty = next.map((v, idx) => v === null ? idx : null).filter(v => v !== null);
                if (empty.length) {
                    const move = empty[Math.floor(Math.random() * empty.length)];
                    next[move] = 'O';
                    setBoard([...next]);
                    setXIsNext(true);
                }
            }, 500);
        } else if (isPvp) {
            next[i] = xIsNext ? 'X' : 'O';
            setBoard(next);
            setXIsNext(!xIsNext);
        }
    };

    return (
        <div className="card p-20 text-center">
            <div className="pill-group mb-15 scrollable-x">
                <button className={`pill ${!isPvp ? 'active' : ''}`} onClick={()=>setIsPvp(false)}>vs CPU</button>
                <button className={`pill ${isPvp ? 'active' : ''}`} onClick={()=>setIsPvp(true)}>vs Player</button>
            </div>
            <div className="mb-10 font-bold">{winner ? `Winner: ${winner}` : `Next: ${xIsNext ? 'X' : 'O'}`}</div>
            <div className="grid grid-3 gap-5 m-auto" style={{width: '180px'}}>
                {board.map((v, i) => (
                    <button key={i} className="pill flex-center" style={{height: '55px', width: '55px', fontSize: '1.5rem'}} onClick={() => handleClick(i)}>{v}</button>
                ))}
            </div>
            {(winner || board.every(b=>b)) && <button className="btn-primary mt-15" onClick={() => setBoard(Array(9).fill(null))}>New Game</button>}
        </div>
    );
};

const TetrisGame = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameOver) return;
        const ctx = canvas.getContext('2d');
        const COLS = 10, ROWS = 20, SIZE = 20;
        let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        let piece = { x: 3, y: 0, shape: [[1, 1], [1, 1]] };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            board.forEach((row, y) => row.forEach((v, x) => {
                if (v) { ctx.fillStyle = 'var(--nature-moss)'; ctx.fillRect(x*SIZE, y*SIZE, SIZE-1, SIZE-1); }
            }));
            ctx.fillStyle = 'var(--primary)';
            piece.shape.forEach((row, y) => row.forEach((v, x) => {
                if (v) ctx.fillRect((piece.x+x)*SIZE, (piece.y+y)*SIZE, SIZE-1, SIZE-1);
            }));
        };

        const move = () => {
            piece.y++;
            if (piece.y + piece.shape.length > ROWS) {
                piece.y--;
                piece.shape.forEach((row, dy) => row.forEach((v, dx) => {
                    if (v) board[piece.y+dy][piece.x+dx] = 1;
                }));
                piece = { x: 3, y: 0, shape: [[1,1,1,1]] };
                if (piece.y + piece.shape.length > ROWS) setGameOver(true);
                setScore(s => s + 10);
            }
            draw();
        };

        const it = setInterval(move, 500);
        return () => clearInterval(it);
    }, [gameOver]);

    return (
        <div className="card p-15 text-center">
            <div className="flex-between mb-10"><span>Score: {score}</span></div>
            <canvas ref={canvasRef} width="200" height="400" style={{background: '#000', margin: '0 auto', display: 'block'}} />
            {gameOver && <button className="btn-primary mt-10" onClick={()=>setGameOver(false)}>Restart</button>}
        </div>
    );
};

function calculateWinner(squares) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
}

const CoinFlipper = ({ onResultChange }) => {
    const [res, setRes] = useState('Heads');
    const flip = () => {
        const r = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setRes(r);
        onResultChange({ text: `Coin Flip: ${r}`, filename: 'coin.txt' });
    };
    return (
        <div className="text-center p-20 card">
            <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--primary)'}} className="mb-20">{res}</div>
            <button className="btn-primary w-full" onClick={flip}>Flip Coin</button>
        </div>
    );
};

export default GameTools;
