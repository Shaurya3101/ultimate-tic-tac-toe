import { useState, useCallback } from 'react';
import { createGameState, makeMove, canPlayInBoard, GameState } from '@/lib/ultimate-ttt';

function PlayerMark({ value }: { value: 'X' | 'O' }) {
  return (
    <span className={value === 'X' ? 'text-player-x' : 'text-player-o'}>
      {value}
    </span>
  );
}

function BigWinnerOverlay({ winner }: { winner: 'X' | 'O' | 'draw' }) {
  if (winner === 'draw') {
    return (
      <div className="absolute inset-0 bg-muted/80 rounded-md flex items-center justify-center z-10">
        <span className="text-muted-foreground text-lg font-bold">—</span>
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 rounded-md flex items-center justify-center z-10 ${
      winner === 'X' ? 'bg-[hsl(var(--player-x)/0.15)]' : 'bg-[hsl(var(--player-o)/0.15)]'
    }`}>
      <span className={`text-4xl md:text-5xl font-black ${
        winner === 'X' ? 'text-player-x' : 'text-player-o'
      }`}>
        {winner}
      </span>
    </div>
  );
}

export default function GameBoard() {
  const [state, setState] = useState<GameState>(createGameState);

  const handleClick = useCallback((br: number, bc: number, cr: number, cc: number) => {
    setState(prev => makeMove(prev, { br, bc, cr, cc }));
  }, []);

  const reset = () => setState(createGameState());

  const { board, winners, currentPlayer, activeBoard, gameWinner, isDraw } = state;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Status */}
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold tracking-wider">
          {gameWinner ? (
            <span className={gameWinner === 'X' ? 'text-player-x' : 'text-player-o'}>
              {gameWinner} WINS!
            </span>
          ) : isDraw ? (
            <span className="text-muted-foreground">DRAW</span>
          ) : (
            <span>
              Turn: <PlayerMark value={currentPlayer} />
            </span>
          )}
        </div>
        <button
          onClick={reset}
          className="px-4 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors tracking-wide"
        >
          RESET
        </button>
      </div>

      {/* Sending rule hint */}
      {!gameWinner && !isDraw && (
        <div className="text-xs text-muted-foreground tracking-wider">
          {activeBoard
            ? `MUST PLAY IN BOARD (${activeBoard[0]},${activeBoard[1]})`
            : 'FREE CHOICE — PLAY IN ANY BOARD'}
        </div>
      )}

      {/* 3x3 grid of small boards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {Array.from({ length: 3 }, (_, br) =>
          Array.from({ length: 3 }, (_, bc) => {
            const isPlayable = canPlayInBoard(state, br, bc);
            const boardWinner = winners[br][bc];

            return (
              <div
                key={`${br}-${bc}`}
                className={`
                  relative bg-card rounded-md border p-1.5 md:p-2 transition-all duration-200
                  ${isPlayable && !gameWinner && !isDraw
                    ? 'border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                    : 'border-board-border'
                  }
                `}
              >
                {boardWinner && <BigWinnerOverlay winner={boardWinner} />}
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 3 }, (_, cr) =>
                    Array.from({ length: 3 }, (_, cc) => {
                      const value = board[br][bc][cr][cc];
                      const clickable = isPlayable && !value && !boardWinner;

                      return (
                        <button
                          key={`${cr}-${cc}`}
                          onClick={() => handleClick(br, bc, cr, cc)}
                          disabled={!clickable}
                          className={`
                            w-9 h-9 md:w-11 md:h-11 rounded-sm text-sm md:text-base font-bold
                            flex items-center justify-center transition-all duration-150
                            ${clickable
                              ? 'bg-muted/50 hover:bg-cell-hover cursor-pointer'
                              : 'bg-muted/30'
                            }
                            ${value === 'X' ? 'text-player-x' : ''}
                            ${value === 'O' ? 'text-player-o' : ''}
                          `}
                        >
                          {value}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info */}
      <div className="text-[10px] text-muted-foreground tracking-wider max-w-xs text-center leading-relaxed">
        YOUR MOVE SENDS YOUR OPPONENT TO THE MATCHING BOARD. WIN 3 BOARDS IN A ROW TO WIN.
      </div>
    </div>
  );
}
