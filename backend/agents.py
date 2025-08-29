import os
import pandas as pd
from typing import Optional, Dict, Any, List
from llama_index.core.tools import FunctionTool
from llama_index.agent.openai import OpenAIFunctionCallingAgent
from llama_index.core.llms import ChatMessage, MessageRole
from pycaret.classification import *
from pycaret.regression import *
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure models directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)

def train_tabular_model(dataset_path: str, target: str, task_type: Optional[str] = None, metric: str = "Accuracy") -> Dict[str, Any]:
    """
    Train a machine learning model on tabular data using PyCaret.
    
    Args:
        dataset_path: Path to the CSV dataset
        target: Target column name for prediction
        task_type: Type of ML task ('classification' or 'regression'). If None, will be inferred.
        metric: Metric to optimize for (e.g., 'Accuracy', 'AUC', 'RMSE', 'MAE')
        
    Returns:
        Dict containing model information, performance metrics, and path to saved model
    """
    try:
        logger.info(f"Loading dataset from {dataset_path}")
        data = pd.read_csv(dataset_path)
        
        # Basic data validation
        if target not in data.columns:
            return {"error": f"Target column '{target}' not found in dataset. Available columns: {', '.join(data.columns)}"}
        
        # Infer task type if not provided
        if task_type is None:
            unique_values = data[target].nunique()
            if unique_values <= 10 and pd.api.types.is_numeric_dtype(data[target]):
                task_type = "classification"
            elif unique_values > 10 and pd.api.types.is_numeric_dtype(data[target]):
                task_type = "regression"
            else:
                task_type = "classification"
        
        logger.info(f"Detected task type: {task_type}")
        
        # Initialize the appropriate PyCaret environment
        if task_type.lower() == "classification":
            setup_func = setup
            compare_func = compare_models
            create_func = create_model
            tune_func = tune_model
            save_func = save_model
        elif task_type.lower() == "regression":
            setup_func = regression.setup
            compare_func = regression.compare_models
            create_func = regression.create_model
            tune_func = regression.tune_model
            save_func = regression.save_model
        else:
            return {"error": f"Unsupported task type: {task_type}. Use 'classification' or 'regression'."}
        
        # Setup the experiment
        logger.info(f"Setting up PyCaret experiment for {task_type} with target: {target}")
        setup_func(data=data, target=target, session_id=42, verbose=False)
        
        # Train and compare models
        logger.info(f"Training and comparing models using metric: {metric}")
        best_model = compare_func(sort=metric, verbose=False)
        
        # Get model name for saving
        model_name = type(best_model).__name__
        
        # Fine-tune the best model
        logger.info(f"Fine-tuning the best model: {model_name}")
        tuned_model = tune_func(best_model, optimize=metric, verbose=False)
        
        # Generate a unique model filename
        model_filename = f"{task_type}_{model_name}_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}"
        model_path = os.path.join(os.path.dirname(__file__), 'models', model_filename)
        
        # Save the model
        logger.info(f"Saving model to {model_path}")
        save_func(tuned_model, model_path)
        
        # Get the leaderboard
        leaderboard = pull()
        leaderboard_dict = leaderboard.to_dict(orient='records')
        
        return {
            "success": True,
            "model_name": model_filename,
            "model_path": model_path,
            "task_type": task_type,
            "target_column": target,
            "metric": metric,
            "performance": {
                metric: float(leaderboard.iloc[0][metric]) if metric in leaderboard.columns else None,
                "additional_metrics": {col: float(leaderboard.iloc[0][col]) for col in leaderboard.columns if col != metric}
            },
            "leaderboard": leaderboard_dict
        }
        
    except Exception as e:
        logger.error(f"Error in train_tabular_model: {str(e)}")
        return {"error": str(e)}

# Create a FunctionTool from the train_tabular_model function
train_model_tool = FunctionTool.from_defaults(
    fn=train_tabular_model,
    name="train_tabular_model",
    description="Train a machine learning model on tabular data using PyCaret"
)

def create_agent(api_key: Optional[str] = None):
    """
    Create a LlamaIndex FunctionCallingAgent with the train_tabular_model tool.
    
    Args:
        api_key: OpenAI API key (if None, will use OPENAI_API_KEY environment variable)
        
    Returns:
        OpenAIFunctionCallingAgent instance
    """
    # Create the agent with the train_model_tool
    agent = OpenAIFunctionCallingAgent.from_tools(
        [train_model_tool],
        verbose=True,
        system_prompt="""You are an AI assistant specialized in machine learning. 
        Your task is to help users train machine learning models on tabular data.
        When the user provides a dataset and a description of what they want to predict,
        use the train_tabular_model tool to train a model.
        Always ask clarifying questions if the target column is not clear.
        """
    )
    
    return agent

def process_user_query(agent, query: str, dataset_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Process a user query using the agent.
    
    Args:
        agent: The FunctionCallingAgent instance
        query: User's natural language query
        dataset_path: Optional path to the dataset
        
    Returns:
        Dict containing the agent's response and any tool outputs
    """
    try:
        # Extract target column and task type from the query
        # This is a simple heuristic and could be improved
        target = None
        task_type = None
        
        if "predict" in query.lower():
            # Try to extract what comes after "predict"
            predict_parts = query.lower().split("predict")
            if len(predict_parts) > 1:
                target_part = predict_parts[1].strip()
                # Look for potential column names
                words = target_part.split()
                if words:
                    target = words[0].strip("., ")
        
        if "classification" in query.lower():
            task_type = "classification"
        elif "regression" in query.lower() or "predict value" in query.lower():
            task_type = "regression"
        
        # If we have a dataset path and could extract a target, we can directly call the tool
        if dataset_path and target:
            logger.info(f"Directly calling train_tabular_model with target={target}, task_type={task_type}")
            result = train_tabular_model(dataset_path=dataset_path, target=target, task_type=task_type)
            return {
                "response": f"Trained a model to predict {target} using {result.get('model_name', 'unknown model')}",
                "tool_output": result
            }
        
        # Otherwise, let the agent handle it
        logger.info(f"Processing query with agent: {query}")
        response = agent.chat(query)
        
        # Extract tool outputs if any
        tool_outputs = []
        for step in response.sources:
            if hasattr(step, 'tool_name') and step.tool_name == "train_tabular_model":
                tool_outputs.append(step.response)
        
        return {
            "response": response.response,
            "tool_output": tool_outputs[0] if tool_outputs else None
        }
        
    except Exception as e:
        logger.error(f"Error in process_user_query: {str(e)}")
        return {"error": str(e)}