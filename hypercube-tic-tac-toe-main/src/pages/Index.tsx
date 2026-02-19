import GameBoard from '@/components/GameBoard';

const Index = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center py-8">
    <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-foreground mb-1">
      ULTIMATE TIC-TAC-TOE
    </h1>
    <p className="text-sm text-muted-foreground mb-6 tracking-wider">
      9 BOARDS · 81 CELLS · THE SENDING RULE
    </p>
    <GameBoard />
  </div>
);

export default Index;
