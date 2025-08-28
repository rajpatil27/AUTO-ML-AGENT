import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/Navbar';
import PremiumModal from '@/components/PremiumModal';
import { Play, Brain, AlertCircle, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TaskSetup = () => {
  const navigate = useNavigate();
  const { user, canRunTask, incrementTaskRuns } = useUser();
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const taskTypes = [
    { value: 'classification', label: 'Classification', description: 'Predict categories or classes' },
    { value: 'regression', label: 'Regression', description: 'Predict continuous numerical values' },
    { value: 'nlp', label: 'Natural Language Processing', description: 'Text analysis and understanding' },
    { value: 'time-series', label: 'Time Series', description: 'Predict future values over time' },
    { value: 'computer-vision', label: 'Computer Vision', description: 'Image classification and analysis' },
  ];

  const exampleTasks = [
    { type: 'classification', text: 'Predict whether an email is spam or not spam based on its content and metadata' },
    { type: 'regression', text: 'Predict house prices based on location, size, number of rooms, and amenities' },
    { type: 'nlp', text: 'Analyze customer reviews to determine sentiment (positive, negative, neutral)' },
    { type: 'time-series', text: 'Forecast monthly sales revenue for the next 6 months based on historical data' },
    { type: 'computer-vision', text: 'Classify images of products into different categories for inventory management' },
  ];

  const handleSubmit = async () => {
    if (!taskDescription.trim()) {
      toast({
        title: 'Missing description',
        description: 'Please describe what you want to predict.',
        variant: 'destructive'
      });
      return;
    }

    if (!taskType) {
      toast({
        title: 'Missing task type',
        description: 'Please select a task type.',
        variant: 'destructive'
      });
      return;
    }

    if (!canRunTask()) {
      setShowPremiumModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      incrementTaskRuns();
      
      toast({
        title: 'Task submitted successfully!',
        description: 'Your AutoML pipeline is starting...',
      });
      
      navigate('/progress');
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'There was an error starting your task.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillExample = (text: string, type: string) => {
    setTaskDescription(text);
    setTaskType(type);
  };

  const remainingRuns = user ? user.maxTaskRuns - user.taskRunsUsed : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">Describe Your Task</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us what you want to predict in natural language. Our AI will automatically build and optimize the perfect model for your needs.
            </p>
          </div>

          {/* Usage Warning for Free Users */}
          {user && !user.isPremium && remainingRuns <= 1 && (
            <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-premium/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Running low on free runs</h3>
                    <p className="text-sm text-muted-foreground">
                      You have {remainingRuns} run{remainingRuns !== 1 ? 's' : ''} remaining. 
                      Upgrade to Premium for unlimited model runs.
                    </p>
                    <Button
                      onClick={() => setShowPremiumModal(true)}
                      variant="premium"
                      size="sm"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Task Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Task Description */}
                  <div className="space-y-2">
                    <Label htmlFor="task-description" className="text-base font-semibold">
                      What do you want to predict?
                    </Label>
                    <Textarea
                      id="task-description"
                      placeholder="Describe your prediction task in detail. For example: 'Predict whether customers will purchase a product based on their browsing behavior, demographics, and past purchase history.'"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  {/* Task Type */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Task Type</Label>
                    <Select value={taskType} onValueChange={setTaskType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of task" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="space-y-1">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !canRunTask()}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting Pipeline...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Run AutoML Pipeline
                      </>
                    )}
                  </Button>

                  {!canRunTask() && (
                    <p className="text-sm text-center text-muted-foreground">
                      You've reached your free run limit. Upgrade to Premium to continue.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Examples Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Example Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exampleTasks.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary capitalize">
                          {example.type.replace('-', ' ')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fillExample(example.text, example.type)}
                          className="text-xs"
                        >
                          Use Example
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {example.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips for Better Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Be specific about what you want to predict</p>
                  <p>• Mention the input features you have</p>
                  <p>• Describe the expected output format</p>
                  <p>• Include any business context</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} />
    </div>
  );
};

export default TaskSetup;