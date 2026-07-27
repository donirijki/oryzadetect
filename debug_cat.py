"""
Debug OOD values untuk gambar kucing.
Jalankan: python debug_cat.py
Atau dengan file lokal: python debug_cat.py gambar_kucing.jpg
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')  # Fix Windows encoding
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

import numpy as np
from PIL import Image
import io
import urllib.request

def load_image_from_url(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.read()

def load_image_from_file(path):
    with open(path, "rb") as f:
        return f.read()

def analyze(image_bytes, label):
    import tensorflow as tf

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    arr_np = np.array(img, dtype=np.float32) / 255.0
    arr    = np.expand_dims(arr_np, 0)
    img_t  = arr_np  # (224,224,3)

    def leaf_score(region):
        hsv = tf.image.rgb_to_hsv(region)
        h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
        gm = tf.logical_and(tf.logical_and(h>=0.15, h<=0.42), tf.logical_and(s>=0.18, v>=0.12))
        bm = tf.logical_and(tf.logical_and(h>=0.04, h<=0.18), tf.logical_and(s>=0.18, tf.logical_and(v>=0.15, v<=0.92)))
        nm = s < 0.12
        sh = tf.logical_or(h<=0.09, h>=0.93)
        sm = tf.logical_and(sh, tf.logical_and(s>=0.10, tf.logical_and(s<=0.70, v>=0.25)))
        g_r  = float(tf.reduce_mean(tf.cast(gm, tf.float32)))
        br_r = float(tf.reduce_mean(tf.cast(bm, tf.float32)))
        n_r  = float(tf.reduce_mean(tf.cast(nm, tf.float32)))
        sk_r = float(tf.reduce_mean(tf.cast(sm, tf.float32)))
        return g_r, br_r, g_r + br_r*0.7, n_r, sk_r

    def crop_center(img, frac):
        H, W = img.shape[0], img.shape[1]
        mh = int(H*(1-frac)/2); mw = int(W*(1-frac)/2)
        return img[mh:H-mh, mw:W-mw, :]

    def dist_score(img):
        H, W = img.shape[0], img.shape[1]
        hsv = tf.image.rgb_to_hsv(img)
        h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
        gm = tf.logical_and(tf.logical_and(h>=0.13, h<=0.45), tf.logical_and(s>=0.15, v>=0.10))
        gf = tf.cast(gm, tf.float32).numpy()
        mh = int(H*0.35); mw = int(W*0.35)
        cg = float(np.mean(gf[mh:H-mh, mw:W-mw]))
        em = np.ones_like(gf, dtype=bool); em[mh:H-mh, mw:W-mw] = False
        eg = float(np.mean(gf[em]))
        diff = max(0.0, eg - cg)
        uni  = max(0.0, 1.0 - diff*3.0)
        cb   = float(np.mean(v.numpy()[mh:H-mh, mw:W-mw]))
        return cg, eg, uni, cb

    g_full,  br_full,  sc_full,  n_full,  sk_full  = leaf_score(img_t)
    g_mid,   br_mid,   sc_mid,   n_mid,   sk_mid   = leaf_score(crop_center(img_t, 0.50))
    g_core,  br_core,  sc_core,  n_core,  sk_core  = leaf_score(crop_center(img_t, 0.20))
    cg, eg, uni, cb = dist_score(img_t)

    hsv_f = tf.image.rgb_to_hsv(img_t)
    mean_sat = float(tf.reduce_mean(hsv_f[:,:,1]))

    ratio = cg / (sc_full + 1e-6)

    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"  score_full  : {sc_full:.4f}  ({sc_full:.2%})")
    print(f"  score_mid50 : {sc_mid:.4f}  ({sc_mid:.2%})")
    print(f"  score_core20: {sc_core:.4f}  ({sc_core:.2%})")
    print(f"  g_full      : {g_full:.4f}  ({g_full:.2%})   [hijau murni keseluruhan]")
    print(f"  g_mid       : {g_mid:.4f}  ({g_mid:.2%})   [hijau murni tengah 50%]")
    print(f"  g_core      : {g_core:.4f}  ({g_core:.2%})   [hijau murni inti 20%]")
    print(f"  br_core     : {br_core:.4f}  ({br_core:.2%})   [coklat/kuning inti]")
    print(f"  skin_full   : {sk_full:.4f}  ({sk_full:.2%})")
    print(f"  neutral_core: {n_core:.4f}  ({n_core:.2%})")
    print(f"  mean_sat    : {mean_sat:.4f}")
    print(f"  center_green: {cg:.4f}  ({cg:.2%})")
    print(f"  edge_green  : {eg:.4f}  ({eg:.2%})")
    print(f"  uniformity  : {uni:.4f}")
    print(f"  center_bright:{cb:.4f}")
    print(f"  cg/sc_full  : {ratio:.4f}  (Gate 10 threshold: 0.50)")
    print()

    # Simulate gates
    gates = []
    if sk_full > 0.15:       gates.append(f"Gate 1 REJECT: skin={sk_full:.2%} > 15%")
    if mean_sat < 0.08:      gates.append(f"Gate 2 REJECT: sat={mean_sat:.3f} < 0.08")
    if sc_core < 0.25:       gates.append(f"Gate 3 REJECT: score_core={sc_core:.2%} < 25%")
    if g_core < 0.15:        gates.append(f"Gate 3b REJECT: g_core={g_core:.2%} < 15%")
    if n_core>0.55 and sc_core<0.25: gates.append(f"Gate 4 REJECT: neutral_core={n_core:.2%}")
    if sc_mid < 0.20:        gates.append(f"Gate 5 REJECT: score_mid={sc_mid:.2%} < 20%")
    if g_mid < 0.12:         gates.append(f"Gate 5b REJECT: g_mid={g_mid:.2%} < 12%")
    if sc_full < 0.10:       gates.append(f"Gate 6 REJECT: score_full={sc_full:.2%} < 10%")
    if eg>0.30 and cg<0.30:  gates.append(f"Gate 7 REJECT: edge={eg:.2%} > 30% & center={cg:.2%} < 30%")
    if sc_full>0.20 and sc_core<0.25 and (sc_full-sc_core)>0.15:
        gates.append(f"Gate 8 REJECT: full={sc_full:.2%} >> core={sc_core:.2%}")
    if sc_full>0.20 and uni<0.50:
        gates.append(f"Gate 9 REJECT: uniformity={uni:.3f} < 0.50")
    if sc_full>0.15 and ratio<0.50:
        gates.append(f"Gate 10 REJECT: ratio={ratio:.3f} < 0.50")

    if gates:
        for g in gates:
            print(f"  [X] {g}")
        print(f"\n  --> RESULT: REJECTED (by {len(gates)} gate(s))")
    else:
        print(f"  --> RESULT: PASSED  <-- INI MASALAHNYA!")
    print()

if __name__ == "__main__":
    import sys

    # Jika ada argumen file lokal, test itu
    if len(sys.argv) > 1:
        path = sys.argv[1]
        print(f"Testing local file: {path}")
        analyze(load_image_from_file(path), path)
        sys.exit(0)

    # Gambar kucing dari screenshot (cat on bench outdoor)
    CAT_URLS = [
        ("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400", "Kucing Unsplash"),
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Kittyply_edit1.jpg/640px-Kittyply_edit1.jpg", "Kucing Wikipedia tabby"),
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/640px-Cat_August_2010-4.jpg", "Kucing outdoor garden"),
    ]

    for url, name in CAT_URLS:
        try:
            print(f"Downloading {name}...")
            data = load_image_from_url(url)
            analyze(data, name)
        except Exception as e:
            print(f"  ERROR: {e}")

