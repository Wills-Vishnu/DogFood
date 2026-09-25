import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Trophy, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common';

export const LandingPage = ({ currentUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-lg py-3xl">
        {/* Hero */}
        <section className="text-center mb-3xl">
          <h1 className="text-5xl font-bold text-brand-900 mb-lg">
            Self-Hosted Hackathon Platform
          </h1>
          <p className="text-xl text-brand-600 mb-2xl max-w-2xl mx-auto">
            DOGFOOD is the premium, open-source platform for hosting, judging, and
            celebrating hackathons. Full control. Zero lock-in.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/events">
              <Button variant="primary" size="lg">
                Explore Hackathons <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {!currentUser && (
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Register
                </Button>
              </Link>
            )}
            {!currentUser && (
              <Link to="/login">
                <Button variant="ghost" size="lg">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="mb-3xl">
          <h2 className="text-3xl font-bold text-brand-900 mb-2xl text-center">
            Built for Scale
          </h2>
          <div className="grid md:grid-cols-3 gap-2xl">
            <FeatureCard
              icon={Sparkles}
              title="Brilliant UX"
              description="Intuitive interfaces for organizers, judges, and participants. No learning curve."
            />
            <FeatureCard
              icon={Users}
              title="Judge Management"
              description="Weighted scoring rubrics, anonymization, and progress tracking built in."
            />
            <FeatureCard
              icon={Trophy}
              title="Community Voting"
              description="Optional public voting with anti-abuse controls and real-time results."
            />
            <FeatureCard
              icon={Zap}
              title="Self-Hosted"
              description="Deploy to your own infrastructure. Own your data. No lock-in."
            />
            <FeatureCard
              icon={Zap}
              title="Developer-Friendly"
              description="REST API, webhooks, and clear data models for integrations."
            />
            <FeatureCard
              icon={Zap}
              title="Audit Trail"
              description="Complete logging of all actions for compliance and transparency."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white rounded-xl border border-brand-200 p-12 text-center">
          <h2 className="text-2xl font-bold text-brand-900 mb-2">
            Ready to join a hackathon?
          </h2>
          <p className="text-brand-600 mb-6">
            Browse events and register to participate.
          </p>
          <Link to="/events">
            <Button variant="primary" size="lg">
              Browse Events <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="card p-2xl text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-100 rounded-lg mb-lg">
      <Icon className="w-6 h-6 text-accent-600" />
    </div>
    <h3 className="text-lg font-semibold text-brand-900 mb-sm">{title}</h3>
    <p className="text-brand-600">{description}</p>
  </div>
);
