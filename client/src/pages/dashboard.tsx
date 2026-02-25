import { useState } from "react";
import { Link } from "wouter";
import { useQuizzes } from "@/hooks/use-api";
import { Card, Button } from "@/components/ui";
import { motion } from "framer-motion";
import { Plus, Brain, ArrowRight, Clock, Star } from "lucide-react";

export default function DashboardPage() {
  const { data: quizzes, isLoading } = useQuizzes();

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Available Assessments</h1>
          <p className="text-muted-foreground text-lg">Select a cognitive test to begin your evaluation.</p>
        </div>
      </div>

      {quizzes?.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 bg-transparent">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Quizzes Found</h3>
          <p className="text-muted-foreground">The administration has not set up any tests yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col p-6 hover:glow-primary transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{quiz.title}</h3>
                <p className="text-muted-foreground flex-1 mb-8 leading-relaxed">
                  {quiz.description}
                </p>
                <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-auto">
                  <div className="flex items-center text-sm text-muted-foreground font-medium">
                    <Clock className="w-4 h-4 mr-2" />
                    ~15 mins
                  </div>
                  <Link href={`/test/${quiz.id}`}>
                    <Button variant="primary" size="sm" className="rounded-full pl-6 pr-4">
                      Start <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
