import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Components
import { AppLayout } from "@/components/layout";

// Pages
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AdminPage from "@/pages/admin";
import TestPage from "@/pages/test";
import LeaderboardPage from "@/pages/leaderboard";

// A wrapper to protect routes
function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
        <Route path="/admin" component={() => <ProtectedRoute component={AdminPage} adminOnly={true} />} />
        <Route path="/test/:quizId" component={() => <ProtectedRoute component={TestPage} />} />
        <Route path="/leaderboard" component={() => <ProtectedRoute component={LeaderboardPage} />} />
        
        {/* Fallback to login or dashboard based on auth */}
        <Route>
          {() => {
            const { user } = useAuth();
            return <Redirect to={user ? "/dashboard" : "/"} />;
          }}
        </Route>
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
