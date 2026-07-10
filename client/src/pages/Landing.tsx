import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Brain, Zap, BarChart3, Mic, FileText, CheckCircle } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Grid background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(100, 150, 200, 0.1) 25%, rgba(100, 150, 200, 0.1) 26%, transparent 27%, transparent 74%, rgba(100, 150, 200, 0.1) 75%, rgba(100, 150, 200, 0.1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(100, 150, 200, 0.1) 25%, rgba(100, 150, 200, 0.1) 26%, transparent 27%, transparent 74%, rgba(100, 150, 200, 0.1) 75%, rgba(100, 150, 200, 0.1) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-cyan-600" />
          <span className="text-2xl font-bold text-black">PrepAI</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => startLogin()}
            className="border-black text-black hover:bg-black hover:text-white"
          >
            Sign In
          </Button>
          <Button
            onClick={() => startLogin()}
            className="bg-black text-white hover:bg-gray-900"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-6">
              Master Your <span className="text-cyan-600">Interview</span> Skills
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Practice with AI-powered mock interviews, get real-time feedback on your resume, and land your dream job with confidence.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => startLogin()}
                className="bg-black text-white hover:bg-gray-900 text-lg px-8"
              >
                Start Free Interview
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white text-lg px-8"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Decorative geometric shapes */}
          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-pink-100 rounded-3xl opacity-30" />
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />

              {/* Geometric shapes */}
              <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="2" />
              <rect x="250" y="150" width="80" height="80" fill="none" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="2" />
              <polygon
                points="200,50 250,150 150,150"
                fill="none"
                stroke="rgba(34, 211, 238, 0.3)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-black text-center mb-16">
          Powerful Features for Interview Success
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Resume Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your resume and get AI-powered feedback on strengths, weaknesses, and actionable improvements.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">AI Mock Interviews</h3>
            <p className="text-gray-600 leading-relaxed">
              Practice with role-specific questions generated by AI. Get realistic interview experience anytime.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Voice Answers</h3>
            <p className="text-gray-600 leading-relaxed">
              Speak your answers naturally. Real-time transcription simulates actual interview conditions.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Detailed Reports</h3>
            <p className="text-gray-600 leading-relaxed">
              Get comprehensive performance reports with scores, feedback, and personalized improvement tips.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Real-time Feedback</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant feedback on each answer to understand what works and what needs improvement.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Interview History</h3>
            <p className="text-gray-600 leading-relaxed">
              Track your progress over time. Review past sessions and watch your performance improve.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-black text-center mb-16">How It Works</h2>

        <div className="space-y-8">
          {[
            { step: "1", title: "Upload Your Resume", desc: "Start by uploading your resume in PDF or text format" },
            { step: "2", title: "Select a Role", desc: "Choose the job position you want to practice for" },
            { step: "3", title: "Practice Interview", desc: "Answer AI-generated questions with text or voice" },
            { step: "4", title: "Get Feedback", desc: "Receive detailed analysis and improvement suggestions" },
            { step: "5", title: "Track Progress", desc: "Review your performance and prepare for real interviews" },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="bg-black text-white rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Ace Your Interview?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start practicing with AI-powered mock interviews today and build the confidence you need to land your dream job.
          </p>
          <Button
            size="lg"
            onClick={() => startLogin()}
            className="bg-white text-black hover:bg-gray-100 text-lg px-8"
          >
            Start Your Free Interview
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center text-gray-600">
        <p>&copy; 2026 PrepAI. All rights reserved. Master your interview skills with AI.</p>
      </footer>
    </div>
  );
}
