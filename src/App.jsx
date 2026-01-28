import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import ScenarioCard from './components/ScenarioCard'
import ParkingSign from './components/ParkingSign'
import ParkingSpot from './components/ParkingSpot'
import { analyzeSignImage, getRandomSignImage } from './services/poeApi'

function App() {
  const [currentLevel, setCurrentLevel] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [levelCount, setLevelCount] = useState(1)
  const [error, setError] = useState(null)

  // Load a new question on component mount and after correct answers
  useEffect(() => {
    loadNewQuestion()
  }, [])

  const loadNewQuestion = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get a random sign image
      const { base64, path } = await getRandomSignImage()
      setCurrentImage(path)

      // Analyze the image with AI
      const questionData = await analyzeSignImage(base64)

      // Add an ID for display purposes
      setCurrentLevel({
        id: levelCount,
        ...questionData
      })
    } catch (error) {
      console.error('Error loading question:', error)
      setError('Failed to load question. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpotClick = (spotId) => {
    if (isAnswered || !currentLevel) return

    const isCorrect = spotId === currentLevel.correctAnswer
    setIsAnswered(true)

    if (isCorrect) {
      setScore(score + 100)
      setFeedback({
        type: 'success',
        message: `정답입니다! 🎉${currentLevel.explanation ? ' ' + currentLevel.explanation : ''}`
      })
    } else {
      setFeedback({ type: 'error', message: '틀렸습니다. 다시 시도해보세요.' })
    }

    setTimeout(() => {
      if (isCorrect) {
        // Load next question
        setLevelCount(levelCount + 1)
        setIsAnswered(false)
        setFeedback(null)
        loadNewQuestion()
      } else {
        setIsAnswered(false)
        setFeedback(null)
      }
    }, 2500)
  }

  if (error) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-body min-h-screen flex flex-col text-slate-800 dark:text-slate-100 items-center justify-center p-6">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg max-w-md text-center">
          <h2 className="font-bold text-lg mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={loadNewQuestion}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !currentLevel) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-body min-h-screen flex flex-col text-slate-800 dark:text-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">AI가 주차 표지판을 분석하고 있습니다...</p>
        </div>
      </div>
    )
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

            <div className="w-full max-w-md flex justify-center px-4 items-end relative" style={{height: '280px'}}>
              {currentImage && (
                <div className="flex flex-col items-center relative">
                  {/* Parking Sign */}
                  <img
                    src={currentImage}
                    alt="Parking Sign"
                    className="max-h-48 object-contain mb-2 relative z-20"
                  />

                  {/* Pole */}
                  <div
                    className="w-2 bg-slate-500 dark:bg-slate-600 relative z-10 shadow-md"
                    style={{height: '12rem'}}
                  ></div>
                </div>
              )}
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
