import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Download, Rocket, Trophy, Clock, BarChart3, Code, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Model {
  id: string;
  name: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
  rank: number;
}

const Results = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(0);

  const models: Model[] = [
    {
      id: 'xgb-1',
      name: 'XGBoost Classifier',
      algorithm: 'Gradient Boosting',
      accuracy: 94.2,
      precision: 93.8,
      recall: 94.6,
      f1Score: 94.2,
      trainingTime: 127,
      rank: 1,
    },
    {
      id: 'rf-1',
      name: 'Random Forest',
      algorithm: 'Ensemble',
      accuracy: 91.7,
      precision: 90.4,
      recall: 93.1,
      f1Score: 91.7,
      trainingTime: 89,
      rank: 2,
    },
    {
      id: 'lgb-1',
      name: 'LightGBM',
      algorithm: 'Gradient Boosting',
      accuracy: 90.3,
      precision: 89.9,
      recall: 90.8,
      f1Score: 90.3,
      trainingTime: 76,
      rank: 3,
    },
  ];

  const handleDownloadModel = (model: Model) => {
    toast({
      title: 'Download started',
      description: `Downloading ${model.name} model files...`,
    });
    // Simulate download
    setTimeout(() => {
      toast({
        title: 'Download complete',
        description: 'Model files saved to your downloads folder.',
      });
    }, 2000);
  };

  const handleDownloadCode = () => {
    toast({
      title: 'Generating code package',
      description: 'Creating production-ready code with documentation...',
    });
    setTimeout(() => {
      toast({
        title: 'Code package ready',
        description: 'Complete project code downloaded as ZIP file.',
      });
    }, 3000);
  };

  const handleDeploy = () => {
    navigate('/deployment');
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const codeExample = `# Auto-generated prediction code
import joblib
import pandas as pd
import numpy as np

# Load the trained model
model = joblib.load('xgboost_model.pkl')

# Example prediction function
def predict(input_data):
    """
    Make predictions using the trained XGBoost model
    
    Args:
        input_data (dict): Input features
        
    Returns:
        dict: Prediction result with probability
    """
    # Convert input to DataFrame
    df = pd.DataFrame([input_data])
    
    # Make prediction
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0].max()
    
    return {
        'prediction': prediction,
        'confidence': probability,
        'model': 'XGBoost Classifier'
    }

# Example usage
sample_input = {
    'feature_1': 0.5,
    'feature_2': 1.2,
    'feature_3': 'category_a'
}

result = predict(sample_input)
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']:.2%}")`;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">Model Results</h1>
            <p className="text-lg text-muted-foreground">
              Your AutoML pipeline is complete! Here are the top performing models.
            </p>
          </div>

          {/* Success Banner */}
          <Card className="border-success/20 bg-gradient-to-r from-success/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Pipeline Completed Successfully!</h3>
                  <p className="text-muted-foreground">
                    Tested 12 algorithms, optimized hyperparameters, and selected the best performing models.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Model Rankings */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Top Performing Models</h2>
              
              <div className="space-y-4">
                {models.map((model, index) => (
                  <Card 
                    key={model.id}
                    className={`cursor-pointer transition-all hover-lift ${
                      selectedModel === index ? 'border-primary shadow-primary' : ''
                    }`}
                    onClick={() => setSelectedModel(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant={model.rank === 1 ? 'default' : 'secondary'} className="text-xs">
                              #{model.rank}
                            </Badge>
                            <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                            {model.rank === 1 && (
                              <Trophy className="w-5 h-5 text-premium" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{model.algorithm}</p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className={`text-2xl font-bold ${getPerformanceColor(model.accuracy)}`}>
                            {model.accuracy}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{model.precision}%</div>
                          <div className="text-xs text-muted-foreground">Precision</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{model.recall}%</div>
                          <div className="text-xs text-muted-foreground">Recall</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{model.f1Score}%</div>
                          <div className="text-xs text-muted-foreground">F1-Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{formatTime(model.trainingTime)}</div>
                          <div className="text-xs text-muted-foreground">Training</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleDownloadModel(models[selectedModel])}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    <Download className="w-5 h-5" />
                    Download Best Model
                  </Button>

                  <Button
                    onClick={handleDownloadCode}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <Code className="w-5 h-5" />
                    Download Full Code
                  </Button>

                  <Button
                    onClick={handleDeploy}
                    variant="premium"
                    size="lg"
                    className="w-full"
                  >
                    <Rocket className="w-5 h-5" />
                    Deploy to API
                  </Button>
                </CardContent>
              </Card>

              {/* Model Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {models[selectedModel].name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Algorithm</span>
                      <span className="text-sm font-medium">{models[selectedModel].algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Training Time</span>
                      <span className="text-sm font-medium">{formatTime(models[selectedModel].trainingTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cross-Validation</span>
                      <span className="text-sm font-medium">5-Fold</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Feature Count</span>
                      <span className="text-sm font-medium">24 features</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Generated Code Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="python" className="w-full">
                <TabsList>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="api">API Usage</TabsTrigger>
                  <TabsTrigger value="docs">Documentation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="python" className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{codeExample}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="api" className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`# API endpoint usage
import requests

url = "https://api.automl-agent.com/predict/your-model-id"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

data = {
    "features": {
        "feature_1": 0.5,
        "feature_2": 1.2,
        "feature_3": "category_a"
    }
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']:.2%}")`}</code>
                  </pre>
                </TabsContent>
                
                <TabsContent value="docs" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Model Documentation</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Complete model architecture and hyperparameters</li>
                      <li>• Feature importance rankings and explanations</li>
                      <li>• Performance metrics on test data</li>
                      <li>• Deployment instructions and best practices</li>
                      <li>• API documentation with examples</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;