import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/Navbar';
import PremiumModal from '@/components/PremiumModal';
import { Upload, Settings, BarChart3, Rocket, Crown, Brain, Zap, Database } from 'lucide-react';

const Index = () => {
  const { user } = useUser();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const quickActions = [
    {
      title: 'Upload Dataset',
      description: 'Upload CSV, Excel, JSON, or image folders',
      icon: Upload,
      path: '/upload',
      gradient: 'bg-gradient-primary',
    },
    {
      title: 'Describe Task',
      description: 'Natural language AI model creation',
      icon: Settings,
      path: '/task-setup',
      gradient: 'bg-gradient-success',
    },
    {
      title: 'View Results',
      description: 'Compare models and download code',
      icon: BarChart3,
      path: '/results',
      gradient: 'bg-gradient-hero',
    },
    {
      title: 'Deploy Models',
      description: 'One-click API deployment',
      icon: Rocket,
      path: '/deployment',
      gradient: 'bg-gradient-premium',
    },
  ];

  const features = [
    { icon: Brain, text: 'AI-Powered AutoML', description: 'Natural language model building' },
    { icon: Zap, text: 'Lightning Fast', description: 'Optimized training pipelines' },
    { icon: Database, text: 'Multi-Format', description: 'CSV, Excel, JSON, Images' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold">
              <span className="gradient-text">AutoML-Agent</span>
              <span className="block text-3xl sm:text-4xl font-semibold text-foreground mt-2">
                Build, Train & Deploy AI Models
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create powerful machine learning models using natural language. 
              No coding required - just describe what you want to predict.
            </p>
          </div>

          {/* Premium Status */}
          {user?.isPremium && (
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-premium rounded-full shadow-premium">
              <Crown className="w-5 h-5 text-premium-foreground" />
              <span className="text-premium-foreground font-semibold">Premium Member</span>
            </div>
          )}

          {/* Upgrade Button for Free Users */}
          {!user?.isPremium && (
            <Button
              onClick={() => setShowPremiumModal(true)}
              variant="premium"
              size="lg"
              className="shadow-premium"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="hover-lift cursor-pointer h-full border-0 shadow-card">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center mx-auto shadow-lg`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center space-y-12">
          <h2 className="text-3xl font-bold text-foreground">
            Why Choose AutoML-Agent?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-primary">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{feature.text}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Stats for Free Users */}
        {user && !user.isPremium && (
          <div className="mt-16 text-center">
            <Card className="max-w-md mx-auto border border-warning/20 bg-gradient-to-r from-warning/5 to-premium/5">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Free Plan Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Runs</span>
                    <span className="font-medium">{user.taskRunsUsed}/{user.maxTaskRuns}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-premium h-2 rounded-full transition-all"
                      style={{ width: `${(user.taskRunsUsed / user.maxTaskRuns) * 100}%` }}
                    />
                  </div>
                </div>
                {user.taskRunsUsed >= user.maxTaskRuns && (
                  <Button
                    onClick={() => setShowPremiumModal(true)}
                    variant="premium"
                    size="sm"
                    className="w-full"
                  >
                    Upgrade for Unlimited Runs
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />
    </div>
  );
};

export default Index;
