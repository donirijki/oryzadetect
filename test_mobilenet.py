import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np
from PIL import Image
import urllib.request
import io

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
    
    preds = model.predict(x)
    decoded = decode_predictions(preds, top=3)[0]
    print(f"[{name}] Predictions:")
    for i, (imagenet_id, label, prob) in enumerate(decoded):
        print(f"  {i+1}. {label} ({prob:.2f})")

if __name__ == "__main__":
    test_image("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Pierre-Person.jpg/400px-Pierre-Person.jpg", "Human Face")
    test_image("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/400px-Gatto_europeo4.jpg", "Cat")
    test_image("https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Rice_leaves.jpg/400px-Rice_leaves.jpg", "Rice Leaf")
    test_image("https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Car_example.jpg/400px-Car_example.jpg", "Car")
