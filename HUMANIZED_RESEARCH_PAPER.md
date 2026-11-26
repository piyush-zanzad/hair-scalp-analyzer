# Identify Pattern Baldness in male and female and Classify Scalp Disease with Deep Learning

**Authors:** Piyush Zanzad, Sharvil Titarmare, Birendra Kumar  
**Affiliation:** G. H. Raisoni College of Engineering, Nagpur  
**Emails:** piyush.zanzad.csi@ghrce.raisoni.net, sharvil.titarmare.csi@ghrce.raisoni.net, birendra.kumar@raisoni.net  

---

## Abstract
Dermatological evaluation of hair loss and scalp conditions still depends heavily on manual visual inspections. This traditional approach leads to high observer bias, limits the availability of specialized trichological care in rural areas, and lacks objective methods for tracking patient recovery over time. In this paper, we present a unified, clinical-grade deep learning system that stages gender-specific pattern baldness and screens for multi-class scalp pathologies using a single patient photograph. 

Our pipeline begins with an automated quality check and an anti-fraud modality filter. This filter analyzes high-resolution central crops using contour geometry and HSV skin-tone distribution to isolate printed graphics, presentation slides, and packaging from valid biological scalp tissue. Once verified, the image is enhanced using Contrast Limited Adaptive Histogram Equalization (CLAHE) and routed through a parallel, gender-branched inference architecture. Male scans are routed to a 7-stage Norwood classifier, female scans to a 3-stage Ludwig classifier, and all inputs are concurrently screened using a 9-class scalp disease model trained with an inverse-class-frequency cross-entropy loss to handle dataset imbalance. 

We implement a safety filter that suppresses low-confidence disease predictions, re-expressing them as assurance scores to avoid false medical alarms. To establish transparency, we natively integrate Gradient-Weighted Class Activation Mapping (Grad-CAM) to generate pixel-level heatmaps showing the features driving each prediction. Finally, the system compiles the diagnostic classifications, quality metrics, and heatmaps into a signed PDF report.

**Index Terms—** Scalp Analysis, Hair-Loss Staging, Norwood Classification, Ludwig Classification, Explainable AI, Grad-CAM, Deep Learning, Dermatological Screening.

---

## I. INTRODUCTION

Dermatological conditions affecting the scalp and hair follicles represent a major healthcare burden worldwide. Androgenetic Alopecia (AGA) stands as the most common form of progressive hair loss, affecting nearly 80% of Caucasian men and approximately 50% of women during their lifetimes. Concurrently, inflammatory, infectious, and autoimmune scalp disorders—including Alopecia Areata, Folliculitis Decalvans, and Pseudopelade—require prompt and accurate diagnosis to prevent irreversible scarring and permanent hair loss. While many of these pathologies present with visually overlapping patches of localized hair loss or skin redness, they require entirely different treatment strategies. Consequently, any screening tool that only detects a single condition or fails to distinguish between lookalikes offers limited utility in clinical settings.

In clinical practice, scalp diagnosis relies on visual examination using hand-held microscopes, dermatoscopes, or trichoscopes. Although widely adopted, manual visual grading suffers from several major limitations:
1. **Subjectivity and Observer Discordance:** Visual grading on standardized clinical scales, such as the Norwood-Hamilton or Ludwig classifications, varies significantly from one clinician to another. Even the same clinician may assign different grades when evaluating the same patient across sequential visits.
2. **Geographical Concentration of Specialists:** Trichologists and dermatologists are primarily located in urban medical centers. Patients in rural or underserved regions face long wait times, which delays diagnosis and treatment.
3. **Lack of Objective Longitudinal Tracking:** Monitoring treatment progress requires comparing subtle changes in follicle density and skin inflammation over several months. Paper-based notes and basic photographs do not provide a structured baseline for objective longitudinal tracking.

In recent years, computer vision systems and deep convolutional neural networks (CNNs) have improved automated dermatological classification. However, existing academic and commercial scalp analysis tools exhibit critical architectural gaps:
* Most consumer-grade tools treat hair loss as a monolithic classification task. This ignores the fundamental anatomical dimorphism between male temporal/vertex recession and female diffuse crown thinning. These represent distinct clinical scales and should not share a single label space.
* Existing systems process pattern baldness and pathological disease detection in isolation. Clinicians must run two separate tools or accept that one aspect of the patient's presentation remains unexamined.
* Standard deep learning models operate as "black boxes," offering no spatial justification for their outputs. This lack of transparency remains a major barrier to clinical adoption.

To address these limitations, we present a unified, clinical-grade deep learning framework for automated hair-loss staging and multi-class scalp disease screening. The primary contributions of this work are:
* **Gender-Branching Multi-Model Pipeline:** A multi-network architecture that routes inputs based on patient gender to dedicated, fine-tuned EfficientNet-B0 classifiers (a 7-class Norwood model for males and a 3-class Ludwig model for females) running in parallel with a 9-class scalp disease screening model.
* **Native Visual Explainability:** Direct generation of Grad-CAM activation heatmaps at the final convolutional layer, providing spatial verification of follicular thinning and scalp lesions directly within the clinical interface.
* **Diagnostic Safety Gating:** A threshold-based decision filter applied to the pathology branch that defaults predictions below a 0.50 probability cutoff to "Healthy Scalp," guarding against false-positive clinical alerts in ambiguous scans.
* **Production-Grade Infrastructure:** A full-stack deployment architecture incorporating real-time webcam quality filtering (luminance and Laplacian blur check), adaptive CLAHE contrast enhancement, secure JWT-based authentication, automated PostgreSQL-to-SQLite database fallback, and dynamic PDF report generation.

The rest of this paper is organized as follows: Section II reviews the literature on hair-loss staging, scalp disease detection, and explainable AI. Section III identifies the research gap that motivates this work. Section IV describes the purpose and scope of the proposed system. Section V details the mathematical foundations of our framework. Section VI explains the methodology and workflow. Section VII discusses the system architecture. Section VIII covers the implementation details. Section IX presents the qualitative results and operational analysis. Section X concludes the paper, and Section XI outlines future research directions.

---

## II. LITERATURE REVIEW

### A. Deep Learning for Male Hair-Loss Staging
The Hamilton-Norwood classification remains the standard clinical scale for assessing male-pattern hair loss. However, manual visual grading is time-consuming and highly dependent on the examiner's experience. To address this, deep learning models have been applied to classify hair loss stages from photographs. Liu et al. evaluated VGG-16, ResNet-50, and RegNet-64 architectures using facial and crown images, finding that RegNet-64 achieved the highest classification accuracy for Norwood stages. Gao et al. focused on trichoscopy, extracting quantitative features like hair density and shaft diameter to feed an ordinal regression framework for Basic and Specific (BASP) staging. More recently, researchers have used Mask R-CNN segmentations to isolate the hairline and calculate area-ratio metrics. However, these systems focus exclusively on male cohorts, ignoring female diffuse thinning patterns.

### B. Female Hair-Loss Staging
Female-pattern hair loss is clinically distinct from male pattern baldness, presenting as diffuse thinning across the central crown while preserving the frontal hairline. Conventionally graded on the 3-point Ludwig scale, female hair loss is underrepresented in deep learning literature. Most scalp-imaging systems either omit female subjects entirely or group them into a binary "hair loss present/absent" category. This clinical asymmetry highlights the need for our gender-branching architecture, which treats the Ludwig scale as a dedicated, first-class diagnostic pipeline.

### C. Scalp Disease and Condition Classification
Beyond pattern baldness, several deep learning systems target inflammatory and autoimmune scalp conditions. Chang et al. introduced *ScalpEye*, which pairs a custom smartphone micro-camera with a CNN to detect dandruff, folliculitis, and thinning. Jeong et al. developed *AI-ScalpGrader*, utilizing a cloud-hosted EfficientNet classifier to grade ten different scalp symptoms. Similarly, Jin et al. fine-tuned an EfficientNet-B0 model to grade dandruff and erythema on a four-level scale. While these approaches confirm that EfficientNet-B0 is a highly effective backbone for scalp analysis, none of them run staging and pathology screening in parallel, and none incorporate input validation or confidence gating.

### D. Explainable AI (XAI) in Medical Diagnostics
Using black-box models in clinical diagnostics introduces significant liability and safety concerns. Selvaraju et al. developed Gradient-Weighted Class Activation Mapping (Grad-CAM), which uses gradients flowing into the final convolutional layer of a CNN to produce a coarse localization map showing the regions most responsible for a prediction. While Grad-CAM has been applied to various medical imaging modalities, it is rarely integrated directly into active clinical workflows. In most scalp analysis systems, visual explanations are either absent or relegated to offline research steps.

A comparative analysis of existing methods against our proposed framework is presented in Table I.

| Ref. | Author & Year | Method Used | Published In | Limitations |
| :--- | :--- | :--- | :--- | :--- |
| [1] | Liu et al., 2024 | VGG-16 / ResNet-50 / RegNet-64 | IEEE Access | Male-only; no disease detection; no explainability; single-branch. |
| [2] | Gao et al., 2022 | CNN + Ordinal Regression | Comput. Methods Programs Biomed. | Requires trichoscopic close-ups; male-only. |
| [3] | Chang et al., 2020 | CNN + smartphone scope | IEEE Access | Requires proprietary scope hardware; no staging; limited XAI. |
| [4] | Jeong et al., 2023 | EfficientNet-based grader | Sensors | Requires dedicated hardware; no gender-aware staging. |
| [5] | Jin et al., 2024 | EfficientNet-B0 web platform | Scientific Reports | Narrow 2-condition scope; no staging branch; no safety gating. |
| [6] | Selvaraju et al., 2017| Grad-CAM gradient mapping | Proc. IEEE ICCV | Generic CV technique; not natively integrated into any clinical pipeline. |

---

## III. RESEARCH GAP

Despite recent advances, existing state-of-the-art scalp analysis systems exhibit four key deficiencies:
1. **Isolated Task Processing:** Current systems address either hair-loss pattern staging or scalp disease classification in isolation. No existing framework provides a unified, single-pass assessment covering both staging and multi-pathology screening from a single image.
2. **Lack of Gender-Aware Staging Routing:** Almost every tool on the market runs one classifier for all patients, failing to separate male temporal/vertex recession from female diffuse crown thinning. Squeezing Norwood and Ludwig classes into a single output space erases this distinction.
3. **Absence of Medical Validation Filters:** Typical deep learning pipelines assume all uploaded files are valid medical images. They lack anti-fraud validation filters to detect and reject non-scalp uploads (like presentation slides or commercial packaging).
4. **Lack of Clinical Explainability:** Visual explanation tools like Grad-CAM are rarely natively integrated into clinical reports, preventing practitioners from validating AI predictions against spatial diagnostic cues at the point of care.

We designed our system specifically to close these gaps by bringing gender-aware staging, disease screening, Grad-CAM explainability, and a confidence-gated safety filter together under one unified workflow.

---

## IV. PROPOSED SYSTEM (PURPOSE AND SCOPE)

The proposed system provides automated, objective, and explainable clinical decision-support designed for point-of-care use. It works with standard consumer-grade photographs captured on tablets, smartphones, or microscopes, eliminating the need for expensive proprietary imaging hardware.

The system is responsible for:
* **Real-time Image Quality Assessment**: Evaluates luminance and blur at the point of capture to prevent noisy inputs.
* **Automated Routing**: Directs scans by gender to dedicated staging classifiers (7-class Norwood for males, 3-stage Ludwig for females).
* **Parallel Pathology Screening**: Evaluates the image across 8 scalp diseases and a healthy baseline.
* **Native Explainability**: Generates Grad-CAM visual overlays for all predictions.
* **Clinical Safety Gating**: Overrides low-confidence disease predictions to "Healthy Scalp."
* **Report Compilation**: Generates signed PDF clinical reports containing the original scans, heatmaps, and doctor notes.

---

## V. THEORETICAL FOUNDATIONS

### A. Convolutional Feature Extraction and Compound Scaling
Each of the three classification branches is instantiated from an EfficientNet-B0 backbone. Let the input image be denoted as $X \in \mathbb{R}^{H \times W \times 3}$. A convolutional network $f_\theta$ maps $X$ to a feature tensor through a sequence of $L$ mobile inverted bottleneck blocks:
$$z(l) = F(l)(z(l-1); \theta(l)), \quad l = 1, \dots, L$$
where $z(0) = X$ and each $F(l)$ composes a depthwise-separable convolution, a squeeze-and-excitation gate, and a non-linear activation. EfficientNet's defining property is compound scaling [7]: rather than arbitrarily increasing depth, width, or input resolution, the three are jointly scaled by a compound coefficient $\phi$ under a fixed resource budget:
$$d = \alpha^\phi, \quad w = \beta^\phi, \quad r = \gamma^\phi \quad \text{s.t.} \quad \alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$$
with $\alpha, \beta, \gamma \ge 1$ determined by a small grid search and $\phi = 0$ corresponding to the B0 baseline used in this work. This scaling provides an optimal balance between accuracy and computational complexity, making the model suitable for deployment on edge devices and clinical workstations.

### B. Classification Objective
The final feature map $z(L)$ is global-average-pooled and passed to a task-specific linear head $W_k \in \mathbb{R}^{C_k \times d}$ (with $k \in \{\text{Norwood}, \text{Ludwig}, \text{Disease}\}$ and $C_k \in \{7, 3, 9\}$), producing logits $u = W_k \bar{z}(L) + b_k$. A softmax function converts these logits to a class probability distribution:
$$p_i = \frac{e^{u_i}}{\sum_{j=1}^{C_k} e^{u_j}}, \quad i = 1, \dots, C_k$$
We optimize each branch by minimizing the categorical cross-entropy loss between the predicted distribution $p$ and the one-hot ground-truth label $y$:
$$\mathcal{L}_{\text{CE}} = - \sum_{i=1}^{C_k} y_i \log(p_i)$$
Parameters are updated using the Adam optimizer [11], which combines first and second moment estimates of the gradients:
$$\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$
$$\hat{m}_t = \frac{m_t}{1 - \beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}$$
Because the three branches are trained independently but share an identical objective form and initialization strategy (ImageNet-pretrained weights), the overall training procedure can be viewed as three coupled instances of the same optimization problem over disjoint label spaces $Y_k$. This allows a single preprocessing and inference pipeline to serve all three heads without task-specific re-engineering.

### C. Contrast-Limited Adaptive Histogram Equalization
Let $Y(x, y)$ denote the luminance channel of the YUV-converted input image. The image is partitioned into non-overlapping contextual tiles, and within each tile, the local intensity histogram $h(v), v \in [0, 255]$, is computed. Standard adaptive histogram equalization can over-amplify noise in near-uniform regions (such as smooth scalp skin), so CLAHE [8] first clips the histogram at a limit $\beta$:
$$h_{\text{clip}}(v) = \min(h(v), \beta), \quad \Delta = \frac{1}{256} \sum_{v=0}^{255} [h(v) - h_{\text{clip}}(v)]$$
after which the clipped-away mass $\Delta$ is redistributed uniformly across all intensity bins, $\tilde{h}(v) = h_{\text{clip}}(v) + \Delta$. The redistributed histogram yields a tile-local cumulative distribution function:
$$T(v) = \frac{255}{N} \sum_{u=0}^{v} \tilde{h}(u)$$
where $N$ is the number of pixels per tile. The mapping $T(\cdot)$ is applied to each pixel with bilinear interpolation across tile boundaries to avoid blocking artifacts. Because the transform operates purely on $Y$ and leaves the $U, V$ chrominance channels untouched, color information relevant to erythema and pigmentation cues—which downstream disease classification depends on—is preserved, while local contrast in low-signal regions is enhanced.

### D. Gradient-Weighted Class Activation Mapping
Let $A^k \in \mathbb{R}^{u \times v}$ denote the $k$-th activation map of the final convolutional layer, and let $y^c$ be the logit for target class $c$. Grad-CAM [6] defines an importance weight for each channel $k$ as the global average of the gradient of $y^c$ with respect to that channel's activations:
$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}$$
where $Z = u \cdot v$ is a normalizing constant. The class-discriminative localization map is a weighted combination of the forward activations, passed through a rectifying non-linearity to retain only features that positively influence the target class:
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
The resulting heatmap is upsampled to the input resolution $H \times W$ and alpha-blended over the input image $X$ to produce the overlay presented to the clinician.

### E. Confidence-Gated Decision Rule
Let $p_{\text{dis}} \in \Delta^9$ be the softmax output of the disease-screening branch, and $P_{\text{max}} = \max_i p_{\text{dis}, i}$. The deployed decision function is a thresholded, confidence-remapping rule rather than a direct arg-max:
$$\hat{y} = \begin{cases} \text{argmax}_i p_{\text{dis}, i} & \text{if } P_{\text{max}} \ge \tau \\ \text{"Healthy Scalp"} & \text{if } P_{\text{max}} < \tau \end{cases}$$
$$\hat{c} = \begin{cases} P_{\text{max}} & \text{if } P_{\text{max}} \ge \tau \\ 1 - P_{\text{max}} & \text{if } P_{\text{max}} < \tau \end{cases}$$
where $\tau = 0.50$ (or $\tau = 0.30$ for customized models). The clinical cost of a false pathological alarm on an ambiguous image is treated as materially lower than the cost of surfacing an unexplainable, overconfident-sounding low-probability disease label to a non-specialist clinician. Reframing $\hat{c} = 1 - P_{\text{max}}$ under the low-confidence branch converts model uncertainty about pathology into a statement of assurance of the absence of a confident pathological signal. This rule is applied only to the disease branch and not to the staging branches (Norwood/Ludwig), since hair-loss stage is a graded, ever-present measurement rather than a binary presence/absence pathology decision.

### F. Evaluation Metrics Formalism
For a $C$-class branch, let $TP_i, FP_i, TN_i, FN_i$ denote the true-positive, false-positive, true-negative, and false-negative counts for class $i$ under a one-vs-rest reduction of the confusion matrix $M \in \mathbb{N}^{C \times C}$, where $M_{i,j}$ counts test instances of true class $i$ predicted as class $j$. Overall accuracy is the trace-normalized sum:
$$\text{Accuracy} = \frac{\sum_i M_{i,i}}{\sum_i \sum_j M_{i,j}}$$
Because clinical scalp-disease datasets are typically class-imbalanced, per-class precision and recall are reported alongside it:
$$\text{Precision}_i = \frac{TP_i}{TP_i + FP_i}, \quad \text{Recall}_i = \frac{TP_i}{TP_i + FN_i}$$
The two are combined into a per-class harmonic mean, the F1 score:
$$F_{1,i} = \frac{2 \cdot \text{Precision}_i \cdot \text{Recall}_i}{\text{Precision}_i + \text{Recall}_i}$$
and macro-averaged across classes, $F_{1,\text{macro}} = \frac{1}{C} \sum_i F_{1,i}$. For ordinal branches specifically (Norwood-7 and Ludwig-3), where classes have a natural severity ordering, a more appropriate ordinal-aware metric is the quadratic-weighted Cohen's Kappa:
$$\kappa_w = 1 - \frac{\sum_{i,j} w_{i,j} M_{i,j}}{\sum_{i,j} w_{i,j} E_{i,j}}, \quad w_{i,j} = \frac{(i - j)^2}{(C - 1)^2}$$
where $E_{i,j}$ is the outer product of the marginal row and column sums of $M$, and $w_{i,j}$ penalizes disagreements quadratically in their ordinal distance. Finally, because the confidence-gated safety filter explicitly trades sensitivity for specificity on the disease branch, its effect is summarized by the area under the receiver operating characteristic curve (AUROC) obtained by sweeping $\tau$.

---

## VI. METHODOLOGY

The screening pipeline proceeds through eleven discrete operational stages:
1. **Session Authorization**: The practitioner signs in through a JSON Web Token (JWT) handshake, establishing an encrypted session before initializing camera acquisition.
2. **Client-Side Gating**: Before a frame leaves the device, the client checks it against two live thresholds: average luminance and Laplacian variance above 75 for sharpness. Anything failing either check is dropped.
3. **Gender Routing Selection**: The clinician enters basic patient metadata, and the gender field determines which staging model the scan will be routed to.
4. **Backend Ingestion**: The backend receives the image payload at `POST /scans/upload` and re-validates the same quality metrics server-side.
5. **Modality & Antifraud Filter**: The server checks the image to reject non-scalp uploads. It rejects images with $>30\%$ white pixels (slides/documents), images with $<8\%$ skin/hair HSV density (non-skin objects), and images containing $>30$ letter-like contours in a high-res central crop (printed packaging/barcodes).
6. **Adaptive CLAHE Preprocessing**: Once accepted, the image is converted to YUV and run through Adaptive CLAHE on the Y channel before being resized down to $224 \times 224 \times 3$ for the network.
7. **Parallel Neural Inference**: Both networks run on the same image concurrently: the gender-routed staging model (Norwood-7 or Ludwig-3) and the 9-class disease model.
8. **Safety Filtering**: The disease branch's confidence score is checked against the threshold, and the outcome determines the final label.
9. **Grad-CAM Generation**: Forward and backward hooks capture activations on the last convolutional layer (`model.features[-1]`) for each branch to build heatmaps.
10. **Recommendation Engine Compilation**: Predefined clinical rules convert raw predictions and safety-filter outcomes into readable recommendations.
11. **Report Generation & Storage**: The predictions, Grad-CAM heatmaps, and clinician notes are compiled into an editable PDF built with ReportLab, and the patient's history record is updated in the database (PostgreSQL with local SQLite fallback).

### A. Flowchart Descriptions
`User/Clinician Login (JWT) -> Camera Feed Capture -> Client-Side Quality Gate -> Server Ingestion -> Secondary Validation -> Database Metadata Allocation -> Adaptive CLAHE Preprocessing -> Parallel Inference Engine -> Safety Filter Evaluation -> Grad-CAM Generation -> Recommendation Engine -> PDF Report Build -> Dashboard Update`

---

## VII. SYSTEM ARCHITECTURE

The platform is organized into four distinct operational tiers communicating over standard REST protocols:
* **Presentation Tier (React, TS, Tailwind)**: Manages camera acquisition, real-time quality validation HUD, and interactive Grad-CAM previews.
* **Application Services (FastAPI)**: Routes API endpoints, handles session tokens, runs server-side validation, and directs report compilation.
* **Neural Inference Engine (PyTorch, OpenCV)**: Executes the three fine-tuned EfficientNet-B0 classifiers and computes Grad-CAM feature activations.
* **Data Persistence Tier (PostgreSQL, SQLite, SQLAlchemy)**: Stores diagnostic records and generated PDF reports, featuring automatic failover to local SQLite.

---

## VIII. IMPLEMENTATION

### A. Model Training Configuration
All three classification networks (Norwood-7, Ludwig-3, and Disease-9) use an EfficientNet-B0 backbone pretrained on ImageNet, with the final head replaced. Fine-tuning is performed using the Adam optimizer with an initial learning rate of $1 \times 10^{-4}$, categorical cross-entropy loss, and a step-decay scheduler. Standard augmentations—including horizontal flipping, random rotation ($\pm 15^\circ$), and brightness/contrast jitter—are applied during training to improve robustness to real-world capture variance.

### B. Dataset Composition and Handling
Each branch was trained on curated datasets. To address the severe class imbalance in the disease-screening corpus (e.g. 48 `acne-keloidalis` images vs. 4 `alopecia-areata` images), we implemented an inverse-class-frequency weight vector in the cross-entropy loss function. This applies a $12\times$ higher loss penalty to minority classes like *Alopecia Areata*, forcing the network to learn their distinct visual features.

### C. Image Quality Gating
To reduce downstream inference errors, a two-stage quality gate is enforced. On the client side, the browser measures brightness and a Laplacian-variance sharpness score. Server-side checks repeat this analysis to prevent bypassed clients from sending poor-quality inputs.

### D. Adaptive CLAHE Preprocessing
Every accepted image is converted to YUV, and CLAHE is applied only to the Y (luminance) channel. Color channels are left untouched, normalizing contrast without distorting color information (redness and pigmentation) relevant to disease classification.

### E. Grad-CAM Integration
Grad-CAM is implemented by registering forward and backward hooks on the final convolutional block (`model.features[-1]`) of each network. The resulting heatmap is upsampled to the input resolution, color-mapped, and alpha-blended onto the original scan.

### F. Clinical Safety Gating Filter
To prevent ambiguous classifications from triggering unwarranted clinical concern, the disease prediction service incorporates an inline threshold filter. If the highest Softmax probability $P_{\text{max}} = \max_{c} p_c$ falls short of the operating cutoff ($\tau = 0.50$), the system suppresses the candidate pathology label and reassigns the diagnosis to "Healthy Scalp". For these overridden records, the interface reports an inverted baseline certainty score computed as $C_{\text{healthy}} = 1.0 - P_{\text{max}}$, ensuring that marginal model predictions are conservatively framed as an absence of acute pathology.

### G. Server Architecture and Data Persistence
The backend service runs on an asynchronous FastAPI application served by Uvicorn. Incoming requests are authenticated against OAuth2/JWT tokens before routing to the image evaluation and PyTorch execution pipelines. Database persistence is managed through SQLAlchemy ORM with a fault-tolerant dual-driver configuration: transactions target a primary PostgreSQL instance, with immediate, automated redirection to a local SQLite database (`scalp_analysis.db`) if network or database connectivity drops. Exportable clinical records are compiled programmatically using ReportLab, which synthesizes patient history, model confidences, and dual-branch Grad-CAM overlays into structured, print-ready PDF reports.

### H. Data Governance and Regulatory Scope
Because high-resolution scalp photography represents sensitive patient biometric data, the system enforces strict data confinement. Diagnostic requests, image tensors, and patient metadata remain isolated within the authenticated session boundary and are evaluated locally without dispatching payloads to third-party cloud APIs. All compiled PDF documents prominently feature a regulatory triaging disclaimer indicating that outputs serve strictly as decision-support guidance rather than standalone diagnostic determinations, consistent with international clinical validation requirements for medical AI software.

---

## IX. RESULTS AND DISCUSSION

### A. Qualitative System Behavior
Running the full pipeline shows that male scans are consistently routed to the Norwood classifier, and female scans to the Ludwig classifier. The disease screening branch runs independently, providing both results from a single upload.

### B. Effect of the Safety Filter
The safety filter reduces the risk of false-positive disease alarms. Predictions with $P_{\text{max}} < 0.50$ are consistently re-labeled as "Healthy Scalp" with an inverse confidence score, trading a small amount of sensitivity on borderline cases for a reduction in clinician alarm fatigue.

### C. Explainability Output
The Grad-CAM overlays consistently localize activations to plausible anatomical regions (e.g., temporal and vertex regions for Norwood staging, and diffuse crown regions for Ludwig staging), confirming that the networks attend to clinically relevant features rather than capture artifacts.

### D. Modality Validation Performance
Our modality verification filter successfully rejects non-scalp inputs:
* **PowerPoint Slides**: Rejected by the white pixel percentage check ($84.5\%$ white background).
* **Printed Packaging**: Rejected by the crop contour check (detecting 77 letter-like contours against a threshold of 30).
* **Valid Scalp Photos**: Successfully passed validation, recording 0 letter-like contours because natural hair stubble is smaller than the minimum area threshold ($\ge 70\text{px}$).

### E. System Resilience & Limitations
The dual-database design was verified by deliberately interrupting the PostgreSQL connection; the application transparently falls back to local SQLite without interrupting active clinician sessions. Limitations include the qualitative nature of current evaluations and the 9-class disease taxonomy, which does not cover all rare clinical pathologies.

---

## X. CONCLUSION

We presented a unified, explainable deep learning framework for gender-aware hair-loss staging and multi-class scalp disease screening from a single clinician-captured image. By combining a gender-branching EfficientNet-B0 architecture, native Grad-CAM explainability, and a confidence-gated clinical safety filter, the system addresses key gaps in existing tools. Operational testing shows that the system produces plausible, spatially grounded, and conservative outputs suitable for clinical decision support.

---

## XI. FUTURE SCOPE

Looking ahead, future work will focus on:
1. Quantitative evaluation against a larger, dermatologist-annotated clinical dataset.
2. Expanding the disease taxonomy to include rarer scalp conditions.
3. Adding longitudinal image registration to automatically track patient progress across visits.
4. Conducting usability studies to evaluate how practicing dermatologists interact with the Grad-CAM explanations and safety filters.

---

## REFERENCES
1. X. Liu et al., "Deep Learning Based Hamilton–Norwood Hair Loss Classification Using CNN Architectures," *IEEE Access*, vol. 12, pp. 1–12, 2024.
2. Y. Gao et al., "Automatic BASP Classification Using Deep Learning and Trichoscopic Image Analysis," *Comput. Methods Programs Biomed.*, vol. 221, p. 106894, 2022.
3. C. Chang et al., "ScalpEye: A Deep Learning Based Home Scalp Diagnosis System," *IEEE Access*, vol. 8, pp. 185234–185245, 2020.
4. H. Jeong et al., "AI-ScalpGrader: EfficientNet-Based Scalp Health Assessment," *Sensors*, vol. 23, no. 14, p. 6400, 2023.
5. Y. Jin et al., "Automated Scalp Dandruff and Erythema Severity Assessment Using EfficientNet-B0," *Sci. Rep.*, vol. 14, pp. 1–15, 2024.
6. R. R. Selvaraju et al., "Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization," in *Proc. IEEE Int. Conf. Comput. Vis. (ICCV)*, 2017, pp. 618–626.
7. M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proc. 36th Int. Conf. Mach. Learn. (ICML)*, 2019, pp. 6105–6114.
8. K. Zuiderveld, "Contrast Limited Adaptive Histogram Equalization," in *Graphics Gems IV*, Academic Press, 1994, pp. 474–485.
9. O. T. Norwood, "Male Pattern Baldness: Classification and Incidence," *South. Med. J.*, vol. 68, no. 11, pp. 1359–1365, 1975.
10. E. Ludwig, "Classification of the Types of Androgenetic Alopecia (Common Baldness) Occurring in the Female Sex," *Br. J. Dermatol.*, vol. 97, pp. 247–254, 1977.
11. D. P. Kingma and J. Ba, "Adam: A Method for Stochastic Optimization," in *Int. Conf. Learn. Represent. (ICLR)*, 2015.
12. J. Deng et al., "ImageNet: A Large-Scale Hierarchical Image Database," in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2009, pp. 248–255.
