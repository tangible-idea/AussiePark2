export default function ScenarioCard({ day, time, duration }) {
  return (
    <div className="px-6 pt-6 pb-2">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-8 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-icons-round text-6xl text-primary">schedule</span>
        </div>
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-1">
          Current Scenario
        </h2>
        <p className="text-xl md:text-2xl font-bold leading-tight mb-4">
          It is <span className="text-primary">{day} at {time}</span>.
          Where can you park for <span className="underline decoration-primary decoration-4 underline-offset-2">{duration}</span>?
        </p>
        <div className="flex space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="flex items-center">
            <span className="material-icons-round text-sm mr-1">info</span> 
            Tap the road to park
          </span>
        </div>
      </div>
    </div>
  );
}
