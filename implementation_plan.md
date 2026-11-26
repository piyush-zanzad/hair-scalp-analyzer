# ScalpDiagnostix AI: Technical Implementation Plan & Specification

This document details the complete end-to-end implementation specification for **ScalpDiagnostix AI**, an explainable, multi-task deep learning platform for gender-adaptive pattern hair-loss staging and scalp pathology screening.

---

## 1. Complete Technology Stack

The platform is engineered as a decoupled, microservice-ready full-stack architecture with dual-engine persistence and containerized single-port deployment:

```
+-----------------------------------------------------------------------------------+
|                                  TECHNOLOGY STACK                                 |
+-----------------------------------------------------------------------------------+
| Layer               | Technology Used               | Primary Purpose             |
+---------------------+-------------------------------+-----------------------------+
| Frontend SPA        | React 18, TypeScript, Vite    | Clinical Dashboard & HUD    |
| Styling & UI        | Tailwind CSS, Lucide Icons    | Glassmorphic Medical Layout |
| Client State & i18n | React Router v6, Context API  | Auth State & Internationalization |
| Camera Processing   | HTML5 Canvas, MediaDevices API| 60 FPS Real-Time Blur/Light |
| Backend API Engine  | FastAPI (Python 3.10), Uvicorn| Asynchronous REST Service   |
| Security & Auth     | JWT (PyJWT), Passlib (Bcrypt) | Token Auth & Password Hash  |
| Database Engine     | SQLAlchemy ORM, SQLite / PG   | PostgreSQL w/ SQLite Fallback |
| AI / Deep Learning  | PyTorch, Torchvision          | Neural Network Classifiers  |
| Model Architecture  | EfficientNet-B0 (Pretrained)  | Transfer Learning Backbone  |
| Computer Vision     | OpenCV (cv2), PIL, NumPy      | CLAHE, HSV, Contour Filters |
| Explainability (XAI)| Grad-CAM (Target Layer Hooks) | Visual Heatmap Overlays     |
| PDF Report Engine   | ReportLab (Python)            | Dynamic Signed PDF Summaries|
| Deployment & Build  | Docker, Multi-Stage Build     | Single-Container (Port 7860)|
+---------------------+-------------------------------+-----------------------------+
```

---

## 2. Deep Learning Models & Architecture

The diagnostic intelligence is driven by three independent convolutional neural networks instantiated from an ImageNet-pretrained **EfficientNet-B0** backbone:

```
                          ┌──────────────────────────┐
                          │ Preprocessed Image Input │
                          │     (224 x 224 x 3)      │
                          └────────────┬─────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌─────────────────────┐                       ┌─────────────────────┐
     │  Branch A: Staging  │                       │  Branch B: Disease  │
     └──────────┬──────────┘                       └──────────┬──────────┘
                │                                             │
      ┌─────────┴─────────┐                                   │
      ▼                   ▼                                   ▼
┌──────────────┐   ┌──────────────┐                ┌─────────────────────┐
│ Male Model   │   │ Female Model │                │ 9-Class Scalp       │
│ Norwood (1-7)│   │ Ludwig (1-3) │                │ Pathology Model     │
└──────────────┘   └──────────────┘                └──────────┬──────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │ Confidence Gating   │
                                                   │ (tau = 0.30 / 0.50) │
                                                   └─────────────────────┘
```

1. **Male Pattern Hair Loss Model (Norwood Scale)**:
   * **Classes (7)**: `Stage 1`, `Stage 2`, `Stage 3`, `Stage 4`, `Stage 5`, `Stage 6`, `Stage 7`.
   * **Backbone**: EfficientNet-B0 fine-tuned on male hairline recession and vertex thinning.
2. **Female Pattern Hair Loss Model (Ludwig Scale)**:
   * **Classes (3)**: `Ludwig Stage I`, `Ludwig Stage II`, `Ludwig Stage III`.
   * **Backbone**: EfficientNet-B0 trained on diffuse central crown thinning patterns.
3. **Scalp Pathology Screening Model**:
   * **Classes (9)**: 8 active dermatological diseases + 1 healthy baseline:
     * *Acne Keloidalis, Alopecia Areata, Androgenic Alopecia, Dissecting Cellulitis, Folliculitis Decalvans, Healthy Scalp, Pseudopelade, Trichotillomania, Tufted Folliculitis*.
   * **Training Technique**: Inverse-class-frequency weighted cross-entropy loss, classifier dropout ($p=0.4$), L2 weight decay ($10^{-3}$), and early stopping on minimum validation loss.

---

## 3. Mathematical Algorithms & Computer Vision Formulations

### A. Real-Time Quality Control (Luminance & Blur)
Before frame submission, the client computes the Laplacian variance to evaluate sharpness:
$$\sigma^2 = \text{Var}(\nabla^2 I)$$
Frames are rejected if $\sigma^2 < 75.0$ (Blurry) or if YUV Y-channel mean luminance falls outside $[50, 215]$ (Underexposed/Overexposed).

### B. Pre-Inference Anti-Fraud & Modality Validation Filter
To prevent non-scalp imagery from producing false medical predictions:
1. **White Background Check**: Rejects images where $>30\%$ of pixels satisfy $\text{BGR} > 235$ (PowerPoint slides / documents).
2. **Text & Printed Pattern Detector**: Extracts a $1000 \times 1000$ high-resolution central crop and applies adaptive Gaussian thresholding. Counts sharp, boxy letter contours satisfying:
   $$70\text{px} \le \text{Area} \le 2000\text{px}, \quad \text{Solidity} > 0.35, \quad 0.2 \le \text{Aspect Ratio} \le 5.0$$
   *Printed product packaging detects $>30$ text contours (rejected)*, while *biological hair stubble cross-sections have an area $<70\text{px}$ (0 text contours detected, passed)*.
3. **HSV Pigment Density Check**: Verifies that $\ge 8\%$ of image pixels match human skin/hair tones ($\text{Hue} \in [0, 25] \cup [165, 180]$, $\text{Sat} \in [20, 150]$, $\text{Val} \ge 50$).

### C. Adaptive CLAHE Contrast Enhancement
Contrast Limited Adaptive Histogram Equalization is applied exclusively to the luminance (Y) channel in YUV color space:
$$h_{\text{clip}}(v) = \min(h(v), \beta), \quad \Delta = \frac{1}{256} \sum_{v=0}^{255} [h(v) - h_{\text{clip}}(v)]$$
$$T(v) = \frac{255}{N} \sum_{u=0}^{v} [h_{\text{clip}}(u) + \Delta]$$
Operating on Y preserves $U, V$ chrominance information (skin redness/erythema) while boosting micro-follicular contrast under uneven lighting.

### D. Explainable AI (Grad-CAM)
Hooks registered on `model.features[-1]` capture forward activations $A^k$ and backward gradients $\frac{\partial y^c}{\partial A^k}$:
$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}, \quad L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
The spatial heatmap is upsampled to $224 \times 224$, colormapped using `COLORMAP_JET`, and blended with the scan at $60\% / 40\%$ opacity.

### E. Confidence Safety Decision Gating
If the maximum softmax probability $P_{\text{max}} = \max(p_{\text{dis}})$ is less than threshold $\tau$ ($\tau = 0.30$ or $0.50$), the pathology label is overridden to `"Healthy Scalp"`:
$$\hat{y} = \begin{cases} \text{argmax}(p_{\text{dis}}) & \text{if } P_{\text{max}} \ge \tau \\ \text{"Healthy Scalp"} & \text{if } P_{\text{max}} < \tau \end{cases}$$
The confidence score is re-expressed as health assurance: $\hat{c} = 1.0 - P_{\text{max}}$.

---

## 4. Dataset Composition & Augmentation

* **Corpus Split**: Independent curated clinical image corpora assembled for Norwood, Ludwig, and disease tasks.
* **Class Imbalance Mitigation**: Weighted Cross-Entropy Loss applying inverse class frequency weights:
  $$W_c = \frac{N_{\text{total}}}{C \cdot N_c}$$
  This applies a $\approx 12\times$ higher loss penalty to minority classes like *Alopecia Areata*.
* **Data Augmentations**: Offline horizontal flipping, random rotations ($\pm 15^\circ$), brightness/contrast jitter, and stratified patient-identity partitioning to eliminate train/test leakage.

---

## 5. Engineering Problems Faced & Solutions Implemented

### Problem 1: Overriding Correct Alopecia Areata Predictions to "Healthy Scalp"
* **Issue**: The default safety threshold was set to `0.85`, causing valid Alopecia Areata predictions (which had a baseline random guess of $11.1\%$) to be overridden to "Healthy Scalp".
* **Solution**: Retrained the model with inverse-frequency weighted cross-entropy loss and early stopping on validation loss, and dynamically lowered the confidence threshold to `0.30` specifically for the custom 9-class model in [ai_inference.py](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/backend/app/services/ai_inference.py#L490).

### Problem 2: Browser Camera Block over Non-Secure Local IP Addresses
* **Issue**: Webcams strictly require Secure Contexts (`localhost` or HTTPS). Accessing the app over a local Wi-Fi IP blocked camera enumeration.
* **Solution**: Integrated an explicit "Upload Image File" fallback input directly inside the [CameraFeed.tsx](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/frontend/src/components/CameraFeed.tsx#L245) viewport, allowing clinicians to upload microscope images directly.

### Problem 3: PowerPoint Slide False Predictions
* **Issue**: Uploading a white PowerPoint presentation slide resulted in the model predicting "Stage 1" and "Healthy Scalp".
* **Solution**: Created `validate_scalp_image_modality` in `ai_inference.py`, implementing a pure white pixel density check ($>30\%$ white pixels with `BGR > 235`) to automatically reject slides and whiteboards with an HTTP `400 Bad Request`.

### Problem 4: Product Packaging Misclassification (Sneaker Wipes Bag)
* **Issue**: Scanning a black plastic wipes bag with white text predicted "Stage 7 Baldness" and "Healthy Scalp" because flat plastic has no hair and warm room light reflections matched skin color bounds.
* **Solution**: Upgraded the validation filter to analyze a $1000 \times 1000$ high-resolution central crop. It counts sharp, boxy letter contours ($\text{Area} \ge 70\text{px}$, $\text{Solidity} > 0.35$). Product packaging detected 77 letter contours (rejected), while biological hair stubble dots had an area $<70\text{px}$ (0 letter contours detected, passed).

### Problem 5: Visual Lookalike Confusion (Alopecia Areata vs. Trichotillomania)
* **Issue**: Autoimmune Alopecia Areata (smooth patches) and hair-pulling Trichotillomania (broken shafts) look visually similar.
* **Solution**: Injected targeted clinical differential guidance into `ai_inference.py` and [reports.py](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/backend/app/services/reports.py) instructing practitioners to inspect patch borders for exclamation-mark hairs vs. broken stubble.

### Problem 6: Database Connection Failures in Local Clinics
* **Issue**: External PostgreSQL database drops caused backend crashes in remote clinics.
* **Solution**: Built an automatic dual-engine fallback in [database.py](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/backend/app/database.py) using SQLAlchemy ORM that silently catches PostgreSQL connection errors and initializes a local SQLite file database (`scalp_analysis.db`).

### Problem 7: Single-Port Free Cloud Deployment (Hugging Face Spaces)
* **Issue**: Free cloud tiers expose only one port (`7860`), whereas standard full-stack apps require separate ports for React (5173) and FastAPI (8000).
* **Solution**: Created a multi-stage [Dockerfile](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/Dockerfile) that compiles Vite React static assets into `frontend_dist` and mounts them at the root route in [main.py](file:///C:/Users/piyus/.gemini/antigravity/scratch/hair-scalp-analyzer/backend/app/main.py#L57) to serve both SPA routes and REST API endpoints on port `7860`.
