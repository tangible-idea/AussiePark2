export default function ParkingSign({ type, position }) {
  if (type === '2P') {
    return (
      <div className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2 z-20" style={{ left: `${position}%` }}>
        <div className="w-24 bg-white border-[3px] border-primary rounded-md shadow-sign flex flex-col items-center py-1 select-none">
          <div className="flex w-full px-1 items-start justify-center">
            <span className="font-display font-bold text-primary text-5xl leading-none">2</span>
            <span className="font-display font-bold text-primary text-3xl mt-1">P</span>
          </div>
          <div className="w-full px-1.5 mt-0.5">
            <div className="flex justify-between items-end border-b border-primary/20 pb-0.5 mb-0.5">
              <div className="flex flex-col text-primary font-display font-bold leading-none">
                <span className="text-sm">8<span className="text-[0.6rem]">30</span><span className="text-[0.6rem] ml-0.5">AM</span></span>
                <span className="text-sm text-center block leading-none">-</span>
                <span className="text-sm">6<span className="text-[0.6rem] ml-0.5">PM</span></span>
              </div>
              <div className="text-primary font-display font-bold text-xs leading-none text-right flex flex-col justify-center h-full">
                <span>MON</span>
                <span className="mx-auto block h-px w-3 bg-primary my-0.5"></span>
                <span>FRI</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col text-primary font-display font-bold leading-none">
                <span className="text-sm">8<span className="text-[0.6rem]">30</span><span className="text-[0.6rem] ml-0.5">AM</span></span>
                <span className="text-sm text-center block leading-none">-</span>
                <span className="text-sm">12<span className="text-[0.6rem]">30</span><span className="text-[0.6rem] ml-0.5">PM</span></span>
              </div>
              <div className="text-primary font-display font-bold text-xs leading-none text-right flex flex-col justify-center h-full">
                <span>SAT</span>
              </div>
            </div>
          </div>
          <div className="w-full px-2 mt-1">
            <div className="h-3 bg-primary w-full relative" style={{clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 20% 100%, 20% 140%, 0% 50%, 20% -40%)"}}></div>
          </div>
        </div>
        <div className="w-2 h-24 bg-gray-400 rounded-b-sm shadow-pole relative z-0"></div>
      </div>
    );
  }

  if (type === '1/4P') {
    return (
      <div className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2 z-20" style={{ left: `${position}%` }}>
        <div className="w-24 bg-white border-[3px] border-primary rounded-md shadow-sign flex flex-col items-center py-1 select-none">
          <div className="flex w-full px-1 items-start justify-center border-b border-primary/20 pb-1">
            <div className="flex items-center">
              <span className="font-display font-bold text-primary text-3xl leading-none">1</span>
              <div className="flex flex-col text-primary font-display font-bold text-lg leading-none mx-0.5">
                <span className="border-b-2 border-primary mb-0.5">/</span>
                <span>4</span>
              </div>
            </div>
            <span className="font-display font-bold text-primary text-4xl mt-0">P</span>
          </div>
          <div className="w-full px-1.5 mt-1">
            <div className="flex justify-between items-center">
              <div className="flex flex-col text-primary font-display font-bold leading-none">
                <span className="text-sm">9<span className="text-[0.6rem] ml-0.5">AM</span></span>
                <span className="text-sm">- 5<span className="text-[0.6rem] ml-0.5">PM</span></span>
              </div>
              <div className="text-primary font-display font-bold text-sm leading-none text-right">
                <span>MON</span>
                <span className="block">- FRI</span>
              </div>
            </div>
          </div>
          <div className="w-full px-2 mt-1 flex space-x-1">
            <div className="h-3 bg-primary flex-1 relative" style={{clipPath: "polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%, 40% 150%, 0% 50%, 40% -50%)"}}></div>
            <div className="h-3 bg-primary flex-1 relative transform rotate-180" style={{clipPath: "polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%, 40% 150%, 0% 50%, 40% -50%)"}}></div>
          </div>
        </div>
        <div className="w-2 h-24 bg-gray-400 rounded-b-sm shadow-pole relative z-0"></div>
      </div>
    );
  }

  return null;
}
