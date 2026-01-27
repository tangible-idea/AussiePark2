export default function ParkingSpot({ label, onClick }) {
  return (
    <button 
      className="group w-1/3 h-full border-r-2 last:border-r-0 border-dashed border-slate-500/50 relative focus:outline-none"
      onClick={onClick}
    >
      <div className="absolute inset-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-focus:bg-primary/30 group-active:scale-95 transition-all duration-200 flex items-center justify-center border-2 border-transparent group-hover:border-primary/50">
        <div className="bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-sm transform group-hover:scale-110 transition-transform flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-primary"></span>
          {label}
        </div>
      </div>
    </button>
  );
}
