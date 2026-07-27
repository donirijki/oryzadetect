import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np
from PIL import Image
import urllib.request
import io
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

model = MobileNetV2(weights='imagenet')

def test_image(url, name):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            img = Image.open(io.BytesIO(response.read())).convert("RGB")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
        return

    img = img.resize((224, 224))
    x = np.expand_dims(np.array(img), axis=0)
    x = preprocess_input(x)
    
    preds = model.predict(x, verbose=0)
    decoded = decode_predictions(preds, top=5)[0]
    print(f"[{name}] Predictions:")
    for i, (imagenet_id, label, prob) in enumerate(decoded):
        print(f"  {i+1}. {label} ({prob:.2f})")

if __name__ == "__main__":
    test_image("https://this-person-does-not-exist.com/img/avatar-gen1188d3d922bb0cd7dc1a92e10696c141.jpg", "Human Face")
    test_image("https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg", "Cat")
    test_image("https://upload.wikimedia.org/wikipedia/commons/4/41/Rice_leaves.jpg", "Rice Leaf")
    test_image("https://upload.wikimedia.org/wikipedia/commons/6/63/Car_example.jpg", "Car")
    test_image("https://upload.wikimedia.org/wikipedia/commons/9/9e/Oryza_sativa_-_Rice_Plant_-_Kalyani_2013-08-16_1054.JPG", "Rice Plant")
