export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type SmallBoard = CellValue[][];
export type BigBoard = SmallBoard[][];
// Who won each small board
export type BoardWinners = (Player | 'draw' | null)[][];

export function createSmallBoard(): SmallBoard {
  return Array.from({ length: 3 }, () => Array(3).fill(null));
}

export function createBigBoard(): BigBoard {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => createSmallBoard())
  );
}

export function createBoardWinners(): BoardWinners {
  return Array.from({ length: 3 }, () => Array(3).fill(null));
}

const LINES: [number, number][][] = [
  [[0,0],[0,1],[0,2]],
  [[1,0],[1,1],[1,2]],
  [[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0]],
  [[0,1],[1,1],[2,1]],
  [[0,2],[1,2],[2,2]],
  [[0,0],[1,1],[2,2]],
  [[0,2],[1,1],[2,0]],
];

export function checkSmallWinner(board: SmallBoard): Player | null {
  for (const line of LINES) {
    const vals = line.map(([r, c]) => board[r][c]);
    if (vals[0] && vals[0] === vals[1] && vals[1] === vals[2]) return vals[0];
  }
  return null;
}

export function isSmallBoardFull(board: SmallBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

export function checkBigWinner(winners: BoardWinners): Player | null {
  for (const line of LINES) {
    const vals = line.map(([r, c]) => winners[r][c]);
    if (vals[0] && vals[0] !== 'draw' && vals[0] === vals[1] && vals[1] === vals[2]) {
      return vals[0] as Player;
    }
  }
  return null;
}

export function countWins(winners: BoardWinners, player: Player): number {
  let count = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (winners[r][c] === player) count++;
  return count;
}

export function isBigBoardComplete(winners: BoardWinners): boolean {
  return winners.every(row => row.every(cell => cell !== null));
}

export type Coord = { br: number; bc: number; cr: number; cc: number };

export interface GameState {
  board: BigBoard;
  winners: BoardWinners;
  currentPlayer: Player;
  activeBoard: [number, number] | null; // null = free choice
  gameWinner: Player | null;
  isDraw: boolean;
}

export function createGameState(): GameState {
  return {
    board: createBigBoard(),
    winners: createBoardWinners(),
    currentPlayer: 'X',
    activeBoard: null,
    gameWinner: null,
    isDraw: false,
  };
}

export function canPlayInBoard(state: GameState, br: number, bc: number): boolean {
  if (state.gameWinner || state.isDraw) return false;
  if (state.winners[br][bc] !== null) return false;
  if (state.activeBoard === null) return true;
  return state.activeBoard[0] === br && state.activeBoard[1] === bc;
}

export function makeMove(state: GameState, coord: Coord): GameState {
  const { br, bc, cr, cc } = coord;
  if (!canPlayInBoard(state, br, bc)) return state;
  if (state.board[br][bc][cr][cc] !== null) return state;

  // Deep clone
  const newBoard = state.board.map(row =>
    row.map(sb => sb.map(r => [...r]))
  );
  const newWinners = state.winners.map(r => [...r]);

  newBoard[br][bc][cr][cc] = state.currentPlayer;

  // Check if this small board is now won
  const smallWin = checkSmallWinner(newBoard[br][bc]);
  if (smallWin) {
    newWinners[br][bc] = smallWin;
  } else if (isSmallBoardFull(newBoard[br][bc])) {
    newWinners[br][bc] = 'draw';
  }

  // Check big winner
  const bigWin = checkBigWinner(newWinners);
  let isDraw = false;
  if (!bigWin && isBigBoardComplete(newWinners)) {
    const xWins = countWins(newWinners, 'X');
    const oWins = countWins(newWinners, 'O');
    // If tied count, it's a draw; otherwise most boards wins
    if (xWins === oWins) isDraw = true;
    // else the "winner" by count — we'll treat it as a win
  }

  // Determine next active board (sending rule)
  let nextActive: [number, number] | null = [cr, cc];
  if (newWinners[cr][cc] !== null) {
    nextActive = null; // target board is done, free choice
  }

  const gameWinner = bigWin || (!bigWin && isBigBoardComplete(newWinners) && !isDraw
    ? (countWins(newWinners, 'X') > countWins(newWinners, 'O') ? 'X' : 'O')
    : null);

  return {
    board: newBoard,
    winners: newWinners,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    activeBoard: nextActive,
    gameWinner,
    isDraw,
  };
}
