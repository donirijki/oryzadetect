"""
Debug OOD: test gambar daun padi penyakit + kucing
untuk lihat nilai numerik tiap gate.
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
from PIL import Image
import io, urllib.request
import tensorflow as tf

def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

def leaf_score(region):
    hsv = tf.image.rgb_to_hsv(region)
    h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
    gm = tf.logical_and(tf.logical_and(h>=0.15, h<=0.42), tf.logical_and(s>=0.18, v>=0.12))
    bm = tf.logical_and(tf.logical_and(h>=0.04, h<=0.18), tf.logical_and(s>=0.18, tf.logical_and(v>=0.15, v<=0.92)))
    nm = s < 0.12
    sh = tf.logical_or(h<=0.09, h>=0.93)
    sm = tf.logical_and(sh, tf.logical_and(s>=0.10, tf.logical_and(s<=0.70, v>=0.25)))
    g = float(tf.reduce_mean(tf.cast(gm, tf.float32)))
    b = float(tf.reduce_mean(tf.cast(bm, tf.float32)))
    n = float(tf.reduce_mean(tf.cast(nm, tf.float32)))
    sk = float(tf.reduce_mean(tf.cast(sm, tf.float32)))
    return g, b, g+b*0.7, n, sk

def crop_center(img, frac):
    H, W = img.shape[0], img.shape[1]
    mh = int(H*(1-frac)/2); mw = int(W*(1-frac)/2)
    return img[mh:H-mh, mw:W-mw, :]

def green_dist(img):
    H, W = img.shape[0], img.shape[1]
    hsv = tf.image.rgb_to_hsv(img)
    h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
    gm = tf.logical_and(tf.logical_and(h>=0.13, h<=0.45), tf.logical_and(s>=0.15, v>=0.10))
    gf = tf.cast(gm, tf.float32).numpy()
    mh = int(H*0.35); mw = int(W*0.35)
    cg = float(np.mean(gf[mh:H-mh, mw:W-mw])) if gf[mh:H-mh, mw:W-mw].size>0 else 0
    em = np.ones_like(gf, dtype=bool); em[mh:H-mh, mw:W-mw] = False
    eg = float(np.mean(gf[em])) if gf[em].size>0 else 0
    diff = max(0.0, eg - cg)
    uni = max(0.0, 1.0 - diff*3.0)
    return cg, eg, uni

def analyze(image_bytes, label):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224,224))
    arr = np.array(img, dtype=np.float32) / 255.0

    g_f, br_f, sc_f, n_f, sk_f = leaf_score(arr)
    g_m, br_m, sc_m, n_m, sk_m = leaf_score(crop_center(arr, 0.50))
    g_c, br_c, sc_c, n_c, sk_c = leaf_score(crop_center(arr, 0.20))
    cg, eg, uni = green_dist(arr)
    sat = float(tf.reduce_mean(tf.image.rgb_to_hsv(arr)[:,:,1]))

    print(f"\n{'='*65}")
    print(f"  {label}")
    print(f"{'='*65}")
    print(f"  score_full={sc_f:.2%}  score_mid={sc_m:.2%}  score_core={sc_c:.2%}")
    print(f"  g_full={g_f:.2%}  g_mid={g_m:.2%}  g_core={g_c:.2%}")
    print(f"  br_core={br_c:.2%}  skin_full={sk_f:.2%}  neutral_core={n_c:.2%}")
    print(f"  center_green={cg:.2%}  edge_green={eg:.2%}  uniformity={uni:.3f}")
    print(f"  mean_sat={sat:.3f}")

    # Simulate ALL gates
    results = []
    def gate(name, cond, msg):
        status = "REJECT" if cond else "pass"
        results.append((name, status, msg))

    gate("Gate 1 skin",     sk_f > 0.15,    f"skin={sk_f:.2%} > 15%")
    gate("Gate 2 grayscale",sat < 0.08,     f"sat={sat:.3f} < 0.08")
    gate("Gate 3 core",     sc_c < 0.25,    f"score_core={sc_c:.2%} < 25%")
    gate("Gate 4 neutral",  n_c>0.55 and sc_c<0.30, f"neutral={n_c:.2%}, core={sc_c:.2%}")
    gate("Gate 5 mid",      sc_m < 0.20,    f"score_mid={sc_m:.2%} < 20%")
    gate("Gate 6 full",     sc_f < 0.10,    f"score_full={sc_f:.2%} < 10%")
    gate("Gate 7 edge/ctr", eg>0.35 and cg<0.25, f"edge={eg:.2%} center={cg:.2%}")
    gate("Gate 8 full>>core", sc_f>0.20 and sc_c<0.28 and (sc_f-sc_c)>0.12, 
         f"full={sc_f:.2%} core={sc_c:.2%} diff={sc_f-sc_c:.2%}")
    gate("Gate 9 uniform",  sc_f>0.15 and uni<0.40, f"uni={uni:.3f} full={sc_f:.2%}")
    cg_eg = cg/(eg+1e-6) if eg>0.20 else 999
    gate("Gate 10 ratio",   eg>0.20 and cg_eg<0.40, f"cg/eg={cg_eg:.3f}")

    rejects = [r for r in results if r[1]=="REJECT"]
    print(f"\n  Gate results:")
    for name, status, msg in results:
        marker = "  [X]" if status=="REJECT" else "  [ok]"
        print(f"  {marker} {name}: {msg}")

    if rejects:
        print(f"\n  >>> REJECTED by {len(rejects)} gate(s): {', '.join(r[0] for r in rejects)}")
    else:
        print(f"\n  >>> PASSED (semua gate lolos)")
    print()

TESTS = [
    # Daun padi sakit
    ("https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", "Rice leaf disease (Unsplash)"),
    ("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Rice_Blast_Disease.jpg/640px-Rice_Blast_Disease.jpg", "Rice Blast Disease (Wikipedia)"),
    # Daun padi sehat
    ("https://images.unsplash.com/photo-1536304993881-460e32498811?w=400", "Rice field green (Unsplash)"),
    # Kucing outdoor
    ("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400", "Cat outdoor (Unsplash)"),
    ("https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400", "White cat garden (Unsplash)"),
]

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "rb") as f:
            analyze(f.read(), sys.argv[1])
    else:
        for url, name in TESTS:
            try:
                print(f"Downloading {name}...")
                analyze(download(url), name)
            except Exception as e:
                print(f"  SKIP ({e})")
