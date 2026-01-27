import { useState } from 'react'
import Navbar from './components/Navbar'
import ScenarioCard from './components/ScenarioCard'
import ParkingSign from './components/ParkingSign'
import ParkingSpot from './components/ParkingSpot'
import { levels } from './data/levels'

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const currentLevel = levels[currentLevelIndex]

  const handleSpotClick = (spotId) => {
    if (isAnswered) return

    const isCorrect = spotId === currentLevel.correctAnswer
    setIsAnswered(true)
    
    if (isCorrect) {
      setScore(score + 100)
      setFeedback({ type: 'success', message: '정답입니다! 🎉' })
    } else {
      setFeedback({ type: 'error', message: '틀렸습니다. 다시 시도해보세요.' })
    }

    setTimeout(() => {
      if (isCorrect && currentLevelIndex < levels.length - 1) {
        setCurrentLevelIndex(currentLevelIndex + 1)
        setIsAnswered(false)
        setFeedback(null)
      } else if (isCorrect) {
        setFeedback({ type: 'success', message: '모든 레벨을 완료했습니다! 🏆' })
      } else {
        setIsAnswered(false)
        setFeedback(null)
      }
    }, 1500)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-body min-h-screen flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden">
      <Navbar level={currentLevel.id} score={score} />
      
      <main className="flex-grow flex flex-col relative">
        <ScenarioCard 
          day={currentLevel.scenario.day}
          time={currentLevel.scenario.time}
          duration={currentLevel.scenario.duration}
        />
        
        <div className="flex-grow flex flex-col justify-end relative mt-4">
          <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-50 to-slate-200 dark:from-slate-900 dark:to-slate-800"></div>
          
          <div className="relative z-10 w-full h-64 flex items-end justify-center pb-0">
            <div className="absolute bottom-0 w-full h-32 bg-slate-300 dark:bg-slate-700 border-t border-slate-400 dark:border-slate-600"></div>
            
            <div className="w-full max-w-md flex justify-between px-4 items-end relative" style={{height: '280px'}}>
              {currentLevel.signs.map((sign, index) => (
                <ParkingSign key={index} type={sign.type} position={sign.position} />
              ))}
            </div>
          </div>
          
          <div className="h-48 bg-road-light dark:bg-road-dark w-full relative flex justify-center perspective-1000 overflow-hidden border-t-4 border-slate-400 dark:border-slate-600">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkjWIts2knjc8-nj4eflGjH9u0QDYFo_c8_YiOxApsR1A_2n2_dT_muBytwImWTJaaMBrI7J5o8oVRHOVXraPYAsbTB6JchOljmGqj5cKb2nZavnDvXx3Ft5YpzvqaD286Fv9F_iX2-hw3wjqlW7if_GcUgWaK0ykjNVjmLvIEqYztYpvdeZoBKnyjhobFXpX38hP6DLNAA3nu03hUgoroDpBK_WLdNpdnn1Fs5KFT1CYg2Q1gBs2p-4t4JT3rnbW4Wu-yr02j5ye9')"}}></div>
            
            <div className="w-full max-w-md flex h-full relative z-10 px-4">
              {currentLevel.spots.map((spot) => (
                <ParkingSpot 
                  key={spot.id} 
                  label={spot.label} 
                  onClick={() => handleSpotClick(spot.id)} 
                />
              ))}
            </div>
          </div>
          
          {feedback && (
            <div className="absolute bottom-6 w-full flex justify-center pointer-events-none z-30">
              <div className={`px-6 py-3 rounded-full text-sm font-bold backdrop-blur-md shadow-lg ${
                feedback.type === 'success' 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                {feedback.message}
              </div>
            </div>
          )}
          
          {!feedback && (
            <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
              <span className="bg-black/50 text-white px-4 py-1 rounded-full text-xs backdrop-blur-md">
                Tap a parking spot to answer
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
