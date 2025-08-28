import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { CheckCircle, Clock, Zap, Database, Search, Settings, BarChart3, Rocket } from 'lucide-react';

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'running' | 'completed';
  duration?: number;
}

const Progress = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps: PipelineStep[] = [
    {
      id: 'preprocessing',
      title: 'Data Preprocessing',
      description: 'Cleaning and preparing your dataset',
      icon: Database,
      status: 'pending',
    },
    {
      id: 'feature-engineering',
      title: 'Feature Engineering',
      description: 'Creating and selecting optimal features',
      icon: Settings,
      status: 'pending',
    },
    {
      id: 'model-search',
      title: 'Model Search',
      description: 'Testing multiple ML algorithms',
      icon: Search,
      status: 'pending',
    },
    {
      id: 'hyperparameter-tuning',
      title: 'Hyperparameter Tuning',
      description: 'Optimizing model parameters',
      icon: Zap,
      status: 'pending',
    },
    {
      id: 'evaluation',
      title: 'Model Evaluation',
      description: 'Measuring model performance',
      icon: BarChart3,
      status: 'pending',
    },
    {
      id: 'deployment-setup',
      title: 'Deployment Setup',
      description: 'Preparing model for production',
      icon: Rocket,
      status: 'pending',
    },
  ];

  const [pipelineSteps, setPipelineSteps] = useState(steps);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineSteps(prevSteps => {
        const newSteps = [...prevSteps];
        
        // Find the first non-completed step
        const currentStepIndex = newSteps.findIndex(step => step.status !== 'completed');
        
        if (currentStepIndex !== -1) {
          // Mark current step as running
          if (newSteps[currentStepIndex].status === 'pending') {
            newSteps[currentStepIndex].status = 'running';
            setCurrentStep(currentStepIndex);
          }
          
          // After some time, mark as completed and move to next
          setTimeout(() => {
            setPipelineSteps(steps => {
              const updatedSteps = [...steps];
              if (updatedSteps[currentStepIndex]) {
                updatedSteps[currentStepIndex].status = 'completed';
                updatedSteps[currentStepIndex].duration = Math.floor(Math.random() * 30) + 15; // 15-45 seconds
              }
              return updatedSteps;
            });
          }, 3000 + Math.random() * 2000); // 3-5 seconds per step
        }
        
        return newSteps;
      });
    }, 100);

    // Calculate overall progress
    const progressInterval = setInterval(() => {
      setPipelineSteps(steps => {
        const completedSteps = steps.filter(s => s.status === 'completed').length;
        const runningSteps = steps.filter(s => s.status === 'running').length;
        const totalSteps = steps.length;
        
        const newProgress = Math.round(((completedSteps + (runningSteps * 0.5)) / totalSteps) * 100);
        setProgress(newProgress);
        
        // Navigate to results when complete
        if (completedSteps === totalSteps && newProgress >= 100) {
          setTimeout(() => {
            navigate('/results');
          }, 2000);
        }
        
        return steps;
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">AutoML Pipeline Running</h1>
            <p className="text-lg text-muted-foreground">
              Building and optimizing your AI model automatically
            </p>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="text-2xl font-bold gradient-text">{progress}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar value={progress} className="h-4" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Starting pipeline...</span>
                <span>ETA: ~5 minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Steps */}
          <div className="space-y-4">
            {pipelineSteps.map((step, index) => {
              const StepIcon = step.icon;
              
              return (
                <Card 
                  key={step.id} 
                  className={`transition-all duration-500 ${
                    step.status === 'completed' 
                      ? 'border-success/50 bg-gradient-to-r from-success/5 to-transparent' 
                      : step.status === 'running'
                      ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-transparent shadow-primary'
                      : 'border-border'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Step Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        step.status === 'completed'
                          ? 'bg-gradient-success text-success-foreground pulse-success'
                          : step.status === 'running'
                          ? 'bg-gradient-primary text-primary-foreground animate-pulse-glow'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : step.status === 'running' ? (
                          <div className="relative">
                            <StepIcon className="w-6 h-6" />
                            <div className="absolute inset-0 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                          <div className="flex items-center space-x-2">
                            {step.status === 'running' && (
                              <div className="flex items-center space-x-1 text-primary">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Running...</span>
                              </div>
                            )}
                            {step.status === 'completed' && step.duration && (
                              <span className="text-sm text-success font-medium">
                                ✓ {formatDuration(step.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                        
                        {/* Progress bar for running step */}
                        {step.status === 'running' && (
                          <div className="mt-3">
                            <ProgressBar value={Math.random() * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">What's happening?</h3>
                <p className="text-muted-foreground text-sm">
                  Our AutoML system is testing multiple algorithms, tuning parameters, and selecting 
                  the best performing model for your specific dataset and task. This process typically 
                  takes 3-7 minutes depending on data complexity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Progress;