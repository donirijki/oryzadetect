from PIL import Image
import numpy as np
import urllib.request
import io
import colorsys

def analyze_image(url, name):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            img = Image.open(io.BytesIO(response.read())).convert("RGB")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
        return

    img = img.resize((100, 100))
    arr = np.array(img)
    
    # Count pixels that are green, yellow, or brown
    leaf_pixels = 0
    total_pixels = 100 * 100
    
    for r in arr:
        for p in r:
            h, l, s = colorsys.rgb_to_hls(p[0]/255.0, p[1]/255.0, p[2]/255.0)
            # Hue in degrees: h * 360
            h_deg = h * 360
            # Leaf colors: Yellow-Green to Green (approx 30 to 150)
            # Brown: Hue 10-30, low lightness
            if 30 <= h_deg <= 160 and s > 0.15 and 0.1 < l < 0.9:
                leaf_pixels += 1
            elif 10 <= h_deg < 30 and s > 0.2 and l < 0.6: # Brown
                leaf_pixels += 1
                
    ratio = leaf_pixels / total_pixels
    print(f"[{name}] Leaf pixel ratio: {ratio:.1%}")

if __name__ == "__main__":
    analyze_image("https://this-person-does-not-exist.com/img/avatar-gen1188d3d922bb0cd7dc1a92e10696c141.jpg", "Human Face")
    analyze_image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s8R981W4pX1a3yQ_Y73q7L3a9L2-3P1V5Q&usqp=CAU", "Brown Spot Leaf")
    analyze_image("https://www.shutterstock.com/image-photo/rice-leaf-isolated-on-white-600nw-1808605060.jpg", "Healthy Leaf")
