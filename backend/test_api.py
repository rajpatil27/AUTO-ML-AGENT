import requests
import pandas as pd
import numpy as np
import os
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")
os.makedirs(TEST_DATA_DIR, exist_ok=True)

# Create a sample dataset for testing
def create_sample_dataset():
    # Create a simple classification dataset
    np.random.seed(42)
    n_samples = 100
    
    # Features
    age = np.random.randint(18, 65, n_samples)
    income = np.random.randint(20000, 100000, n_samples)
    education_years = np.random.randint(8, 20, n_samples)
    
    # Target: loan_approved (0 or 1)
    # Simple rule: age > 25 and income > 40000 and education_years > 12 increases chances
    probability = (age > 25) * 0.3 + (income > 40000) * 0.4 + (education_years > 12) * 0.3
    loan_approved = np.random.binomial(1, probability)
    
    # Create DataFrame
    df = pd.DataFrame({
        'age': age,
        'income': income,
        'education_years': education_years,
        'loan_approved': loan_approved
    })
    
    # Save to CSV
    csv_path = os.path.join(TEST_DATA_DIR, "loan_approval.csv")
    df.to_csv(csv_path, index=False)
    print(f"Created sample dataset at {csv_path}")
    
    return csv_path

# Test the /train endpoint with explicit target column
def test_train_explicit():
    print("\n=== Testing /train endpoint with explicit target column ===")
    
    # Ensure we have a test dataset
    dataset_path = create_sample_dataset()
    
    # Prepare the request
    url = f"{BASE_URL}/train"
    
    with open(dataset_path, 'rb') as f:
        files = {'file': ('loan_approval.csv', f, 'text/csv')}
        data = {
            'prompt': 'Train a model to predict loan approval',
            'target_column': 'loan_approved',
            'task_type': 'classification',
            'metric': 'Accuracy'
        }
        
        # Send the request
        print("Sending request to /train endpoint...")
        response = requests.post(url, files=files, data=data)
    
    # Check the response
    if response.status_code == 200:
        print("Training successful!")
        result = response.json()
        print(f"Model name: {result.get('model_name')}")
        print(f"Model path: {result.get('model_path')}")
        print(f"Metric value: {result.get('metric_value')}")
        
        # Save the model name for prediction test
        model_name = result.get('model_name')
        return model_name
    else:
        print(f"Training failed with status code {response.status_code}")
        print(f"Error: {response.text}")
        return None

# Test the /train endpoint with agent processing
def test_train_agent():
    print("\n=== Testing /train endpoint with agent processing ===")
    
    # Ensure we have a test dataset
    dataset_path = create_sample_dataset()
    
    # Prepare the request
    url = f"{BASE_URL}/train"
    
    with open(dataset_path, 'rb') as f:
        files = {'file': ('loan_approval.csv', f, 'text/csv')}
        data = {
            'prompt': 'Train a classification model to predict if a loan will be approved based on age, income, and education years. The target column is loan_approved.',
        }
        
        # Send the request
        print("Sending request to /train endpoint with agent processing...")
        response = requests.post(url, files=files, data=data)
    
    # Check the response
    if response.status_code == 200:
        print("Training with agent successful!")
        result = response.json()
        print(f"Model name: {result.get('model_name')}")
        print(f"Model path: {result.get('model_path')}")
        print(f"Metric value: {result.get('metric_value')}")
        
        # Save the model name for prediction test
        model_name = result.get('model_name')
        return model_name
    else:
        print(f"Training with agent failed with status code {response.status_code}")
        print(f"Error: {response.text}")
        return None

# Test the /predict endpoint
def test_predict(model_name):
    if not model_name:
        print("Cannot test prediction without a model name")
        return
    
    print(f"\n=== Testing /predict endpoint with model {model_name} ===")
    
    # Prepare the request
    url = f"{BASE_URL}/predict"
    
    # Sample data for prediction
    data = {
        "model_name": model_name,
        "features": {
            "age": 35,
            "income": 75000,
            "education_years": 16
        }
    }
    
    # Send the request
    print("Sending request to /predict endpoint...")
    response = requests.post(url, json=data)
    
    # Check the response
    if response.status_code == 200:
        print("Prediction successful!")
        result = response.json()
        print(f"Prediction: {result.get('prediction')}")
        print(f"Prediction probabilities: {result.get('prediction_probabilities')}")
        print(f"Model info: {result.get('model_info')}")
    else:
        print(f"Prediction failed with status code {response.status_code}")
        print(f"Error: {response.text}")

# Test the /models endpoint
def test_list_models():
    print("\n=== Testing /models endpoint ===")
    
    # Prepare the request
    url = f"{BASE_URL}/models"
    
    # Send the request
    print("Sending request to /models endpoint...")
    response = requests.get(url)
    
    # Check the response
    if response.status_code == 200:
        print("Listing models successful!")
        result = response.json()
        models = result.get('models', [])
        print(f"Found {len(models)} models:")
        for model in models:
            print(f"  - {model.get('name')} ({model.get('type')})")
    else:
        print(f"Listing models failed with status code {response.status_code}")
        print(f"Error: {response.text}")

# Run all tests
def run_tests():
    print("Starting API tests...")
    
    # Test explicit training
    model_name = test_train_explicit()
    
    # Test prediction with the trained model
    if model_name:
        test_predict(model_name)
    
    # Test agent-based training
    agent_model_name = test_train_agent()
    
    # Test prediction with the agent-trained model
    if agent_model_name:
        test_predict(agent_model_name)
    
    # Test listing models
    test_list_models()
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    run_tests()