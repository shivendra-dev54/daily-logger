"use client";

import { useAuthStore } from "@/Store/Authstore";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";
import Link from "next/link";

// Simple internal icon components to replace emojis
const Icons = {
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  ),
  BookOpen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  Wave: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h.01"/><path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5h5"/><path d="M7 12a5 5 0 0 0-5 5"/><path d="M17 12a5 5 0 0 0 5-5"/></svg>
  )
};

export default function HomePage() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const colors = getThemeColors(theme);

  const features = [
    {
      Icon: Icons.List,
      title: "Task Management",
      description:
        "Create, organize, and track your daily tasks with systemized ease. Set due dates, mark priorities, and never miss a deadline.",
      highlights: [
        "Unlimited task creation",
        "Smart reminders",
        "Priority tagging",
        "Real-time updates",
      ],
    },
    {
      Icon: Icons.BookOpen,
      title: "Daily Journaling",
      description:
        "Reflect on your day with our structured journaling system. Rate your productivity and write detailed summaries.",
      highlights: [
        "Daily ratings (1-5)",
        "Mood pattern tracking",
        "Detailed archives",
        "Retrospective views",
      ],
    },
    {
      Icon: Icons.Moon,
      title: "Sleep Tracking",
      description:
        "Monitor your sleep patterns to optimize rest quality. Log sessions to automatically calculate duration and trends.",
      highlights: [
        "Session logging",
        "Duration calculation",
        "Pattern analysis",
        "Average sleep stats",
      ],
    },
  ];

  const benefits = [
    {
      Icon: Icons.Target,
      title: "Stay Organized",
      text: "Centralize your workflow and maintain clarity on your daily objectives.",
    },
    {
      Icon: Icons.TrendingUp,
      title: "Track Progress",
      text: "Visualize your productivity metrics and mood evolution over time.",
    },
    {
      Icon: Icons.Moon,
      title: "Better Rest",
      text: "Data-driven insights to help you understand and improve sleep hygiene.",
    },
    {
      Icon: Icons.Shield,
      title: "Secure & Private",
      text: "Enterprise-grade encryption ensures your personal data remains private.",
    },
  ];

  return (
    <div
      style={{ backgroundColor: colors.colors.bg.primary }}
      className="min-h-screen"
    >

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div 
            style={{ 
              backgroundColor: colors.colors.accent.light,
              color: colors.colors.accent.primary,
              borderColor: colors.colors.accent.secondary
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
          >
            <Icons.Wave />
            <span>Productivity & Wellness Tracking</span>
          </div>
          
          <h1
            style={{ color: colors.colors.text.primary }}
            className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight"
          >
            Ride the Wave of <br />
            <span
              style={{ color: colors.colors.accent.primary }}
              className=""
            >
              Productivity
            </span>
          </h1>
          
          <p
            style={{ color: colors.colors.text.secondary }}
            className="text-xl lg:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            A unified platform to manage tasks, journal insights, and
            monitor sleep patterns. Optimize your life with data.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                style={{
                  backgroundColor: colors.colors.accent.primary,
                }}
                className="group px-8 py-4 rounded-lg font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Start Your Journey
                <span className="group-hover:translate-x-1 transition-transform">
                   <Icons.ArrowRight />
                </span>
              </Link>
              <Link
                href="/auth/signin"
                style={{
                  backgroundColor: "transparent",
                  borderColor: colors.colors.border.secondary,
                  color: colors.colors.text.primary,
                }}
                className="px-8 py-4 rounded-lg font-bold text-lg border hover:bg-opacity-50 transition-all"
              >
                Sign In
              </Link>
            </div>
          )}

          {user && (
            <Link
              href="/app"
              style={{
                backgroundColor: colors.colors.accent.primary,
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Go to Dashboard 
              <Icons.ArrowRight />
            </Link>
          )}
        </div>

        {/* Abstract Background SVG */}
        <div className="absolute inset-0 z-0 opacity-40">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 V 50 Q 25 45 50 50 T 100 50 V 100 Z" fill={colors.colors.bg.secondary} />
           </svg>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{ backgroundColor: colors.colors.bg.secondary }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              style={{ color: colors.colors.text.primary }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Comprehensive Toolkit
            </h2>
            <p
              style={{ color: colors.colors.text.secondary }}
              className="text-lg max-w-2xl mx-auto"
            >
              Three powerful modules integrated into one seamless experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.colors.bg.card,
                  borderColor: colors.colors.border.primary,
                }}
                className="group rounded-xl p-8 border hover:shadow-xl transition-all duration-300"
              >
                <div 
                    style={{ color: colors.colors.accent.primary }}
                    className="mb-6 transform group-hover:scale-110 transition-transform duration-300"
                >
                    <feature.Icon />
                </div>
                <h3
                  style={{ color: colors.colors.text.primary }}
                  className="text-xl font-bold mb-3"
                >
                  {feature.title}
                </h3>
                <p
                  style={{ color: colors.colors.text.secondary }}
                  className="mb-8 leading-relaxed text-sm"
                >
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      style={{ color: colors.colors.text.tertiary }}
                      className="flex items-center text-sm"
                    >
                      <span
                        style={{ color: colors.colors.accent.primary }}
                        className="mr-3"
                      >
                        <Icons.Check />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              style={{ color: colors.colors.text.primary }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Workflow
            </h2>
            <p
              style={{ color: colors.colors.text.secondary }}
              className="text-lg max-w-2xl mx-auto"
            >
              Streamlined for efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sign Up", desc: "Create your account." },
              { step: "02", title: "Add Tasks", desc: "Log to-dos & deadlines." },
              { step: "03", title: "Track", desc: "Journal & log sleep." },
              { step: "04", title: "Optimize", desc: "Review your analytics." },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div
                  style={{
                    color: colors.colors.accent.primary,
                    borderColor: colors.colors.border.secondary
                  }}
                  className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-opacity-10 transition-colors"
                >
                  {item.step}
                </div>
                <h3
                  style={{ color: colors.colors.text.primary }}
                  className="text-lg font-bold mb-2"
                >
                  {item.title}
                </h3>
                <p style={{ color: colors.colors.text.secondary }} className="text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{ backgroundColor: colors.colors.bg.secondary }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.colors.bg.card,
                  borderColor: colors.colors.border.primary,
                }}
                className="rounded-lg p-6 border transition-all text-center hover:shadow-md"
              >
                <div style={{ color: colors.colors.accent.primary }} className="flex justify-center mb-4">
                   <benefit.Icon />
                </div>
                <h3
                  style={{ color: colors.colors.text.primary }}
                  className="text-base font-bold mb-2"
                >
                  {benefit.title}
                </h3>
                <p
                  style={{ color: colors.colors.text.secondary }}
                  className="text-xs leading-relaxed"
                >
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              style={{
                backgroundColor: colors.colors.bg.card,
                borderColor: colors.colors.border.primary,
              }}
              className="rounded-2xl p-12 border shadow-xl"
            >
              <h2
                style={{ color: colors.colors.text.primary }}
                className="text-3xl lg:text-4xl font-bold mb-6"
              >
                Ready to optimize your routine?
              </h2>
              <p
                style={{ color: colors.colors.text.secondary }}
                className="text-lg mb-8 max-w-2xl mx-auto"
              >
                Join users who have improved their productivity and sleep quality with Daily Logger.
              </p>
              <Link
                href="/auth/signup"
                style={{
                  backgroundColor: colors.colors.accent.primary,
                }}
                className="inline-block px-10 py-4 rounded-lg font-bold text-white text-lg shadow-lg hover:bg-opacity-90 transition-all"
              >
                Get Started
              </Link>
              <p
                style={{ color: colors.colors.text.muted }}
                className="mt-6 text-xs uppercase tracking-wider font-semibold"
              >
                Free Forever • No Credit Card
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          backgroundColor: colors.colors.bg.card,
          borderTopColor: colors.colors.border.primary,
        }}
        className="border-t py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div style={{ color: colors.colors.accent.primary }}>
               <Icons.Wave />
             </div>
             <span style={{ color: colors.colors.text.primary }} className="font-bold">Daily Logger</span>
          </div>
          <p style={{ color: colors.colors.text.secondary }} className="text-sm">
            © 2026 Daily Logger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}