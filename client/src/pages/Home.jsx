  const cognitiveExercises = [
    { title: 'Memory Game', description: 'Try remembering 5 random items from your room without looking' },
    { title: 'Count Backwards', description: 'Count backwards from 100 by 7s (100, 93, 86...)' },
    { title: 'Word Association', description: 'Pick a word and list 10 related words in 60 seconds' },
    { title: 'Color Challenge', description: 'Name 5 things around you for each color of the rainbow' },
    {  title: 'Alphabet Game', description: 'Name an animal for each letter A-Z as fast as you can' },
    { title: 'Quick Math', description: 'Multiply any two-digit numbers in your head' },
  ];
export default function Home() {    
    return (
        <>
            {/* Cognitive Exercise */}
        <div className="card shadow-xl border " style={{ 
          borderColor: '#e5e7eb',  
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white'
        }}>
          <div className="card-body">
            <h3 className="card-title text-sm mb-3">
              <span className="text-2xl mr-2">🧠</span>
              Brain Boost
            </h3>
            <div className="space-y-2">
              {cognitiveExercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-white bg-opacity-10">
                  <span className="text-xl flex-shrink-0">{exercise.icon}</span>
                  <div>
                    <p className="font-semibold text-xs">{exercise.title}</p>
                    <p className="text-xs opacity-80">{exercise.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
    );
}
