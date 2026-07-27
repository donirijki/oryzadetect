import numpy as np
from pathlib import Path
from PIL import Image
import io
import base64
import traceback

# Suppress noisy TF oneDNN logs
import os
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

# Lazy-loaded model (singleton — hanya load sekali)
_model = None

# PENTING: Urutan kelas HARUS sama persis dengan folder dataset saat training.
# flow_from_directory mengurutkan kelas secara ALFABETIS dari nama folder.
# Sumber: output notebook cell 18:
#   [0] Bacterial Leaf Blight
#   [1] Brown Spot
#   [2] Healthy Rice Leaf
#   [3] Leaf Blast
#   [4] Leaf scald
#   [5] Narrow Brown Leaf Spot
#   [6] Rice Hispa
#   [7] Sheath Blight
CLASS_NAMES = [
    "Bacterial Leaf Blight",   # [0]
    "Brown Spot",              # [1]
    "Healthy Rice Leaf",       # [2]
    "Leaf Blast",              # [3]
    "Leaf scald",              # [4]
    "Narrow Brown Leaf Spot",  # [5]
    "Rice Hispa",              # [6]
    "Sheath Blight",           # [7]
]

CLASS_INFO = {
    "Bacterial Leaf Blight": {
        "nameIndo": "Hawar Daun Bakteri",
        "nameLatin": "Xanthomonas oryzae pv. oryzae",
        "category": "Bakteri",
        "severity": "Tinggi",
        "symptoms": [
            "Tepi daun menguning dan mengering dari ujung",
            "Lesi basah berwarna abu-abu kehijauan",
            "Garis kuning melebar sepanjang daun",
            "Daun menggulung dan layu pada serangan berat"
        ],
        "treatment": {
            "chemical": [
                "Semprotkan bakterisida berbahan aktif Streptomisin sulfat 20 SC",
                "Aplikasikan Copper Hydroxide (Kocide) dosis 2–3 g/L air",
                "Gunakan Validamycin 3% setiap 7 hari sekali"
            ],
            "organic": [
                "Semprotkan ekstrak bawang putih 10% sebagai antibakteri alami",
                "Aplikasikan pupuk silika untuk memperkuat dinding sel daun",
                "Taburkan abu sekam padi di sekitar perakaran"
            ],
            "prevention": [
                "Gunakan varietas tahan penyakit (Ciherang, Inpari 13)",
                "Jaga drainase sawah agar tidak tergenang berlebihan",
                "Hindari pemupukan Nitrogen berlebihan",
                "Lakukan sanitasi lahan setelah panen"
            ]
        }
    },
    "Brown Spot": {
        "nameIndo": "Bercak Coklat",
        "nameLatin": "Bipolaris oryzae",
        "category": "Jamur",
        "severity": "Sedang",
        "symptoms": [
            "Bercak oval coklat dengan halo kuning di tepi",
            "Bercak berukuran 1–14 mm pada helai daun",
            "Biji padi berubah warna (chalky/brown kernel)",
            "Daun mengering pada serangan parah"
        ],
        "treatment": {
            "chemical": [
                "Fungisida berbahan aktif Propikonazol 25 EC dosis 0.5–1 ml/L",
                "Aplikasikan Mancozeb 80 WP dosis 2 g/L air",
                "Semprotkan Carbendazim 50 WP setiap 10 hari"
            ],
            "organic": [
                "Semprotkan ekstrak daun sirih 5% sebagai antifungi",
                "Aplikasikan Trichoderma harzianum pada tanah dan daun",
                "Rendam benih dalam air hangat 52°C selama 10 menit sebelum tanam"
            ],
            "prevention": [
                "Perbaiki keseimbangan nutrisi — tambah pupuk Kalium",
                "Hindari kekeringan pada fase vegetatif",
                "Rotasi tanaman dengan palawija",
                "Buang dan bakar sisa tanaman terinfeksi"
            ]
        }
    },
    "Healthy Rice Leaf": {
        "nameIndo": "Sehat",
        "nameLatin": "-",
        "category": "Sehat",
        "severity": None,
        "symptoms": [
            "Daun berwarna hijau segar dan merata",
            "Tidak ada bercak, lesi, atau perubahan warna abnormal",
            "Pertumbuhan tanaman normal sesuai umur",
            "Tidak ada gejala kerdil atau kelainan struktural"
        ],
        "treatment": {
            "chemical": [],
            "organic": [
                "Lanjutkan pemupukan berimbang NPK sesuai fase tumbuh",
                "Pertahankan pengairan berselang (intermittent irrigation)",
            ],
            "prevention": [
                "Lakukan monitoring rutin setiap 7 hari",
                "Jaga kebersihan lahan dari gulma dan sisa tanaman",
                "Pertahankan populasi musuh alami di ekosistem sawah"
            ]
        }
    },
    "Leaf Blast": {
        "nameIndo": "Blas Daun",
        "nameLatin": "Pyricularia oryzae",
        "category": "Jamur",
        "severity": "Tinggi",
        "symptoms": [
            "Lesi berbentuk belah ketupat/diamond dengan ujung runcing",
            "Pusat lesi abu-abu, tepi coklat kemerahan, halo kuning",
            "Menyerang daun, leher malai, dan buku batang",
            "Neck blast: leher malai membusuk dan patah (kehilangan hasil total)"
        ],
        "treatment": {
            "chemical": [
                "Fungisida Trisiklazol 75 WP dosis 0.5–1 g/L — paling efektif untuk blast",
                "Aplikasikan Isoprothiolane 40 EC dosis 1.5–2 ml/L",
                "Semprotkan Kasugamisin 2 SL pada serangan awal"
            ],
            "organic": [
                "Aplikasikan Trichoderma asperellum secara preventif",
                "Semprotkan ekstrak bawang putih + cabai 10% setiap 5 hari",
                "Tingkatkan dosis Silika untuk memperkuat dinding sel epidermis"
            ],
            "prevention": [
                "Tanam varietas tahan blast: Inpari 42, Ciliwung, Situbagendit",
                "Hindari pemupukan Urea berlebihan pada fase vegetatif",
                "Semprot fungisida preventif saat cuaca lembab berkepanjangan",
                "Rendam benih dalam Trisiklazol 0.1% selama 24 jam sebelum semai"
            ]
        }
    },
    "Leaf scald": {
        "nameIndo": "Hangus Daun",
        "nameLatin": "Microdochium oryzae",
        "category": "Jamur",
        "severity": "Sedang",
        "symptoms": [
            "Lesi diagonal berwarna coklat kemerahan di tepi daun",
            "Area terinfeksi tampak seperti terbakar (scalded)",
            "Batas lesi bergelombang dengan warna kuning-coklat",
            "Menyebar dari ujung daun ke pangkal"
        ],
        "treatment": {
            "chemical": [
                "Aplikasikan Difenokonazol 25 EC dosis 0.5 ml/L air",
                "Semprotkan Azoxystrobin 20 SC setiap 14 hari",
                "Gunakan Iprodione 50 WP pada fase awal infeksi"
            ],
            "organic": [
                "Semprotkan suspensi Bacillus subtilis konsentrasi 10^8 CFU/ml",
                "Aplikasikan ekstrak rimpang jahe merah 10%",
                "Perbaiki aerasi tanah dengan pengolahan tanah yang baik"
            ],
            "prevention": [
                "Atur jarak tanam yang cukup untuk sirkulasi udara",
                "Kurangi kelembaban mikro dengan drainase baik",
                "Gunakan benih bersertifikat bebas patogen",
                "Hindari luka mekanis pada tanaman"
            ]
        }
    },
    "Narrow Brown Leaf Spot": {
        "nameIndo": "Bercak Sempit Coklat",
        "nameLatin": "Cercospora janseana",
        "category": "Jamur",
        "severity": "Rendah",
        "symptoms": [
            "Bercak sempit memanjang berwarna coklat gelap",
            "Ukuran lesi 1–10 mm × 1–2 mm (sangat sempit)",
            "Bercak tersebar merata di seluruh helai daun",
            "Jaringan sekitar bercak tetap hijau"
        ],
        "treatment": {
            "chemical": [
                "Semprotkan Tebukonazol 25 WG dosis 1 g/L air",
                "Aplikasikan Chlorothalonil 75 WP sebagai fungisida protektif",
                "Gunakan Propikonazol 25 EC jika infeksi meluas"
            ],
            "organic": [
                "Semprotkan ekstrak kunyit 5% yang memiliki sifat antifungi",
                "Aplikasikan pupuk organik cair untuk memperkuat ketahanan tanaman",
                "Gunakan mulsa organik untuk menjaga kelembaban tanah optimal"
            ],
            "prevention": [
                "Pastikan nutrisi tanaman seimbang terutama Silika",
                "Hindari pemupukan Nitrogen berlebihan",
                "Lakukan monitoring rutin setiap minggu",
                "Sanitasi lahan dan benamkan sisa jerami"
            ]
        }
    },
    "Rice Hispa": {
        "nameIndo": "Hispa Padi",
        "nameLatin": "Dicladispa armigera",
        "category": "Hama",
        "severity": "Sedang",
        "symptoms": [
            "Garis-garis putih memanjang sejajar tulang daun",
            "Daun tampak berwarna putih keperakan pada area bergaris",
            "Ujung daun mengering dan berwarna coklat",
            "Larva menggerek jaringan daun dari dalam (leaf mining)"
        ],
        "treatment": {
            "chemical": [
                "Semprotkan insektisida Klorpirifos 20 EC dosis 2 ml/L",
                "Aplikasikan Imidakloprid 200 SL dosis 0.5 ml/L",
                "Gunakan Deltametrin 25 EC pada populasi hama tinggi"
            ],
            "organic": [
                "Semprotkan ekstrak mimba (neem) 5% sebagai repelen alami",
                "Lepaskan musuh alami: Eulophid wasp (parasitoid telur hispa)",
                "Pasang perangkap cahaya untuk tangkap imago dewasa"
            ],
            "prevention": [
                "Monitor sawah secara rutin terutama pada awal musim tanam",
                "Atur waktu tanam serempak untuk memutus siklus hama",
                "Jaga kebersihan lahan dari gulma inang hispa",
                "Pertahankan keseimbangan musuh alami di ekosistem sawah"
            ]
        }
    },
    "Sheath Blight": {
        "nameIndo": "Busuk Pelepah",
        "nameLatin": "Rhizoctonia solani",
        "category": "Jamur",
        "severity": "Tinggi",
        "symptoms": [
            "Lesi oval/elips pada pelepah daun dekat permukaan air",
            "Pusat lesi putih abu-abu, tepi coklat gelap",
            "Sklerotia (biji jamur) coklat kemerahan pada lesi tua",
            "Daun bagian atas menguning dan layu pada serangan berat"
        ],
        "treatment": {
            "chemical": [
                "Validamycin 3% L dosis 2–3 ml/L — standar emas untuk sheath blight",
                "Aplikasikan Hexakonazol 5 EC dosis 1 ml/L",
                "Semprotkan Propikonazol 25 EC pada fase anakan maksimum"
            ],
            "organic": [
                "Aplikasikan Bacillus subtilis (Serenade) secara preventif",
                "Semprotkan kompos teh terfermentasi pada pelepah tanaman",
                "Kurangi genangan air pada fase vegetatif"
            ],
            "prevention": [
                "Atur jarak tanam lebih lebar (25×25 cm) untuk mengurangi kanopi rapat",
                "Kurangi dosis Nitrogen dan seimbangkan dengan Kalium",
                "Hindari penanaman terlalu rapat (legowo 2:1 lebih baik)",
                "Sanitasi sklerotia dengan membajak dalam setelah panen"
            ]
        }
    },
}

IMG_SIZE = (224, 224)
# Target layer untuk Grad-CAM: layer konvolusi terakhir VGG16
GRADCAM_LAYER = "block5_conv3"


def load_model():
    """
    Load model. Mencoba .keras dulu; jika gagal (Keras version mismatch),
    fallback ke rebuild arsitektur + load weights .h5.
    """
    global _model
    if _model is None:
        import keras

        model_path   = Path(__file__).parent / "models" / "model_final_padi.keras"
        weights_path = Path(__file__).parent / "models" / "model_final_padi.h5"

        # Coba load .keras langsung
        if model_path.exists():
            try:
                print(f"Trying to load model from {model_path}...")
                _model = keras.models.load_model(str(model_path))
                print("Model loaded from .keras successfully!")
                return _model
            except Exception as e:
                print(f"[WARNING] Cannot load .keras ({e}). Falling back to weights .h5...")

        # Fallback: rebuild arsitektur + load weights .h5
        if not weights_path.exists():
            raise FileNotFoundError(
                "Model tidak ditemukan. Pastikan 'model.weights.h5' ada di folder 'models/'."
            )
        print("Rebuilding model from architecture + weights .h5...")
        _model = _build_model_from_weights(keras, weights_path)

    return _model


def _build_model_from_weights(keras, weights_path: Path):
    """Fallback: rebuild arsitektur VGG16 + head dan load weights."""
    from keras import layers, models, regularizers
    from tensorflow.keras.applications import VGG16

    base_model = VGG16(
        include_top=False,
        weights=None,
        input_shape=(224, 224, 3)
    )

    # PENTING: Samakan status trainable dengan saat training.
    # Jika tidak, urutan bobot (trainable vs non-trainable) saat load_weights .h5 
    # akan berbeda dan menyebabkan ValueError (Shape mismatch).
    for layer in base_model.layers[:11]:
        layer.trainable = False

    inputs = keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(512, activation='relu',
                     kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(256, activation='relu',
                     kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(8, activation='softmax')(x)

    model = models.Model(inputs, outputs)
    print(f"Loading weights from {weights_path}...")
    model.load_weights(str(weights_path))
    print("Weights loaded successfully!")
    return model


def preprocess_image(image_bytes: bytes) -> "np.ndarray":
    """
    Preprocess gambar:
    - Resize ke 224×224
    - Normalisasi /255.0 (konsisten dengan cara training)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0   # Normalisasi 0–1
    arr = np.expand_dims(arr, axis=0)               # Shape: (1, 224, 224, 3)
    return arr


def _find_last_conv_layer(model):
    """
    Cari layer konvolusi terakhir di model, termasuk di dalam nested sub-model.
    VGG16 wrapped: model → base_model (VGG16) → block5_conv3
    """
    # Coba langsung di model utama
    for layer in reversed(model.layers):
        if hasattr(layer, 'filters') or 'conv' in layer.name.lower():
            return layer.name, model

    # Jika tidak ada, cari di dalam nested sub-model (seperti VGG16 wrapped)
    for layer in model.layers:
        if hasattr(layer, 'layers'):  # Ini sub-model
            for sub_layer in reversed(layer.layers):
                if hasattr(sub_layer, 'filters') or 'conv' in sub_layer.name.lower():
                    return sub_layer.name, layer

    return None, None


def generate_gradcam(image_bytes: bytes, pred_index: int) -> str:
    """
    Generate Grad-CAM heatmap. Kompatibel dengan model .keras (nested VGG16)
    maupun model yang dibangun dari weights .h5.
    """
    try:
        import tensorflow as tf

        model = load_model()
        arr   = preprocess_image(image_bytes)

        # ── Cari Conv2D terakhir (termasuk di dalam nested sub-model) ──
        last_conv = None

        # Cek langsung di layer-layer model utama
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv = layer
                break

        # Jika tidak ada, cari di dalam sub-model (VGG16 wrapped)
        if last_conv is None:
            for layer in model.layers:
                if hasattr(layer, 'layers'):
                    for sub in reversed(layer.layers):
                        if isinstance(sub, tf.keras.layers.Conv2D):
                            last_conv = sub
                            break
                if last_conv is not None:
                    break

        if last_conv is None:
            print("[Grad-CAM] No Conv2D layer found, using saliency fallback")
            return _fallback_saliency(image_bytes, pred_index)

        print(f"[Grad-CAM] Target layer: {last_conv.name}")

        # ── Cek apakah model menggunakan sub-model (nested seperti VGG16) ──
        nested_submodel = None
        for layer in model.layers:
            if hasattr(layer, "layers"):
                if any(sub is last_conv for sub in layer.layers):
                    nested_submodel = layer
                    break

        img_tensor = tf.constant(arr, dtype=tf.float32)

        if nested_submodel is not None:
            # Model nested (base_model di dalam model utama)
            base_feature_model = tf.keras.Model(
                inputs=nested_submodel.input,
                outputs=[last_conv.output, nested_submodel.output]
            )
            submodel_idx = model.layers.index(nested_submodel)
            pre_layers = model.layers[:submodel_idx]
            head_layers = model.layers[submodel_idx + 1:]

            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                # Jalankan layer sebelum sub-model (jika ada)
                x = img_tensor
                for pl in pre_layers:
                    if not isinstance(pl, tf.keras.layers.InputLayer):
                        x = pl(x, training=False)
                # Jalankan sub-model feature extractor
                conv_outputs, base_out = base_feature_model(x, training=False)
                # Jalankan layer head setelah sub-model
                x = base_out
                for hl in head_layers:
                    x = hl(x, training=False)
                predictions = x
                class_score = predictions[:, pred_index]
        else:
            # Model flat/rata
            feature_model = tf.keras.Model(
                inputs=model.inputs,
                outputs=[last_conv.output, model.output]
            )
            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                conv_outputs, predictions = feature_model(img_tensor, training=False)
                class_score = predictions[:, pred_index]

        grads = tape.gradient(class_score, conv_outputs)

        if grads is None:
            print("[Grad-CAM] Gradients are None, using saliency fallback")
            return _fallback_saliency(image_bytes, pred_index)

        # ── Global Average Pooling gradien → bobot per channel ──
        weights = tf.reduce_mean(grads, axis=(1, 2))        # (1, C)
        conv_out = conv_outputs[0]                          # (H, W, C)
        cam = tf.reduce_sum(conv_out * weights[0], axis=-1) # (H, W)

        # ── ReLU + Normalize [0, 1] ──
        cam = tf.nn.relu(cam).numpy()
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        # ── Gunakan gambar asli untuk overlay agar tidak gepeng ──
        original_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Batasi resolusi max agar tidak membebani memori saat base64 encode
        max_dim = 600
        orig_w, orig_h = original_img.size
        if max(orig_w, orig_h) > max_dim:
            scale = max_dim / max(orig_w, orig_h)
            original_img = original_img.resize((int(orig_w * scale), int(orig_h * scale)), Image.LANCZOS)
            
        orig_w, orig_h = original_img.size
        original_arr = np.array(original_img, dtype=np.float32)

        # ── Resize heatmap ke resolusi gambar asli ──
        from PIL import ImageFilter
        cam_img = Image.fromarray((cam * 255).astype(np.uint8))
        cam_img = cam_img.resize((orig_w, orig_h), Image.BICUBIC)
        cam_img = cam_img.filter(ImageFilter.GaussianBlur(radius=6))
        
        # ── Normalisasi Ulang Setelah Blur ──
        # Blur membuat nilai max turun (tidak ada lagi yang 255), jadi harus dinormalkan ulang
        cam_smooth = np.array(cam_img).astype(np.float32)
        c_min, c_max = cam_smooth.min(), cam_smooth.max()
        if c_max > c_min:
            cam_smooth = (cam_smooth - c_min) / (c_max - c_min)
        else:
            cam_smooth = np.zeros_like(cam_smooth)

        # ── Apply Jet colormap ──
        heatmap_colored = _apply_jet_colormap(cam_smooth * 255.0)

        # ── Overlay ke gambar asli ──
        # Tampilkan overlay pada seluruh area yang memiliki aktivasi > 10%
        # Transisi mulus opacity dari 0% ke 60%
        alpha = np.clip((cam_smooth - 0.1) * 1.5, 0.0, 0.6)
        alpha = np.expand_dims(alpha, axis=-1)

        overlay = (original_arr * (1 - alpha) + heatmap_colored.astype(np.float32) * alpha)
        overlay = overlay.clip(0, 255).astype(np.uint8)

        # ── Encode ke base64 PNG ──
        buf = io.BytesIO()
        Image.fromarray(overlay).save(buf, format="PNG", optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    except Exception as e:
        print(f"[Grad-CAM] Error: {e}")
        traceback.print_exc()
        return _fallback_saliency(image_bytes, pred_index)


def _fallback_saliency(image_bytes: bytes, pred_index: int) -> str:
    """Fallback ke saliency map jika Grad-CAM gagal (nested model issues)."""
    try:
        import tensorflow as tf

        model = load_model()
        arr = preprocess_image(image_bytes)
        img_var = tf.Variable(tf.cast(arr, tf.float32))

        with tf.GradientTape() as tape:
            tape.watch(img_var)
            predictions = model(img_var, training=False)
            class_score = predictions[:, pred_index]

        grads = tape.gradient(class_score, img_var)
        saliency = tf.reduce_max(tf.abs(grads[0]), axis=-1).numpy()

        s_min, s_max = saliency.min(), saliency.max()
        if s_max > s_min:
            saliency = (saliency - s_min) / (s_max - s_min)
        else:
            saliency = np.zeros_like(saliency)

        from PIL import ImageFilter
        original_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        max_dim = 600
        orig_w, orig_h = original_img.size
        if max(orig_w, orig_h) > max_dim:
            scale = max_dim / max(orig_w, orig_h)
            original_img = original_img.resize((int(orig_w * scale), int(orig_h * scale)), Image.LANCZOS)
        
        orig_w, orig_h = original_img.size
        original_arr = np.array(original_img, dtype=np.float32)

        sal_img = Image.fromarray((saliency * 255).astype(np.uint8))
        sal_img = sal_img.resize((orig_w, orig_h), Image.BICUBIC)
        sal_img = sal_img.filter(ImageFilter.GaussianBlur(radius=6))
        
        saliency_smooth = np.array(sal_img).astype(np.float32)
        s_min, s_max = saliency_smooth.min(), saliency_smooth.max()
        if s_max > s_min:
            saliency_smooth = (saliency_smooth - s_min) / (s_max - s_min)
        else:
            saliency_smooth = np.zeros_like(saliency_smooth)

        heatmap_colored = _apply_jet_colormap(saliency_smooth * 255.0)

        alpha = np.clip((saliency_smooth - 0.1) * 1.5, 0.0, 0.6)
        alpha = np.expand_dims(alpha, axis=-1)

        overlay = (original_arr * (1 - alpha) + heatmap_colored.astype(np.float32) * alpha)
        overlay = overlay.clip(0, 255).astype(np.uint8)

        buf = io.BytesIO()
        Image.fromarray(overlay).save(buf, format="PNG", optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    except Exception as e:
        print(f"[Saliency Fallback] Error: {e}")
        return ""


def _apply_jet_colormap(gray: np.ndarray) -> np.ndarray:
    """
    Konversi grayscale [0-255] ke Jet colormap (Biru -> Cyan -> Hijau -> Kuning -> Merah).
    Lebih umum digunakan untuk Grad-CAM.
    """
    t = gray.astype(np.float32) / 255.0

    r = np.clip(4 * t - 1.5, 0, 1) - np.clip(4 * t - 4.5, 0, 1)
    g = np.clip(4 * t - 0.5, 0, 1) - np.clip(4 * t - 3.5, 0, 1)
    b = np.clip(4 * t + 0.5, 0, 1) - np.clip(4 * t - 2.5, 0, 1)

    colormap = np.stack([r, g, b], axis=-1) * 255
    return colormap.astype(np.uint8)


def _compute_leaf_ratio(h_chan, s_chan, v_chan):
    """Helper: hitung rasio piksel warna daun (hijau + coklat penyakit) dari channel HSV."""
    import tensorflow as tf
    # Hijau/kuning-hijau khas daun sehat
    green_hue  = tf.logical_and(h_chan >= 0.15, h_chan <= 0.42)
    green_sat  = s_chan >= 0.18
    green_val  = v_chan >= 0.15
    green_mask = tf.logical_and(green_hue, tf.logical_and(green_sat, green_val))
    green_r    = float(tf.reduce_mean(tf.cast(green_mask, tf.float32)).numpy())

    # Kuning-coklat khas penyakit daun
    brown_hue  = tf.logical_and(h_chan >= 0.04, h_chan <= 0.18)
    brown_sat  = tf.logical_and(s_chan >= 0.20, s_chan <= 0.80)
    brown_val  = tf.logical_and(v_chan >= 0.20, v_chan <= 0.90)
    brown_mask = tf.logical_and(brown_hue, tf.logical_and(brown_sat, brown_val))
    brown_r    = float(tf.reduce_mean(tf.cast(brown_mask, tf.float32)).numpy())

    return green_r, brown_r


def is_ood_image(arr_rgb: np.ndarray) -> bool:
    """
    Filter multi-lapis untuk mendeteksi gambar yang BUKAN foto daun padi.

    Layer 1 – Analisis SELURUH gambar (HSV warna daun)
    Layer 2 – Analisis CENTER CROP 50% tengah gambar
      Kunci utama: Untuk foto daun padi yang benar, bagian TENGAH gambar
      harus didominasi warna daun. Untuk selfie/foto orang/benda, bagian
      tengah berisi kulit/pakaian/objek — bukan hijau/kuning daun.
    Layer 3 – Deteksi kulit manusia
    Layer 4 – Tolak gambar flat/grayscale

    Return True (OOD / bukan daun padi) jika gambar tidak memenuhi syarat.
    """
    import tensorflow as tf

    img = arr_rgb[0]  # (224, 224, 3), nilai [0,1]
    H, W = img.shape[0], img.shape[1]

    # ── Analisis SELURUH gambar ──
    hsv_full = tf.image.rgb_to_hsv(img)
    h_full   = hsv_full[:, :, 0]
    s_full   = hsv_full[:, :, 1]
    v_full   = hsv_full[:, :, 2]

    green_full, brown_full = _compute_leaf_ratio(h_full, s_full, v_full)
    leaf_ratio_full = green_full + (brown_full * 0.6)
    mean_sat = float(tf.reduce_mean(s_full).numpy())

    # ── Analisis CENTER CROP (50% tengah: baris 56–168, kolom 56–168 dari 224×224) ──
    margin_h = int(H * 0.25)
    margin_w = int(W * 0.25)
    img_center = img[margin_h:H - margin_h, margin_w:W - margin_w, :]
    hsv_center = tf.image.rgb_to_hsv(img_center)
    h_ctr = hsv_center[:, :, 0]
    s_ctr = hsv_center[:, :, 1]
    v_ctr = hsv_center[:, :, 2]

    green_ctr, brown_ctr = _compute_leaf_ratio(h_ctr, s_ctr, v_ctr)
    leaf_ratio_center = green_ctr + (brown_ctr * 0.6)

    # ── Deteksi kulit manusia (seluruh gambar) ──
    skin_hue   = tf.logical_or(h_full <= 0.08, h_full >= 0.95)
    skin_sat   = tf.logical_and(s_full >= 0.12, s_full <= 0.68)
    skin_val   = v_full >= 0.25
    skin_mask  = tf.logical_and(skin_hue, tf.logical_and(skin_sat, skin_val))
    skin_ratio = float(tf.reduce_mean(tf.cast(skin_mask, tf.float32)).numpy())

    print(
        f"[OOD Check] full_leaf={leaf_ratio_full:.2%} | center_leaf={leaf_ratio_center:.2%} | "
        f"mean_sat={mean_sat:.2f} | skin={skin_ratio:.2%}"
    )

    # ── Keputusan ──
    # Tolak jika dominasi kulit (selfie/wajah)
    if skin_ratio > 0.22:
        print(f"[OOD Check] REJECTED – dominasi warna kulit ({skin_ratio:.2%} > 22%)")
        return True

    # Tolak jika gambar flat/grayscale
    if mean_sat < 0.08:
        print(f"[OOD Check] REJECTED – gambar terlalu flat/grayscale")
        return True

    # Tolak jika BAGIAN TENGAH tidak cukup berwarna daun
    # Ini menolak foto yang ada pohon di background tapi orangnya di tengah
    if leaf_ratio_center < 0.12:
        print(f"[OOD Check] REJECTED – center crop kurang warna daun ({leaf_ratio_center:.2%} < 12%)")
        return True

    # Tolak jika KESELURUHAN gambar juga sangat sedikit warna daun
    if leaf_ratio_full < 0.10:
        print(f"[OOD Check] REJECTED – keseluruhan gambar kurang warna daun ({leaf_ratio_full:.2%} < 10%)")
        return True

    print(f"[OOD Check] PASSED – terdeteksi sebagai foto daun padi")
    return False


def predict(image_bytes: bytes) -> dict:
    """
    Jalankan inferensi model + Grad-CAM dan kembalikan hasil lengkap.
    Return dict dengan semua info yang dibutuhkan frontend.
    """
    model = load_model()
    arr = preprocess_image(image_bytes)
    
    # Cek OOD dengan heuristic warna daun sebelum lanjut prediksi
    if is_ood_image(arr):
        raise ValueError("Sepertinya ini bukan foto daun padi (tidak ada unsur warna daun yang terdeteksi). Silakan unggah gambar yang sesuai.")

    probs = model.predict(arr, verbose=0)[0]  # Shape: (8,)

    pred_index = int(np.argmax(probs))
    pred_class = CLASS_NAMES[pred_index]
    confidence = round(float(probs[pred_index]) * 100, 1)  # Persen 0–100

    # Log ringkas ke server (tidak membanjiri stdout)
    print(f"[predict] {pred_class} ({confidence}%)")

    # Top-3 prediksi
    top3_indices = np.argsort(probs)[::-1][:3]
    top3 = [
        {"name": CLASS_NAMES[i], "confidence": round(float(probs[i]) * 100, 1)}
        for i in top3_indices
    ]

    info = CLASS_INFO[pred_class]

    # Generate Grad-CAM heatmap
    gradcam_url = generate_gradcam(image_bytes, pred_index)

    return {
        "success": True,
        "disease": pred_class,
        "nameIndo": info["nameIndo"],
        "nameLatin": info["nameLatin"],
        "category": info["category"],
        "severity": info["severity"],
        "confidence": confidence,
        "top3": top3,
        "symptoms": info["symptoms"],
        "treatment": info["treatment"],
        "gradcam_url": gradcam_url,   # Base64 PNG heatmap overlay
    }
