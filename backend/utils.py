import os
import shutil
import uuid
import pandas as pd
import json
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
from fastapi import HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def save_uploaded_file(file, directory: str = UPLOADS_DIR) -> str:
    """
    Save an uploaded file to the specified directory with a unique filename.
    
    Args:
        file: The uploaded file object
        directory: Directory to save the file (default: UPLOADS_DIR)
        
    Returns:
        str: Path to the saved file
    """
    try:
        # Get file extension
        file_extension = os.path.splitext(file.filename)[1]
        
        # Create a unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(directory, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Saved uploaded file to {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error saving uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

def convert_excel_to_csv(excel_path: str) -> str:
    """
    Convert an Excel file to CSV format.
    
    Args:
        excel_path: Path to the Excel file
        
    Returns:
        str: Path to the converted CSV file
    """
    try:
        # Read Excel file
        excel_df = pd.read_excel(excel_path)
        
        # Create a unique CSV filename
        csv_filename = f"{uuid.uuid4()}.csv"
        csv_path = os.path.join(UPLOADS_DIR, csv_filename)
        
        # Save as CSV
        excel_df.to_csv(csv_path, index=False)
        
        logger.info(f"Converted Excel to CSV: {csv_path}")
        return csv_path
        
    except Exception as e:
        logger.error(f"Error converting Excel to CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting Excel to CSV: {str(e)}")

def load_dataset(file_path: str) -> pd.DataFrame:
    """
    Load a dataset from a file path.
    
    Args:
        file_path: Path to the dataset file (CSV or Excel)
        
    Returns:
        pd.DataFrame: Loaded dataset
    """
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == ".csv":
            return pd.read_csv(file_path)
        elif file_extension in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
            
    except Exception as e:
        logger.error(f"Error loading dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

def validate_dataset(df: pd.DataFrame, target_column: Optional[str] = None) -> Tuple[bool, str]:
    """
    Validate a dataset for machine learning tasks.
    
    Args:
        df: DataFrame to validate
        target_column: Target column name (if specified)
        
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    # Check if DataFrame is empty
    if df.empty:
        return False, "Dataset is empty"
    
    # Check if DataFrame has at least 10 rows (arbitrary minimum for ML)
    if len(df) < 10:
        return False, "Dataset has too few rows for meaningful ML (minimum 10)"
    
    # If target column is specified, validate it
    if target_column:
        # Check if target column exists
        if target_column not in df.columns:
            return False, f"Target column '{target_column}' not found in dataset"
        
        # Check if target column has missing values
        if df[target_column].isna().any():
            return False, f"Target column '{target_column}' contains missing values"
    
    return True, ""

def infer_task_type(df: pd.DataFrame, target_column: str) -> str:
    """
    Infer whether a task is classification or regression based on the target column.
    
    Args:
        df: DataFrame containing the dataset
        target_column: Name of the target column
        
    Returns:
        str: 'classification' or 'regression'
    """
    # Get the target column
    target = df[target_column]
    
    # Check if target is numeric
    is_numeric = pd.api.types.is_numeric_dtype(target)
    
    # Check number of unique values
    unique_count = target.nunique()
    
    # Heuristic: If numeric and many unique values, likely regression
    # If few unique values or categorical, likely classification
    if is_numeric and unique_count > 10 and unique_count / len(target) > 0.05:
        return "regression"
    else:
        return "classification"

def get_model_path(model_name: str) -> str:
    """
    Get the full path to a saved model.
    
    Args:
        model_name: Name of the model
        
    Returns:
        str: Full path to the model
    """
    model_path = os.path.join(MODELS_DIR, model_name)
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    
    return model_path

def list_available_models() -> List[Dict[str, Any]]:
    """
    List all available trained models.
    
    Returns:
        List[Dict[str, Any]]: List of model information dictionaries
    """
    models = []
    
    try:
        for model_name in os.listdir(MODELS_DIR):
            model_path = os.path.join(MODELS_DIR, model_name)
            if os.path.isdir(model_path):
                # Determine model type from name
                model_type = "classification" if "classification" in model_name.lower() else "regression"
                models.append({
                    "name": model_name,
                    "type": model_type,
                    "path": model_path
                })
        
        return models
        
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return []

def format_model_results(results: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format model training results for API response.
    
    Args:
        results: Raw results from model training
        
    Returns:
        Dict[str, Any]: Formatted results
    """
    formatted = {
        "model_name": results.get("model_name", ""),
        "model_path": results.get("model_path", ""),
        "task_type": results.get("task_type", ""),
        "target_column": results.get("target_column", ""),
        "metric": results.get("metric", ""),
        "metric_value": results.get("metric_value", 0),
    }
    
    # Add leaderboard if available
    if "leaderboard" in results:
        # Convert DataFrame to dict if needed
        if isinstance(results["leaderboard"], pd.DataFrame):
            formatted["leaderboard"] = results["leaderboard"].to_dict(orient="records")
        else:
            formatted["leaderboard"] = results["leaderboard"]
    
    return formatted