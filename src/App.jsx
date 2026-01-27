import { useState } from 'react'
import Navbar from './components/Navbar'
import ScenarioCard from './components/ScenarioCard'
import ParkingSign from './components/ParkingSign'
import ParkingSpot from './components/ParkingSpot'

function App() {
  const [level, setLevel] = useState(4)
  const [score, setScore] = useState(850)

  const handleSpotClick = (spot) => {
    console.log(`Clicked ${spot}`)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-body min-h-screen flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden">
      <Navbar level={level} score={score} />
      
      <main className="flex-grow flex flex-col relative">
        <ScenarioCard 
          day="Tuesday"
          time="10:30 AM"
          duration="2 hours"
        />
        
        <div className="flex-grow flex flex-col justify-end relative mt-4">
          <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-50 to-slate-200 dark:from-slate-900 dark:to-slate-800"></div>
          
          <div className="relative z-10 w-full h-64 flex items-end justify-center pb-0">
            <div className="absolute bottom-0 w-full h-32 bg-slate-300 dark:bg-slate-700 border-t border-slate-400 dark:border-slate-600"></div>
            
            <div className="w-full max-w-md flex justify-between px-4 items-end relative" style={{height: '280px'}}>
              <ParkingSign type="2P" position={33.33} />
              <ParkingSign type="1/4P" position={66.67} />
            </div>
          </div>
          
          <div className="h-48 bg-road-light dark:bg-road-dark w-full relative flex justify-center perspective-1000 overflow-hidden border-t-4 border-slate-400 dark:border-slate-600">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkjWIts2knjc8-nj4eflGjH9u0QDYFo_c8_YiOxApsR1A_2n2_dT_muBytwImWTJaaMBrI7J5o8oVRHOVXraPYAsbTB6JchOljmGqj5cKb2nZavnDvXx3Ft5YpzvqaD286Fv9F_iX2-hw3wjqlW7if_GcUgWaK0ykjNVjmLvIEqYztYpvdeZoBKnyjhobFXpX38hP6DLNAA3nu03hUgoroDpBK_WLdNpdnn1Fs5KFT1CYg2Q1gBs2p-4t4JT3rnbW4Wu-yr02j5ye9')"}}></div>
            
            <div className="w-full max-w-md flex h-full relative z-10 px-4">
              <ParkingSpot label="Spot A" onClick={() => handleSpotClick('A')} />
              <ParkingSpot label="Spot B" onClick={() => handleSpotClick('B')} />
              <ParkingSpot label="Spot C" onClick={() => handleSpotClick('C')} />
            </div>
          </div>
          
          <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
            <span className="bg-black/50 text-white px-4 py-1 rounded-full text-xs backdrop-blur-md">
              Tap a parking spot to answer
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
