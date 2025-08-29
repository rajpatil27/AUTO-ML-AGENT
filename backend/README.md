# AutoML Agent Backend API

This is the backend service for the AutoML Agent application. It provides a FastAPI-based API for training and deploying machine learning models using natural language instructions.

## Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

### Running the Server

Start the FastAPI server with:

```bash
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## API Documentation

### Root Endpoint

```
GET /
```

Returns a welcome message to confirm the API is running.

**Response:**
```json
{
  "message": "Welcome to AutoML Agent API"
}
```

### Train Model

```
POST /train
```

Trains a machine learning model based on a natural language prompt and uploaded dataset.

**Request:**
- `prompt` (form field, required): Natural language description of the ML task
- `file` (file upload, required): CSV or Excel file containing the dataset
- `target_column` (form field, optional): Target column name for prediction
- `task_type` (form field, optional): Type of ML task (classification or regression)
- `metric` (form field, optional, default="Accuracy"): Metric to optimize for

**Response:**
```json
{
  "model_name": "classification_loan_approved_20230615_123456",
  "model_path": "/path/to/models/classification_loan_approved_20230615_123456",
  "task_type": "classification",
  "target_column": "loan_approved",
  "metric": "Accuracy",
  "metric_value": 0.92,
  "leaderboard": [
    {
      "Model": "Random Forest Classifier",
      "Accuracy": 0.92,
      "AUC": 0.95,
      "Recall": 0.89,
      "Precision": 0.94,
      "F1": 0.91,
      "Time": 0.456
    },
    // Additional models...
  ]
}
```

### Predict

```
POST /predict
```

Makes predictions using a trained model.

**Request:**
```json
{
  "model_name": "classification_loan_approved_20230615_123456",
  "features": {
    "age": 35,
    "income": 75000,
    "education_years": 16
  }
}
```

**Response:**
```json
{
  "prediction": 1,
  "prediction_probabilities": {
    "0": 0.12,
    "1": 0.88
  },
  "model_info": {
    "model_name": "classification_loan_approved_20230615_123456",
    "model_type": "classification",
    "features_used": ["age", "income", "education_years"]
  }
}
```

### List Models

```
GET /models
```

Lists all available trained models.

**Response:**
```json
{
  "models": [
    {
      "name": "classification_loan_approved_20230615_123456",
      "type": "classification",
      "path": "/path/to/models/classification_loan_approved_20230615_123456"
    },
    // Additional models...
  ]
}
```

## Testing

A test script is provided to verify the API functionality:

```bash
python -m backend.test_api
```

This will create a sample dataset and test all API endpoints.

## Project Structure

```
backend/
├── __init__.py        # Package initialization
├── agents.py          # LlamaIndex agent implementation
├── main.py            # FastAPI application and endpoints
├── utils.py           # Utility functions
├── requirements.txt   # Dependencies
├── test_api.py        # API testing script
├── models/            # Directory for saved models
└── uploads/           # Directory for uploaded datasets
```

## Integration with Frontend

The API is designed to be consumed by the AutoML Agent frontend. The endpoints return JSON responses that can be directly used by React/Next.js applications.