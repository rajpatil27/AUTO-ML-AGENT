import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import pandas as pd
import json
import logging
from dotenv import load_dotenv

# Import our agent module
from backend.agents import create_agent, process_user_query, train_tabular_model
# Import utility functions
from backend.utils import (
    save_uploaded_file, convert_excel_to_csv, load_dataset, validate_dataset,
    infer_task_type, get_model_path, list_available_models, format_model_results,
    UPLOADS_DIR, MODELS_DIR
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AutoML Agent API",
    description="API for training and deploying machine learning models using natural language",
    version="1.0.0"
)

# Add CORS middleware
origins = [
    "http://localhost:5173",    # Vite dev server default
    "http://localhost:3000",    # Alternative dev port
    "http://127.0.0.1:5173",   # Alternative localhost
    "http://127.0.0.1:3000",   # Alternative localhost
]

# In production, add your deployment domains
if os.getenv("PRODUCTION") == "true":
    production_domain = os.getenv("PRODUCTION_DOMAIN")
    if production_domain:
        origins.append(f"https://{production_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Directories are already ensured in utils.py

# Create the agent
agent = create_agent()

# Define request and response models
class TrainRequest(BaseModel):
    prompt: str = Field(..., description="Natural language description of the ML task")
    target_column: Optional[str] = Field(None, description="Target column name for prediction")
    task_type: Optional[str] = Field(None, description="Type of ML task (classification or regression)")
    metric: Optional[str] = Field("Accuracy", description="Metric to optimize for")

class PredictionRequest(BaseModel):
    model_name: str = Field(..., description="Name of the saved model to use for prediction")
    features: Dict[str, Any] = Field(..., description="Feature values for prediction")

class PredictionResponse(BaseModel):
    prediction: Any
    prediction_probabilities: Optional[Dict[str, float]] = None
    model_info: Dict[str, Any]

@app.get("/")
async def root():
    return {"message": "Welcome to AutoML Agent API"}

@app.post("/train")
async def train_model(
    prompt: str = Form(...),
    file: Optional[UploadFile] = File(None),
    target_column: Optional[str] = Form(None),
    task_type: Optional[str] = Form(None),
    metric: Optional[str] = Form("Accuracy")
):
    """
    Train a machine learning model based on a natural language prompt and uploaded dataset.
    """
    try:
        dataset_path = None
        
        # Handle file upload if provided
        if file:
            # Check file extension
            file_extension = os.path.splitext(file.filename)[1]
            if file_extension.lower() not in [".csv", ".xlsx", ".xls"]:
                raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
            
            # Save the uploaded file
            dataset_path = save_uploaded_file(file)
            
            # If it's an Excel file, convert to CSV for easier processing
            if file_extension.lower() in [".xlsx", ".xls"]:
                dataset_path = convert_excel_to_csv(dataset_path)
        else:
            # No file provided
            return JSONResponse(
                status_code=400,
                content={"error": "No dataset file provided. Please upload a CSV or Excel file."}
            )
        
        # Load and validate the dataset
        df = load_dataset(dataset_path)
        is_valid, error_message = validate_dataset(df, target_column)
        
        if not is_valid:
            return JSONResponse(
                status_code=400,
                content={"error": error_message}
            )
        
        # Infer task type if not provided
        if target_column and not task_type:
            task_type = infer_task_type(df, target_column)
            logger.info(f"Inferred task type: {task_type}")
        
        # Process the request
        if target_column:
            # If target column is explicitly provided, use it directly with train_tabular_model
            logger.info(f"Training model with explicit target column: {target_column}")
            result = train_tabular_model(
                dataset_path=dataset_path,
                target=target_column,
                task_type=task_type,
                metric=metric
            )
        else:
            # Otherwise, use the agent to process the natural language prompt
            logger.info(f"Processing prompt with agent: {prompt}")
            result = process_user_query(agent, prompt, dataset_path)
        
        # Check for errors
        if "error" in result:
            return JSONResponse(
                status_code=400,
                content={"error": result["error"]}
            )
        
        # Format and return the result
        return format_model_results(result)
        
    except Exception as e:
        logger.error(f"Error in train_model endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest
):
    """
    Make predictions using a trained model.
    """
    try:
        model_name = request.model_name
        features = request.features
        
        # Get model path and check if it exists
        model_path = get_model_path(model_name)
        
        # Determine if it's a classification or regression model based on the name
        is_classification = "classification" in model_name.lower()
        
        # Load the appropriate PyCaret module
        if is_classification:
            from pycaret.classification import load_model, predict_model
        else:
            from pycaret.regression import load_model, predict_model
        
        # Load the model
        model = load_model(model_path)
        
        # Create a DataFrame from the features
        input_data = pd.DataFrame([features])
        
        # Make prediction
        predictions = predict_model(model, data=input_data)
        
        # Extract the prediction
        prediction_col = 'prediction_label' if is_classification else 'prediction_label'
        prediction = predictions[prediction_col].iloc[0]
        
        # For classification, get probabilities if available
        prediction_probabilities = None
        if is_classification and any(col.startswith('prediction_score_') for col in predictions.columns):
            prediction_probabilities = {
                col.replace('prediction_score_', ''): float(predictions[col].iloc[0])
                for col in predictions.columns if col.startswith('prediction_score_')
            }
        
        # Get model info
        model_info = {
            "model_name": model_name,
            "model_type": "classification" if is_classification else "regression",
            "features_used": list(input_data.columns)
        }
        
        return {
            "prediction": prediction,
            "prediction_probabilities": prediction_probabilities,
            "model_info": model_info
        }
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    """
    List all available trained models.
    """
    try:
        models = list_available_models()
        return {"models": models}
        
    except Exception as e:
        logger.error(f"Error in list_models endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add an __init__.py file to make the backend directory a proper package
init_path = os.path.join(os.path.dirname(__file__), "__init__.py")
if not os.path.exists(init_path):
    with open(init_path, "w") as f:
        f.write("# Backend package\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)