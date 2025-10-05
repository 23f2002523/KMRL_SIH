# ML Configuration for KMRL Train Management System
import os
from pathlib import Path

# Base paths
ML_BASE_DIR = Path(__file__).parent
PROJECT_ROOT = ML_BASE_DIR.parent
DB_PATH = PROJECT_ROOT / 'train-database.sqlite'

# ML directories
MODELS_DIR = ML_BASE_DIR / 'models'
DATA_DIR = ML_BASE_DIR / 'data'
PROCESSORS_DIR = ML_BASE_DIR / 'processors'
TRAINERS_DIR = ML_BASE_DIR / 'trainers'
PREDICTORS_DIR = ML_BASE_DIR / 'predictors'

# Model configurations
MODELS_CONFIG = {
    'maintenance_predictor': {
        'model_type': 'random_forest',
        'features': ['system_health', 'brake_system', 'engine_health', 'electrical_system', 'days_since_maintenance'],
        'target': 'days_until_next_maintenance',
        'model_path': MODELS_DIR / 'maintenance_predictor.joblib'
    },
    'health_analyzer': {
        'model_type': 'gradient_boosting',
        'features': ['system_health', 'brake_system', 'engine_health', 'electrical_system', 'maintenance_frequency'],
        'target': 'overall_health_score',
        'model_path': MODELS_DIR / 'health_analyzer.joblib'
    },
    'breakdown_predictor': {
        'model_type': 'logistic_regression',
        'features': ['system_health', 'brake_system', 'engine_health', 'electrical_system', 'days_overdue'],
        'target': 'breakdown_risk',
        'model_path': MODELS_DIR / 'breakdown_predictor.joblib'
    },
    'cost_estimator': {
        'model_type': 'linear_regression',
        'features': ['maintenance_type', 'system_health', 'train_age', 'usage_hours'],
        'target': 'estimated_cost',
        'model_path': MODELS_DIR / 'cost_estimator.joblib'
    }
}

# Data processing parameters
DATA_CONFIG = {
    'train_test_split': 0.8,
    'random_state': 42,
    'feature_scaling': True,
    'handle_missing_values': True,
    'outlier_detection': True
}

# API configurations
API_CONFIG = {
    'prediction_endpoint': '/api/ml/predict',
    'training_endpoint': '/api/ml/train',
    'health_check_endpoint': '/api/ml/health',
    'model_info_endpoint': '/api/ml/models'
}

# Training parameters
TRAINING_CONFIG = {
    'auto_retrain': True,
    'retrain_threshold': 0.05,  # Retrain if accuracy drops by 5%
    'min_training_samples': 10,
    'validation_split': 0.2,
    'cross_validation_folds': 5
}

print("🤖 ML Configuration loaded successfully!")
print(f"📁 Models directory: {MODELS_DIR}")
print(f"🗄️ Database path: {DB_PATH}")
print(f"🔧 Available models: {list(MODELS_CONFIG.keys())}")