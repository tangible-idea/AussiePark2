export default function ParkingSign({ type, position }) {
  if (type === '2P') {
    return (
      <div className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2 z-20" style={{ left: `${position}%` }}>
        <div className="w-28 bg-white border-[3px] border-primary rounded-md shadow-sign flex flex-col items-center py-2 px-2 select-none overflow-hidden">
          <div className="flex w-full items-center justify-center mb-2">
            <span className="font-sign font-bold text-primary text-4xl leading-none mr-2">2</span>
            <span className="font-sign font-bold text-primary text-4xl leading-none">P</span>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2">
              <div className="flex items-baseline min-w-0">
                <span className="font-sign font-bold text-primary text-2xl leading-none">8</span>
                <span className="font-sign font-bold text-primary text-xs leading-none" style={{ fontSize: '0.5rem', verticalAlign: 'super' }}>30</span>
                <span className="font-sign font-bold text-primary text-xs leading-none">AM</span>
                <span className="font-sign font-bold text-primary text-xl leading-none mx-1">-</span>
                <span className="font-sign font-bold text-primary text-2xl leading-none">6</span>
              </div>
              <span className="font-sign font-bold text-primary text-xs leading-none">PM</span>
            </div>
            <div className="text-center mt-1">
              <span className="font-sign font-bold text-primary text-xs leading-none" style={{ fontSize: '0.6rem', verticalAlign: 'super' }}>MON - FRI</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 mt-2">
              <div className="flex items-baseline min-w-0">
                <span className="font-sign font-bold text-primary text-2xl leading-none">8</span>
                <span className="font-sign font-bold text-primary text-xs leading-none" style={{ fontSize: '0.5rem', verticalAlign: 'super' }}>30</span>
                <span className="font-sign font-bold text-primary text-xs leading-none">AM</span>
                <span className="font-sign font-bold text-primary text-xl leading-none mx-1">-</span>
                <span className="font-sign font-bold text-primary text-2xl leading-none">12</span>
                <span className="font-sign font-bold text-primary text-xs leading-none" style={{ fontSize: '0.5rem', verticalAlign: 'super' }}>30</span>
              </div>
              <span className="font-sign font-bold text-primary text-xs leading-none">PM</span>
            </div>
            <div className="text-center mt-1">
              <span className="font-sign font-bold text-primary text-xs leading-none">SAT</span>
            </div>
          </div>
          
          <div className="w-full mt-2 flex justify-center">
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 6 L50 6 M50 6 L45 2 M50 6 L45 10" stroke="#006b3f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="w-2 h-24 bg-gray-400 rounded-b-sm shadow-pole relative z-0"></div>
      </div>
    );
  }

  if (type === '1/4P') {
    return (
      <div className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2 z-20" style={{ left: `${position}%` }}>
        <div className="w-28 bg-white border-[3px] border-primary rounded-md shadow-sign flex flex-col items-center py-2 px-2 select-none overflow-hidden">
          <div className="flex w-full items-center justify-center mb-2">
            <div className="relative inline-block mr-1">
              <span className="font-sign font-bold text-primary text-5xl leading-none">1</span>
              <span className="font-sign font-bold text-primary text-3xl leading-none absolute" style={{ top: '50%', left: '100%', transform: 'translate(-20%, -50%) rotate(-25deg)' }}>/</span>
              <span className="font-sign font-bold text-primary text-5xl leading-none absolute" style={{ top: '100%', left: '100%', transform: 'translate(-40%, -100%)' }}>4</span>
            </div>
            <span className="font-sign font-bold text-primary text-6xl leading-none ml-6">P</span>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2">
              <div className="flex items-baseline min-w-0">
                <span className="font-sign font-bold text-primary text-2xl leading-none">9</span>
                <span className="font-sign font-bold text-primary text-xs leading-none">AM</span>
                <span className="font-sign font-bold text-primary text-xl leading-none mx-1">-</span>
                <span className="font-sign font-bold text-primary text-2xl leading-none">5</span>
                <span className="font-sign font-bold text-primary text-xs leading-none" style={{ fontSize: '0.5rem', verticalAlign: 'super' }}>30</span>
              </div>
              <span className="font-sign font-bold text-primary text-xs leading-none">PM</span>
            </div>
            <div className="text-center mt-1">
              <span className="font-sign font-bold text-primary text-sm leading-none">MON - FRI</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 mt-2">
              <div className="flex items-baseline min-w-0">
                <span className="font-sign font-bold text-primary text-2xl leading-none">9</span>
                <span className="font-sign font-bold text-primary text-xs leading-none">AM</span>
                <span className="font-sign font-bold text-primary text-xl leading-none mx-1">-</span>
                <span className="font-sign font-bold text-primary text-2xl leading-none">12</span>
              </div>
              <span className="font-sign font-bold text-primary text-xs leading-none">NOON</span>
            </div>
            <div className="text-center mt-1">
              <span className="font-sign font-bold text-primary text-sm leading-none">SAT</span>
            </div>
          </div>
          
          <div className="w-full mt-2 flex justify-center">
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 6 L50 6 M50 6 L45 2 M50 6 L45 10" stroke="#006b3f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="w-2 h-24 bg-gray-400 rounded-b-sm shadow-pole relative z-0"></div>
      </div>
    );
  }

  return null;
}
