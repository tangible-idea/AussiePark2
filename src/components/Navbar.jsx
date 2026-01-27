export default function Navbar({ level, score }) {
  return (
    <nav className="w-full p-4 flex justify-between items-center z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-2">
        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
          LEVEL {level}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Score
        </span>
        <span className="text-2xl font-bold text-primary">{score}</span>
      </div>
    </nav>
  );
}
