import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuizzes, useCreateQuiz, useCreateQuestion, useQuestions } from "@/hooks/use-api";
import { Card, Button, Input, Textarea, Label } from "@/components/ui";
import { Plus, ListChecks, CheckCircle2, ChevronRight, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const { user } = useAuth();
  const { data: quizzes } = useQuizzes();
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  if (user?.role !== "admin") {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-3xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Left Column - Quiz List */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your cognitive assessments.</p>
        </div>
        
        <CreateQuizForm />

        <div className="space-y-3 mt-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Existing Quizzes</h3>
          {quizzes?.map(quiz => (
            <button
              key={quiz.id}
              onClick={() => setSelectedQuiz(quiz.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedQuiz === quiz.id 
                  ? "bg-primary/10 border-primary glow-primary" 
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">{quiz.title}</span>
                <ChevronRight className={`w-5 h-5 ${selectedQuiz === quiz.id ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Questions Manager */}
      <div className="w-full md:w-2/3">
        <AnimatePresence mode="wait">
          {selectedQuiz ? (
            <motion.div
              key="manager"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <QuestionsManager quizId={selectedQuiz} quizTitle={quizzes?.find(q => q.id === selectedQuiz)?.title || ""} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <Card className="p-12 text-center border-dashed border-2 bg-transparent opacity-50">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Select a quiz to manage its questions</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CreateQuizForm() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const createQuiz = useCreateQuiz();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;
    await createQuiz.mutateAsync({ title, description: desc });
    setTitle("");
    setDesc("");
  };

  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4 flex items-center"><Plus className="w-4 h-4 mr-2 text-primary" /> Create New Quiz</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <Textarea placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} rows={2} required className="min-h-[80px]" />
        </div>
        <Button type="submit" isLoading={createQuiz.isPending} className="w-full">Create Quiz</Button>
      </form>
    </Card>
  );
}

function QuestionsManager({ quizId, quizTitle }: { quizId: number, quizTitle: string }) {
  const { data: questions } = useQuestions(quizId);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-card to-card/50">
        <h2 className="text-2xl font-bold text-white mb-2">{quizTitle}</h2>
        <p className="text-muted-foreground flex items-center">
          <ListChecks className="w-4 h-4 mr-2" /> {questions?.length || 0} Questions Total
        </p>
      </Card>

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full border-dashed border-2 h-16 text-muted-foreground hover:text-primary">
          <Plus className="w-5 h-5 mr-2" /> Add New Question
        </Button>
      )}

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <CreateQuestionForm quizId={quizId} onCancel={() => setIsAdding(false)} />
        </motion.div>
      )}

      <div className="space-y-4">
        {questions?.map((q, i) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-4 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-lg mb-3">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <div key={opt} className={`px-3 py-2 rounded-lg text-sm border ${opt === q.correctAnswer ? 'bg-primary/20 border-primary text-primary font-medium' : 'bg-secondary border-border text-muted-foreground'}`}>
                      {opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 inline mr-2 align-text-bottom" />}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.aiHint && (
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent-foreground">
                    <span className="font-semibold text-accent mr-2">AI Hint:</span>{q.aiHint}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CreateQuestionForm({ quizId, onCancel }: { quizId: number, onCancel: () => void }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [hint, setHint] = useState("");
  const createQuestion = useCreateQuestion(quizId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== "");
    if (validOptions.length < 2) return alert("Need at least 2 options");
    
    await createQuestion.mutateAsync({
      text,
      options: validOptions,
      correctAnswer: options[correctIndex],
      aiHint: hint || null
    });
    onCancel();
  };

  const updateOption = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  return (
    <Card className="p-6 border-primary/50 shadow-[0_0_30px_rgba(13,180,214,0.1)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h3 className="font-bold text-lg border-b border-border pb-3">Draft New Question</h3>
        
        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea value={text} onChange={e => setText(e.target.value)} required placeholder="E.g., Which cognitive bias describes..." />
        </div>

        <div className="space-y-3">
          <Label>Options & Correct Answer</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${correctIndex === i ? 'border-primary bg-primary' : 'border-muted-foreground hover:border-primary/50'}`}
              >
                {correctIndex === i && <div className="w-2 h-2 bg-background rounded-full" />}
              </button>
              <Input 
                value={opt} 
                onChange={e => updateOption(i, e.target.value)} 
                placeholder={`Option ${i + 1}`} 
                required={i < 2} 
                className={correctIndex === i ? "border-primary/50" : ""}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
        </div>

        <div className="space-y-2">
          <Label>AI Hint (Optional)</Label>
          <Textarea value={hint} onChange={e => setHint(e.target.value)} placeholder="Provide a subtle clue..." className="min-h-[60px]" />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" isLoading={createQuestion.isPending}>Save Question</Button>
        </div>
      </form>
    </Card>
  );
}
