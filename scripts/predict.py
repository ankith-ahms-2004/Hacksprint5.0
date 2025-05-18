import pickle
import sys
import json
import os
import numpy as np
from PIL import Image
import io
import base64

# Path to the model file
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'crop_disease_detection.pkl')

def load_model():
    """Load the pickled model"""
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(json.dumps({'error': f'Failed to load model: {str(e)}'}))
        sys.exit(1)

def preprocess_image(image_bytes):
    """Preprocess the image for the model"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        
        image = image.resize((224, 224))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        img_array = np.array(image) / 255.0
        
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(json.dumps({'error': f'Failed to preprocess image: {str(e)}'}))
        sys.exit(1)

def predict(image_base64):
    """Make prediction using the loaded model"""
    try:
        image_bytes = base64.b64decode(image_base64)
        
        model = load_model()
        
        processed_image = preprocess_image(image_bytes)
        
        prediction = model.predict(processed_image)
        
        
        result = process_prediction_result(prediction)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': f'Prediction failed: {str(e)}'}))
        sys.exit(1)

def process_prediction_result(prediction):
    """Process the raw prediction results into a more usable format"""
    
    predicted_class = int(np.argmax(prediction[0]))
    
    disease_classes = [
        'Healthy',
        'Apple Scab',
        'Black Rot',
        'Cedar Apple Rust',
        'Powdery Mildew',
    ]
    
    if 0 <= predicted_class < len(disease_classes):
        disease_name = disease_classes[predicted_class]
    else:
        disease_name = f'Unknown (Class {predicted_class})'
    
    confidence = float(prediction[0][predicted_class])
    
    return {
        'disease': disease_name,
        'confidence': confidence,
        'class_index': predicted_class
    }

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Invalid arguments. Expected base64 encoded image.'}))
        sys.exit(1)
    
    image_base64 = sys.argv[1]
    predict(image_base64)
