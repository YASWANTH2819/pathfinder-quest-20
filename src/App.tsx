// PathFinder App - Main entry point with authentication and language support
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppWrapper from "./components/AppWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CareerGuide from "./pages/CareerGuide";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import NotFound from "./pages/NotFound";
import CareerHealthScore from "./components/CareerHealthScore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppWrapper>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/career-guide" element={
                  <ProtectedRoute>
                    <CareerGuide />
                  </ProtectedRoute>
                } />
                <Route path="/resume-analyzer" element={
                  <ProtectedRoute>
                    <ResumeAnalyzer />
                  </ProtectedRoute>
                } />
                <Route path="/main" element={
                  <ProtectedRoute>
                    <MainPage />
                  </ProtectedRoute>
                } />
                <Route path="/career-health" element={
                  <ProtectedRoute>
                    <CareerHealthScore />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/roadmap" element={
                  <ProtectedRoute>
                    <RoadmapPage />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
