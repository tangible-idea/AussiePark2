const COLORS = {
  primary: '#006b3f',
  loading: '#e31e24',
};

const Header = ({ type }) => {
  if (type === 'P10') {
    return (
      <div className="w-full flex items-start justify-center mb-2 translate-x-[6px]">
        <span className="font-sign font-bold text-primary text-6xl leading-[0.78] tracking-[-0.06em]">P</span>
        <div className="flex flex-col items-start ml-1 -mt-0.5">
          <span className="font-sign font-bold text-primary text-5xl leading-[0.78] tracking-[-0.06em]">10</span>
          <span className="font-sign font-bold text-primary text-[0.75rem] leading-none tracking-tight mt-2">MINUTE</span>
        </div>
      </div>
    );
  }

  if (type === '1/4P') {
    return (
      <div className="flex items-center justify-center mb-1">
        <div className="flex flex-col items-center mr-1">
          <span className="font-sign font-bold text-primary text-xl leading-none border-b-2 border-primary">1</span>
          <span className="font-sign font-bold text-primary text-xl leading-none">4</span>
        </div>
        <span className="font-sign font-bold text-primary text-6xl leading-none tracking-tighter">P</span>
      </div>
    );
  }

  // For 2P, 4P, 8P, 6P etc.
  const match = type.match(/^(\d+)(P)$/);
  if (match) {
    const [_, num, p] = match;
    return (
      <div className="flex items-center justify-center mb-1">
        <span className="font-sign font-bold text-primary text-5xl leading-none tracking-tighter">{num}</span>
        <span className="font-sign font-bold text-primary text-5xl leading-none tracking-tighter">{p}</span>
      </div>
    );
  }

  if (type === 'LOADING ZONE') {
    return (
      <div className="bg-[#e31e24] w-full py-1 px-2 mb-2 rounded-sm flex flex-col items-center">
        <span className="text-white font-sign font-bold text-lg leading-tight tracking-tight">LOADING</span>
        <span className="text-white font-sign font-bold text-2xl leading-tight tracking-normal">ZONE</span>
      </div>
    );
  }

  return null;
};

const TimeRange = ({ time, isRed = false }) => {
  const colorClass = isRed ? "text-[#e31e24]" : "text-primary";
  
  const parseTime = (t) => {
    // Basic parser for "9AM", "3:30PM", "NOON", "MIDNIGHT"
    if (t === 'NOON') return { hour: '12', min: '', ampm: 'NOON' };
    if (t === 'MIDNIGHT') return { hour: '12', min: '', ampm: 'MIDNIGHT' };
    
    const match = t.match(/(\d+)(?::(\d+))?\s*(AM|PM|NOON|MIDNIGHT)/i);
    if (!match) return { hour: t, min: '', ampm: '' };
    return { hour: match[1], min: match[2] || '', ampm: match[3].toUpperCase() };
  };

  const start = parseTime(time.split('-')[0].trim());
  const end = parseTime(time.split('-')[1].trim());

  const isSpecial =
    start.ampm === 'NOON' ||
    start.ampm === 'MIDNIGHT' ||
    end.ampm === 'NOON' ||
    end.ampm === 'MIDNIGHT';

  if (isSpecial) {
    return (
      <div className={`flex items-start justify-center gap-3 ${colorClass} tracking-[-0.04em]`}>
        <div className="flex flex-col items-center leading-none">
          <span className="font-sign font-bold text-4xl leading-[0.85]">{start.hour}</span>
          <span className="font-sign font-bold text-[0.8rem] leading-none -mt-1">NOON</span>
        </div>
        <span className="font-sign font-bold text-3xl leading-[0.95] mt-1">-</span>
        <div className="flex flex-col items-center leading-none">
          <span className="font-sign font-bold text-4xl leading-[0.85]">MID</span>
          <span className="font-sign font-bold text-[0.8rem] leading-none -mt-1">NIGHT</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-baseline justify-center gap-2 ${colorClass} tracking-[-0.04em]`}>
      <div className="flex items-baseline">
        <span className="font-sign font-bold text-4xl leading-[0.85]">{start.hour}</span>
        {start.min && (
          <span className="font-sign font-bold text-[1rem] leading-none inline-block translate-y-[-0.55rem] ml-0.5">
            {start.min}
          </span>
        )}
        <span className="font-sign font-bold text-[0.95rem] leading-none inline-block translate-y-[-0.1rem] ml-0.5">
          {start.ampm}
        </span>
      </div>
      <span className="font-sign font-bold text-3xl leading-[0.95]">-</span>
      <div className="flex items-baseline">
        <span className="font-sign font-bold text-4xl leading-[0.85]">{end.hour}</span>
        {end.min && (
          <span className="font-sign font-bold text-[1rem] leading-none inline-block translate-y-[-0.55rem] ml-0.5">
            {end.min}
          </span>
        )}
        <span className="font-sign font-bold text-[0.95rem] leading-none inline-block translate-y-[-0.1rem] ml-0.5">
          {end.ampm}
        </span>
      </div>
    </div>
  );
};

const DayInfo = ({ days, isRed = false }) => {
  const colorClass = isRed ? "text-[#e31e24]" : "text-primary";
  const isRange = days.includes('-');
  const fontSize = isRange ? "text-[0.95rem]" : "text-[1.05rem]";

  return (
    <div className={`text-center whitespace-nowrap font-sign font-bold ${colorClass} ${fontSize} tracking-[-0.02em] mt-1`}>
      {days}
    </div>
  );
};

const Arrow = ({ direction = 'right', isRed = false, strokeWidth = 4 }) => {
  const color = isRed ? COLORS.loading : COLORS.primary;
  
  if (direction === 'both') {
    return (
      <svg width="70" height="14" viewBox="0 0 70 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 7 H65 M5 7 L10 3 M5 7 L10 11 M65 7 L60 3 M65 7 L60 11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  
  if (direction === 'left') {
    return (
      <svg width="70" height="14" viewBox="0 0 70 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 7 H65 M5 7 L10 3 M5 7 L10 11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  // default right
  return (
    <svg width="70" height="14" viewBox="0 0 70 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 7 H65 M65 7 L60 3 M65 7 L60 11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default function ParkingSign({ type, position, direction = 'right', schedules = [] }) {
  // Mocking schedules if not provided for backward compatibility
  const signSchedules = schedules.length > 0 ? schedules : (
    type === '2P' ? [
      { time: '9AM - 3:30PM', days: 'MON - FRI' },
      { time: '9AM - 12 NOON', days: 'SAT' }
    ] : type === 'P10' ? [
      { time: '8:30AM - 6PM', days: 'MON - FRI' },
      { time: '8:30AM - 12:30PM', days: 'SAT' }
    ] : type === '8P' ? [
      { time: '8:30AM - 6PM', days: 'MON - FRI' },
      { time: '8:30AM - 12:30PM', days: 'SAT' }
    ] : type === '1/4P' ? [
      { time: '9AM - 9PM', days: 'MON - FRI' },
      { time: '9AM - 12 NOON', days: 'SAT' }
    ] : []
  );

  const isRed = type === 'LOADING ZONE';
  const isP10 = type === 'P10';
  const borderColor = isRed ? 'border-[#e31e24]' : 'border-primary';
  const signSizeClass = isP10 ? 'w-40 min-h-[260px]' : 'w-32 min-h-[120px]';
  const borderWidthClass = isP10 ? 'border-[4px]' : 'border-[3px]';
  const radiusClass = isP10 ? 'rounded-[18px]' : 'rounded-md';
  const paddingClass = isP10 ? 'py-3 px-3' : 'py-2 px-2';

  return (
    <div className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2 z-20" style={{ left: `${position}%` }}>
      <div className={`${signSizeClass} bg-white ${borderWidthClass} ${borderColor} ${radiusClass} shadow-sign flex flex-col items-center ${paddingClass} select-none overflow-hidden`}>
        <Header type={type} />
        
        <div className={`w-full flex flex-col ${isP10 ? 'gap-5 mt-1' : 'gap-2 mt-1'}`}>
          {signSchedules.map((sched, idx) => (
            <div key={idx} className="flex flex-col">
              <TimeRange time={sched.time} isRed={isRed} />
              <DayInfo days={sched.days} isRed={isRed} />
            </div>
          ))}
        </div>
        
        <div className="w-full mt-auto pt-2 flex justify-center">
          <Arrow direction={direction} isRed={isRed} strokeWidth={isP10 ? 4 : 3} />
        </div>
      </div>
      <div className="w-2 h-24 bg-gray-400 rounded-b-sm shadow-pole relative z-0"></div>
    </div>
  );
}

