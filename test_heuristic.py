import tensorflow as tf
import numpy as np
from PIL import Image
import urllib.request
import io

def test_heuristic(img_url, name):
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            img = Image.open(io.BytesIO(response.read())).convert("RGB")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
        return

    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    
    hsv = tf.image.rgb_to_hsv(arr)
    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]
    
    # 1. Total leaf colors (Brown, Yellow, Green): Hue 0.05 to 0.45
    valid_hue_all = tf.logical_and(h >= 0.05, h <= 0.45)
    valid_sat = s >= 0.15
    valid_val = v >= 0.15
    is_leaf_all = tf.logical_and(valid_hue_all, tf.logical_and(valid_sat, valid_val))
    ratio_all = tf.reduce_mean(tf.cast(is_leaf_all, tf.float32)).numpy()
    
    # 2. Strict Green/Yellow (Hue 0.15 to 0.45)
    valid_hue_green = tf.logical_and(h >= 0.15, h <= 0.45)
    is_leaf_green = tf.logical_and(valid_hue_green, tf.logical_and(valid_sat, valid_val))
    ratio_green = tf.reduce_mean(tf.cast(is_leaf_green, tf.float32)).numpy()
    
    print(f"[{name}] All (Brown/Yel/Grn) ratio: {ratio_all:.1%} | Strict (Yel/Grn) ratio: {ratio_green:.1%}")

if __name__ == "__main__":
    # Face (asian skin tone, similar to user)
    test_heuristic("https://this-person-does-not-exist.com/img/avatar-gen1188d3d922bb0cd7dc1a92e10696c141.jpg", "Human Face")
    # Brown Spot leaf
    test_heuristic("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s8R981W4pX1a3yQ_Y73q7L3a9L2-3P1V5Q&usqp=CAU", "Brown Spot Leaf")
    # Healthy Rice Leaf
    test_heuristic("https://www.shutterstock.com/image-photo/rice-leaf-isolated-on-white-600nw-1808605060.jpg", "Healthy Leaf")
