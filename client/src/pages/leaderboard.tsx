import { useLeaderboard, useQuizzes } from "@/hooks/use-api";
import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: quizzes } = useQuizzes();

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  }

  // Group by users if needed, or just show raw results. The API returns an array of results.
  // Assuming the API sorts by score DESC or we do it here. Let's ensure it's sorted by accuracy then score.
  const sorted = [...(leaderboard || [])].sort((a, b) => {
    const accA = a.score / a.totalQuestions;
    const accB = b.score / b.totalQuestions;
    if (accB !== accA) return accB - accA;
    return b.score - a.score; // tie-breaker
  });

  const getQuizName = (id: number) => quizzes?.find(q => q.id === id)?.title || `Quiz #${id}`;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center p-4 rounded-3xl bg-accent/10 border border-accent/20 mb-6"
        >
          <Trophy className="w-12 h-12 text-accent" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-white mb-3">Global Leaderboard</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Top cognitive performers across all assessments.</p>
      </div>

      <Card className="overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="py-5 px-6 font-semibold text-muted-foreground w-24 text-center">Rank</th>
                <th className="py-5 px-6 font-semibold text-muted-foreground">Candidate</th>
                <th className="py-5 px-6 font-semibold text-muted-foreground">Assessment</th>
                <th className="py-5 px-6 font-semibold text-muted-foreground text-center">Score</th>
                <th className="py-5 px-6 font-semibold text-muted-foreground text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((result, index) => {
                const accuracy = Math.round((result.score / result.totalQuestions) * 100);
                const isTop3 = index < 3;
                
                return (
                  <motion.tr 
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-border/50 transition-colors hover:bg-white/[0.02] ${isTop3 ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <td className="py-5 px-6 text-center">
                      {index === 0 ? <Trophy className="w-6 h-6 text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> :
                       index === 1 ? <Medal className="w-6 h-6 text-gray-300 mx-auto drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" /> :
                       index === 2 ? <Award className="w-6 h-6 text-amber-600 mx-auto drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" /> :
                       <span className="font-bold text-muted-foreground text-lg">#{index + 1}</span>}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-white">{result.userEmail.split('@')[0]}</div>
                      <div className="text-xs text-muted-foreground">{result.userEmail}</div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {getQuizName(result.quizId)}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center font-display font-bold text-xl">
                      {result.score}<span className="text-sm text-muted-foreground font-sans font-medium">/{result.totalQuestions}</span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end">
                        <span className={`font-bold text-lg ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {accuracy}%
                        </span>
                        {accuracy >= 80 && <TrendingUp className="w-4 h-4 text-green-400 ml-2" />}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No assessments have been completed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
