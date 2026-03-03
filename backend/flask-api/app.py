from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from werkzeug.utils import secure_filename
from PIL import Image
import io
import keras


app = Flask(__name__)

# CORS configuration - allow frontend
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://bloom--plant-disease-detector.vercel.app",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ]
    }
})

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['UPLOAD_FOLDER'] = 'static/uploads'
MODEL_PATH = 'models/trained_plant_disease_model.keras'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Class names (38 plant diseases)
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Load model once at startup
print("Loading model...")
model = None
# Try loading with Keras 3 API
try:
    model = keras.saving.load_model(MODEL_PATH, compile=False)
    print(f"✅ Model loaded with Keras 3 API")
except:
    # Fallback to TF API
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print(f"✅ Model loaded with TF API")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_file):
    """Preprocess image for model prediction"""
    try:
        # Load image from file object
        img = Image.open(image_file).convert('RGB')
        
        # Resize to model input size (128x128)
        img = img.resize((128, 128))
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Expand dimensions to match model input shape (1, 128, 128, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def predict_disease(image_array):
    """Make prediction using loaded model"""
    if model is None:
        raise Exception("Model not loaded")
    
    predictions = model.predict(image_array)
    predicted_class = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class])
    
    return predicted_class, confidence

def format_disease_name(class_name):
    """Format disease name to be more readable"""
    # Split by underscores and clean up
    parts = class_name.split('___')
    plant = parts[0].replace('_', ' ')
    disease = parts[1].replace('_', ' ') if len(parts) > 1 else 'Unknown'
    
    return {
        'plant': plant,
        'disease': disease,
        'full_name': class_name
    }

@app.route('/')
def index():
    return jsonify({
        'message': '🌿 Bloom Plant Disease Detection API',
        'status': 'running',
        'model_loaded': model is not None,
        'version': '2.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict plant disease from uploaded image
    Expects: multipart/form-data with 'image' field
    Returns: JSON with disease prediction
    """
    
    # Check if model is loaded
    if model is None:
        return jsonify({'error': 'Model not loaded. Please restart the server.'}), 500
    
    # Check if image file is in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    
    # Check if file was actually selected
    if image_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Check file extension
    if not allowed_file(image_file.filename):
        return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, or JPEG.'}), 400
    
    try:
        # Preprocess image
        image_array = preprocess_image(image_file)
        
        # Make prediction
        predicted_class, confidence = predict_disease(image_array)
        
        # Get disease information
        disease_info = format_disease_name(CLASS_NAMES[predicted_class])
        
        # Prepare response
        response = {
            'success': True,
            'disease': disease_info['disease'],
            'plant': disease_info['plant'],
            'confidence': round(confidence * 100, 2),
            'full_classification': disease_info['full_name']
        }
        
        # Add treatment suggestion for common diseases
        if 'healthy' in disease_info['disease'].lower():
            response['extra'] = 'Your plant appears healthy! Keep up the good care.'
        elif 'blight' in disease_info['disease'].lower():
            response['extra'] = 'Suggested treatment: Use copper-based fungicides and remove affected leaves.'
        elif 'rust' in disease_info['disease'].lower():
            response['extra'] = 'Suggested treatment: Apply fungicides and ensure good air circulation.'
        elif 'spot' in disease_info['disease'].lower():
            response['extra'] = 'Suggested treatment: Remove infected leaves and apply appropriate fungicides.'
        else:
            response['extra'] = 'Consult with a local agricultural expert for specific treatment recommendations.'
        
        print(f"✅ Prediction: {disease_info['plant']} - {disease_info['disease']} ({confidence*100:.2f}%)")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'classes': len(CLASS_NAMES)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
