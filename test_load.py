import sys
sys.path.append('backend')
from predictor import load_model
try:
    model = load_model()
    print("Model loaded.")
    print("Output shape:", model.output_shape)
except Exception as e:
    import traceback
    traceback.print_exc()
