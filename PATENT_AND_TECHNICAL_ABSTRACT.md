# PATENT & TECHNICAL ABSTRACT

**Title of Invention:**  
SYSTEM AND METHOD FOR AUTOMATED CLINICAL SCALP DERMOSCOPY MODALITY VALIDATION, DUAL-BRANCH PATTERN HAIR LOSS STAGING, AND EXPLAINABLE MULTI-CONDITION DIAGNOSIS

---

## 1. Abstract

A computer-implemented medical system and diagnostic method for real-time trichological and scalp dermatological evaluation are disclosed. The system includes an interactive client acquisition interface, an automated computer vision anti-fraud modality filter, an adaptive contrast preprocessing engine, a multi-model convolutional neural network inference framework, and an explainable AI (XAI) verification pipeline. 

To overcome false-positive diagnoses on non-scalp imagery, the system implements a multi-stage geometric and colorimetric validation filter configured to analyze high-resolution central image regions, differentiating synthetic printed typography from natural biological hair stubble using area-bounded contour solidity thresholds and HSV skin pigment density metrics. The inference pipeline features gender-branching neural architectures mapping male patients to the 7-Stage Norwood Scale and female patients to the 3-Stage Ludwig Scale, alongside an inverse-frequency balanced 9-class Scalp Disease Classifier. An integrated Gradient-Weighted Class Activation Mapping (Grad-CAM) module captures backward gradients on the final convolutional layer to generate transparent visual heatmaps, which are embedded alongside quantitative metrics into an automated, clinician-signed PDF medical diagnostic report.

---

## 2. Technical Field & Problem Addressed

Conventional dermatological computer-aided diagnostic systems suffer from three primary vulnerabilities:
1. **Modality Vulnerability (False Clinical Assumptions):** Deep learning classifiers forced to evaluate arbitrary non-medical uploads (e.g., slides, text documents, or commercial product packaging) produce false-positive diagnoses due to the absence of input validation.
2. **Biological vs. Synthetic Structural Overlap:** Macro-dermoscopic hair cross-sections (stubble) share visual and mathematical properties with printed typography and barcodes, causing traditional OCR/edge filters to fail.
3. **Severe Clinical Dataset Imbalance & Lookalike Confusion:** Severe class imbalances in scalp disease datasets lead models to confuse visually similar conditions (such as autoimmune *Alopecia Areata* and mechanical *Trichotillomania*).

The present invention solves these technical problems through a closed-loop acquisition HUD, high-resolution area-bounded contour analysis, gender-adaptive neural routing, and minority-calibrated deep learning.

---

## 3. The 5 Core Patentable Technical Innovations

### Innovation 1: Multi-Stage Modality Verification & Biological Stubble Separation
* **Mechanism:** 
  1. **Luminance Rejection:** Flags images where $>30\%$ of pixels are near-white (`BGR > 235`), eliminating slides and documents.
  2. **Area-Bounded Geometric Contour Analysis:** Analyzes a $1000 \times 1000$ high-resolution central crop using adaptive Gaussian thresholding. Isolates printed packaging and barcodes by filtering for boxy contours ($\text{Area} \ge 70\text{px}$, $\text{Solidity} > 0.35$, $\text{Aspect Ratio} \in [0.2, 5.0]$). Organic hair stubble is preserved because biological hair cross-sections have an area $< 70\text{px}$, generating exactly **0** false matches.
  3. **HSV Skin Pigment Density:** Verifies $\ge 8\%$ of the image matches human skin/hair tones ($\text{Hue} \in [0, 25] \cup [165, 180]$, $\text{Sat} \in [20, 150]$, $\text{Val} \ge 50$).
* **Implementation:** `validate_scalp_image_modality` in `backend/app/services/ai_inference.py` (Lines 224–283).

---

### Innovation 2: Closed-Loop Dual-Stage Image Quality Control & Adaptive Preprocessing
* **Mechanism:**
  1. **60 FPS Real-Time Client HUD:** Client-side HTML5 Canvas evaluates average luminance $[50, 215]$ and focus stability (contrast $\ge 20$) before triggering a 3-second countdown capture.
  2. **Laplacian Blur Verification:** Server-side evaluation calculating variance $\sigma^2 = \text{Var}(\nabla^2 I) > 75$.
  3. **Adaptive CLAHE Contrast Enhancement:** Applies Contrast Limited Adaptive Histogram Equalization on the YUV luminance channel (`clipLimit=2.0`, `tileGridSize=(8,8)`) to highlight follicle boundaries before neural ingestion.
* **Implementation:** `CameraFeed.tsx` (Lines 96–147) and `check_image_quality` in `ai_inference.py` (Lines 177–222, 461–464).

---

### Innovation 3: Gender-Branching Neural Architecture with Dual Clinical Scales
* **Mechanism:**
  * **Male Ingestion Path:** Dynamically routes preprocessed tensors to a fine-tuned `EfficientNet-B0` classifier mapping 7 distinct stages of male pattern baldness (**Norwood Scale 1 to 7**).
  * **Female Ingestion Path:** Dynamically routes preprocessed tensors to an `EfficientNet-B0` classifier mapping 3 diffuse thinning stages (**Ludwig Scale I to III**).
  * **Concurrent Path:** Concurrently executes a 9-class Scalp Disease model across all patients regardless of gender.
* **Implementation:** `ScanPage.tsx` (Lines 77–93) and `run_inference` in `ai_inference.py` (Lines 435–447).

---

### Innovation 4: Inverse-Frequency Balanced Loss & Differential Diagnostic Calibration
* **Mechanism:**
  1. **Weighted Cross-Entropy Loss:** Calculates inverse class frequency weights $W_c = \frac{N_{\text{total}}}{C \cdot N_c}$, applying a $\approx 12\times$ higher loss penalty to minority classes like *Alopecia Areata* to overcome extreme dataset imbalance.
  2. **Overfitting Mitigation:** Utilizes classifier dropout ($p=0.4$), L2 weight decay ($10^{-3}$), and early stopping on minimum validation loss.
  3. **Differential Lookalike Post-Processing Engine:** Dynamically generates targeted clinical differential advice (e.g. inspecting borders for exclamation-mark hairs vs broken shafts of varying lengths) when high-overlap conditions (*Alopecia Areata* vs *Trichotillomania*) are detected.
* **Implementation:** `training/train_all.py` (Lines 45–92) and `_generate_explanation` in `ai_inference.py` (Lines 111–142, 628–634).

---

### Innovation 5: Integrated Explainable AI (Grad-CAM) & Automated Medical PDF Synthesis
* **Mechanism:**
  1. **Gradient Activation Mapping:** Registers forward/backward hooks on the final convolutional layer (`model.features[-1]`) to compute importance weights:
     $$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}, \quad L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
  2. **Transparent Jet Blending:** Blends a $60\% / 40\%$ normalized heatmap overlay on the original scan.
  3. **Automated PDF Compilation:** ReportLab engine compiles medical summaries with side-by-side visual thumbnails, Grad-CAM overlays, quantitative lighting/blur metrics, and editable clinician signature blocks.
* **Implementation:** `_generate_gradcam_overlay` in `ai_inference.py` (Lines 553–608) and `reports.py` (Lines 1–250).

---

## 4. High-Level System Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT LAYER (React 18 SPA)                                  |
|  [60 FPS Quality HUD]  <--->  [CameraFeed.tsx / File Upload]  <--->  [Norwood/Ludwig Gender Toggle]|
+---------------------------------------------------------------------------------------------------+
                                                  │  HTTPS Multipart Payload
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                      BACKEND ENGINE (FastAPI)                                     |
|                                                                                                   |
|   1. MODALITY & ANTI-FRAUD FILTER                                                                 |
|      ├── White Background Check (>30% rejection)                                                  |
|      ├── High-Res Crop Contour Analysis (Area >= 70px text detection vs. Area < 70px stubble)     |
|      └── HSV Skin Pigment Density (>=8% check)                                                    |
|                                                                                                   |
|   2. PREPROCESSING & ENHANCEMENT                                                                  |
|      └── Adaptive CLAHE on YUV Luminance Channel (clipLimit=2.0, tileGridSize=(8,8))               |
|                                                                                                   |
|   3. MULTI-MODEL DEEP LEARNING (PyTorch - EfficientNet-B0)                                        |
|      ├── Male Path: 7-Stage Norwood Model                                                         |
|      ├── Female Path: 3-Stage Ludwig Model                                                        |
|      └── Scalp Disease: 9-Class Weighted-Loss Classifier                                          |
|                                                                                                   |
|   4. CLINICAL POST-PROCESSING & EXPLAINABILITY                                                    |
|      ├── Cumulative Severity Thresholding (>=45%) & Lookalike Differential Engine                 |
|      └── Grad-CAM Hook Engine (model.features[-1] -> 60/40 Jet Overlay)                           |
|                                                                                                   |
|   5. REPORTING & PERSISTENCE                                                                      |
|      ├── ReportLab Dynamic PDF Compilation with Signatures & Metrics                              |
|      └── SQLAlchemy Dual-Engine Storage (PostgreSQL with SQLite Auto-Fallback)                    |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Summary of Claims for Patent Filing

1. **Claim 1 (Independent Method):** A computer-implemented method for validating medical scalp dermoscopy captures by analyzing area-bounded contour geometries on high-resolution image crops to distinguish printed typography from biological hair stubble prior to neural network inference.
2. **Claim 2 (System Architecture):** A medical diagnostic system comprising dual gender-branched convolutional neural networks configured to selectively route male patients to a Norwood classification scale and female patients to a Ludwig classification scale while concurrently evaluating scalp diseases on a weighted multi-condition model.
3. **Claim 3 (Closed-Loop Quality Control):** The method of claim 1, further comprising a real-time client-side luminance and Laplacian variance evaluation HUD synchronized with server-side adaptive histogram equalization.
4. **Claim 4 (Differential Calibration):** The method of claim 2, further comprising an automated differential diagnostic post-processing engine configured to generate guidance prompts distinguishing autoimmune alopecia from mechanical trichotillomania.
5. **Claim 5 (Explainable Reporting):** The system of claim 2, further comprising an automated reporting pipeline synthesizing gradient-weighted class activation heatmaps with practitioner signature blocks into a multi-page PDF document.
