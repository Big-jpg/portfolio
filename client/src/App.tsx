// client/src/App.tsx
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const ProjectPage = lazy(() => import("./pages/ProjectPage"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/project/:name" component={ProjectPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<RouteLoading />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RouteLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="rounded-full border-2 border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground shadow-sm">
        Opening project…
      </div>
    </div>
  );
}

export default App;
