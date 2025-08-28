import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Rocket, Copy, Play, CheckCircle, ExternalLink, Code, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Deployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [testInput, setTestInput] = useState('{"feature_1": 0.5, "feature_2": 1.2, "feature_3": "category_a"}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const generatedEndpoint = `https://api.automl-agent.com/predict/${Math.random().toString(36).substr(2, 8)}`;
    setApiEndpoint(generatedEndpoint);
    setIsDeployed(true);
    setIsDeploying(false);
    
    toast({
      title: 'Deployment successful!',
      description: 'Your model is now live and ready to serve predictions.',
    });
  };

  const handleTest = async () => {
    if (!testInput.trim()) return;
    
    setIsTesting(true);
    
    try {
      const input = JSON.parse(testInput);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult = {
        prediction: Math.random() > 0.5 ? "positive" : "negative",
        confidence: (Math.random() * 0.3 + 0.7).toFixed(3),
        model: "XGBoost Classifier",
        processing_time: (Math.random() * 50 + 10).toFixed(0) + "ms",
        features_processed: Object.keys(input).length
      };
      
      setTestResult(mockResult);
      
      toast({
        title: 'Prediction successful!',
        description: `Model responded in ${mockResult.processing_time}`,
      });
    } catch (error) {
      toast({
        title: 'Invalid JSON',
        description: 'Please check your input format.',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Text has been copied to your clipboard.',
    });
  };

  const pythonCode = `import requests
import json

# Your deployed model endpoint
url = "${apiEndpoint || 'https://api.automl-agent.com/predict/your-model-id'}"

# API headers (you'll receive these after deployment)
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

# Prediction function
def predict(features):
    """
    Make a prediction using your deployed model
    
    Args:
        features (dict): Input features for prediction
        
    Returns:
        dict: Prediction result
    """
    response = requests.post(url, json={"features": features}, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API request failed: {response.status_code}")

# Example usage
sample_data = {
    "feature_1": 0.5,
    "feature_2": 1.2,
    "feature_3": "category_a"
}

try:
    result = predict(sample_data)
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Processing time: {result['processing_time']}")
except Exception as e:
    print(f"Error: {e}")`;

  const curlCommand = `curl -X POST "${apiEndpoint || 'https://api.automl-agent.com/predict/your-model-id'}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "features": {
      "feature_1": 0.5,
      "feature_2": 1.2,
      "feature_3": "category_a"
    }
  }'`;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">Deploy Your Model</h1>
            <p className="text-lg text-muted-foreground">
              Deploy your trained model to a production-ready API endpoint with one click.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deployment Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Deployment Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5" />
                    <span>One-Click Deployment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isDeployed ? (
                    <>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-2">What happens during deployment:</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Model containerization with Docker</li>
                            <li>• Auto-scaling API endpoint setup</li>
                            <li>• Load balancer and health checks</li>
                            <li>• SSL certificate and HTTPS encryption</li>
                            <li>• Monitoring and logging configuration</li>
                          </ul>
                        </div>
                        
                        <Button
                          onClick={handleDeploy}
                          variant="hero"
                          size="lg"
                          className="w-full"
                          disabled={isDeploying}
                        >
                          {isDeploying ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Deploying Model...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-5 h-5" />
                              Deploy to Production
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Success Message */}
                      <div className="flex items-center space-x-3 p-4 bg-gradient-success/10 border border-success/20 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-success" />
                        <div>
                          <h4 className="font-semibold text-success">Deployment Successful!</h4>
                          <p className="text-sm text-muted-foreground">Your model is now live and ready to serve predictions.</p>
                        </div>
                      </div>

                      {/* API Endpoint */}
                      <div className="space-y-2">
                        <Label>API Endpoint</Label>
                        <div className="flex space-x-2">
                          <Input value={apiEndpoint} readOnly className="font-mono text-sm" />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(apiEndpoint)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(apiEndpoint, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-success">✓ Live</div>
                          <div className="text-xs text-muted-foreground">Status</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-foreground">~50ms</div>
                          <div className="text-xs text-muted-foreground">Avg Response</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-foreground">99.9%</div>
                          <div className="text-xs text-muted-foreground">Uptime</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* API Testing */}
              {isDeployed && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>Test Your API</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Input JSON</Label>
                      <Textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Enter test data as JSON"
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button
                      onClick={handleTest}
                      variant="default"
                      disabled={isTesting}
                      className="w-full"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Send Test Request
                        </>
                      )}
                    </Button>

                    {testResult && (
                      <div className="space-y-2">
                        <Label>Response</Label>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Model Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Model</span>
                    <span className="text-sm font-medium">XGBoost Classifier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <Badge variant="default">94.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Features</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Model Size</span>
                    <span className="text-sm font-medium">2.4 MB</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Info */}
              <Card>
                <CardHeader>
                  <CardTitle>API Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">First 1,000 requests</span>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Per additional request</span>
                      <span className="text-sm font-medium">$0.001</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    No setup fees • Pay as you use • Cancel anytime
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Code Examples */}
          {isDeployed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Integration Examples</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="python" className="w-full">
                  <TabsList>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="python" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Python Integration</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(pythonCode)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{pythonCode}</code>
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="curl" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">cURL Command</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(curlCommand)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{curlCommand}</code>
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="javascript" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">JavaScript (Node.js)</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`const response = await fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    features: {
      feature_1: 0.5,
      feature_2: 1.2,
      feature_3: "category_a"
    }
  })
});

const result = await response.json();
console.log('Prediction:', result.prediction);
console.log('Confidence:', result.confidence);`)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`const response = await fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    features: {
      feature_1: 0.5,
      feature_2: 1.2,
      feature_3: "category_a"
    }
  })
});

const result = await response.json();
console.log('Prediction:', result.prediction);
console.log('Confidence:', result.confidence);`}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Deployment;