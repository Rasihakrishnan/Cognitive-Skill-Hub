import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuestions, useCreateResult, useQuizzes } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { Card, Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, CheckCircle2, XCircle, Trophy, ArrowRight } from "lucide-react";

export default function TestPage() {
  const params = useParams();
  const quizId = parseInt(params.quizId || "0", 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: questions, isLoading } = useQuestions(quizId);
  const { data: quizzes } = useQuizzes();
  const submitResult = useCreateResult();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const quizTitle = quizzes?.find(q => q.id === quizId)?.title || "Assessment";

  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);

  if (isLoading) {
    return <div className="h-full flex justify-center items-center"><div className="animate-spin w-10 h-10 border-t-2 border-primary rounded-full"></div></div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">No questions available</h2>
        <Button onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;

  const handleSelectOption = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = async () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      // Calculate and submit
      let finalScore = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) finalScore++;
      });
      setScore(finalScore);
      setIsFinished(true);
      
      if (user) {
        await submitResult.mutateAsync({
          userId: user.id,
          quizId,
          score: finalScore,
          totalQuestions: total
        });
      }
    }
  };

  if (isFinished) {
    const accuracy = Math.round((score / total) * 100);
    return (
      <div className="h-full flex items-center justify-center max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
          <Card className="p-10 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
            
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-4xl font-display font-bold text-white mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground text-lg mb-8">Your results have been recorded to the leaderboard.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-secondary/50 rounded-2xl border border-border">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-5xl font-bold text-white">{score}<span className="text-2xl text-muted-foreground">/{total}</span></div>
              </div>
              <div className="p-6 bg-secondary/50 rounded-2xl border border-border">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Accuracy</div>
                <div className={`text-5xl font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {accuracy}%
                </div>
              </div>
            </div>

            <Button onClick={() => setLocation("/leaderboard")} size="lg" className="w-full glow-primary text-lg">
              View Leaderboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const selectedAnswer = answers[currentQ.id];

  return (
    <div className="max-w-3xl mx-auto pt-6">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{quizTitle}</h2>
            <p className="text-muted-foreground">Question {currentIndex + 1} of {total}</p>
          </div>
          <div className="text-2xl font-display font-bold text-primary">{Math.round(progress)}%</div>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 md:p-10 mb-6 border-t-4 border-t-primary">
            <h3 className="text-2xl md:text-3xl font-medium leading-relaxed text-white mb-8">
              {currentQ.text}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`text-left p-5 rounded-xl border-2 transition-all duration-200 group flex items-center justify-between
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(13,180,214,0.15)]' 
                        : 'border-border bg-card hover:border-primary/50 hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}
                      `}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-white font-medium' : 'text-foreground'}`}>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Controls Bottom Bar */}
          <div className="flex justify-between items-start">
            <div>
              {currentQ.aiHint && (
                <div className="max-w-md">
                  {!showHint ? (
                    <Button variant="ghost" onClick={() => setShowHint(true)} className="text-accent hover:bg-accent/10 hover:text-accent font-medium">
                      <Lightbulb className="w-5 h-5 mr-2" /> Request AI Hint
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="p-4 bg-accent/5 border-accent/20">
                        <div className="flex items-start">
                          <Lightbulb className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-accent-foreground leading-relaxed">{currentQ.aiHint}</p>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              onClick={handleNext} 
              disabled={!selectedAnswer || submitResult.isPending}
              className={`rounded-full px-8 ${selectedAnswer ? 'glow-primary' : ''}`}
            >
              {currentIndex < total - 1 ? (
                <>Next Question <ArrowRight className="w-5 h-5 ml-2" /></>
              ) : (
                <>{submitResult.isPending ? "Submitting..." : "Finish Assessment"} <CheckCircle2 className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
