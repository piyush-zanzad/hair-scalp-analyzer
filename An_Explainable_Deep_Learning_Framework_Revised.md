# An Explainable Deep Learning Framework for Automated Hair-Loss Staging and Scalp Disease Screening

**Authors:** 1st Given Name Surname, 2nd Given Name Surname  
**Department:** Department of Computer Science & Engineering  

---

## Abstract
Evaluating scalp pathologies and pattern hair loss through manual visual examination remains subject to clinician variability, offers restricted access outside urban medical centers, and lacks standardized methods for long-term progress tracking. This paper presents a clinical decision-support pipeline that performs gender-aware hair-loss staging and scalp pathology screening concurrently from a single patient photograph. The system routes inputs through a gender-branched architecture pairing a 7-class male Norwood–Hamilton model with a 3-class female Ludwig model, alongside an independent 9-class disease classifier covering eight scalp pathologies and a healthy baseline, all utilizing EfficientNet-B0 backbones. To maintain diagnostic transparency, Gradient-weighted Class Activation Mapping (Grad-CAM) generates spatial attribution heatmaps for every prediction. To reduce false-positive medical alarms, a confidence-gated safety rule automatically reclassifies disease predictions below 50% probability to "Healthy Scalp," expressing uncertainty as health assurance rather than a forced diagnosis. The operationalized workflow integrates client-side image quality checks for luminance and blur, server-side CLAHE contrast enhancement, JWT session security, and a dual-database engine with automatic PostgreSQL-to-SQLite fallback. Qualitative evaluation demonstrates that the framework produces consistent, spatially interpretable, and appropriately conservative decision-support outputs suitable for point-of-care clinical workflows.

**Index Terms—** Scalp Analysis, Hair-Loss Staging, Norwood Classification, Ludwig Classification, Explainable AI, Grad-CAM, Deep Learning, Dermatological Screening.

---

## I. INTRODUCTION

Pathological conditions of the scalp and hair follicle matrix represent a major clinical concern globally. Androgenetic Alopecia (AGA) [9], the primary cause of progressive hair loss, is estimated to affect up to 80% of Caucasian men and 50% of women during their lives. At the same time, inflammatory and infectious scalp conditions—such as Alopecia Areata, Folliculitis Decalvans, and Pseudopelade—demand early and precise identification to avoid permanent scarring and irreversible follicular damage. Although non-specialists may observe visual similarities among these conditions, their clinical management requires distinct therapeutic approaches. Consequently, diagnostic tools that focus on a single condition or fail to separate pattern hair loss from scalp pathologies provide restricted utility in clinical environments.

Traditionally, scalp diagnosis relies on visual inspection by specialist dermatologists using dermoscopy or trichoscopy. Manual clinical assessment, however, suffers from three structural vulnerabilities:

1) **Subjectivity and Examiner Variability:** Diagnostic grading using established clinical scales, including Norwood–Hamilton for men and Ludwig for women, shows substantial variation across different practitioners and within repeat evaluations by the same examiner.
2) **Geographic Concentration of Specialist Care:** Advanced trichological expertise remains centered in major urban medical facilities, leaving individuals in rural or low-resource regions without accessible diagnostic consultations.
3) **Lack of Quantitative Progress Monitoring:** Assessing treatment progress requires consistent, side-by-side visual comparison across extended therapeutic intervals, which traditional written clinical records cannot adequately provide.

Recent advances in computer vision and deep convolutional neural networks (CNNs) have enabled automated dermatological image analysis. Yet existing commercial and academic tools exhibit critical architectural gaps. Most consumer-grade applications treat hair loss as a monolithic classification task, ignoring the fundamental dimorphism between male vertex/temporal recession and female diffuse crown thinning – two patterns that are graded on entirely different clinical scales and that, in practice, should never share a single output label space. Existing systems also tend to process hair-loss staging and pathological disease detection in isolation, so a clinician who wants both assessments must either run two separate tools or accept that one dimension of the patient's presentation goes unexamined. Perhaps most importantly, black-box deep-learning architectures typically offer no spatial justification for their outputs, which remains a major barrier to clinical adoption regardless of how accurate the underlying classifier may be.

To address these limitations, we present a unified, clinical-grade deep learning framework for automated hair-loss staging and multi-class scalp disease detection. The primary contributions of this work are as follows:

- **Gender-Branching Multi-Model Pipeline:** A multi-network architecture that routes input scans based on patient gender to dedicated EfficientNet-B0 classifiers (a 7-class Norwood model for males and a 3-class Ludwig model for females), operating in parallel with a 9-class scalp disease screening model.
- **Native Visual Explainability via Grad-CAM:** Integration of Gradient-weighted Class Activation Mapping directly onto all inference outputs, generating color-mapped spatial heatmaps that highlight the exact visual features driving each prediction.
- **Clinical Confidence-Gated Safety Filter:** A safety rule engine that suppresses disease predictions falling below a 50% confidence threshold, overriding them to "Healthy Scalp" and re-expressing uncertainty as inverse assurance so as to minimize false-positive medical alarms.
- **Production-Grade Resilience and Infrastructure:** A full-stack deployment architecture incorporating client-side quality filtering (luminance and Laplacian blur detection), Adaptive CLAHE contrast preprocessing, JWT-authenticated session management, automated PostgreSQL-to-SQLite database fallback, and dynamic PDF report generation.

The structure of this paper is organized as follows: Section II summarizes prior work in hair-loss staging, scalp disease classification, and explainable artificial intelligence. Section III details the specific research gaps addressed by this work. Section IV describes the objectives and scope of the proposed platform. Section V outlines the theoretical and mathematical principles of the neural architectures, contrast transformations, attribution mapping, and safety rules. Section VI details the multi-step operational methodology. Section VII presents the layered system architecture. Section VIII outlines technical implementation details and data preparation. Section IX discusses qualitative system behavior and operational findings. Section X concludes the study, and Section XI identifies avenues for future investigation.

---

## II. LITERATURE REVIEW

Automated scalp image analysis encompasses four primary research domains: male pattern hair-loss grading, female pattern hair-loss grading, scalp disease and symptom classification, and explainable artificial intelligence in clinical imaging. The following subsections summarize key developments across these areas, concluding with a comparative analysis against our framework.

### A. Deep Learning for Male Hair-Loss Staging
The Hamilton–Norwood classification scale serves as the primary clinical standard for evaluating male pattern hair loss, though manual grading remains slow and prone to subjective variation [1]. To address this challenge, Liu et al. evaluated VGG-16, ResNet-50, and RegNet-64 architectures using hospital facial imagery, demonstrating that RegNet-64 attained superior accuracy for Hamilton–Norwood stage identification [1]. Gao et al. adopted a trichoscopic approach by training a convolutional neural network to measure hair density and shaft diameter variations from magnified scalp photographs, applying ordinal regression to map these quantitative markers to Basic and Specific (BASP) stages [2]. Other recent studies have applied instance segmentation techniques, using Mask R-CNN architectures to segment the hairline and thinning zones to calculate an automated area-ratio score. A common limitation across these approaches is their exclusive focus on male datasets, leaving female pattern hair loss unaddressed within the same automated framework.

### B. Female Hair-Loss Staging
Female-pattern hair loss is clinically distinct from the male pattern – diffuse central thinning rather than temporal/vertex recession – and is conventionally graded using the Ludwig scale, originally proposed to describe the three characteristic severity grades of common baldness in women [10]. In contrast to the male-staging literature, dedicated deep-learning classifiers targeting the Ludwig scale specifically are comparatively scarce; most publicly documented scalp-imaging pipelines either omit female subjects entirely or fold them into a generic "hair loss present/absent" label rather than a graded scale. This asymmetry directly motivates the gender-branching design adopted in the present work, which instantiates the Ludwig scale as its own first-class 3-class output rather than an afterthought of the male-staging model.

### C. Scalp Disease and Condition Classification
Parallel to staging, a separate body of work targets non-AGA scalp conditions. Chang et al. introduced ScalpEye, a deep learning inspection system that couples a micro-camera scalp scope with CNN-based detection of hair-loss-related symptoms such as folliculitis, dandruff, and hair thinning for at-home self-inspection [3]. Jeong et al. proposed AI-ScalpGrader, which pairs a portable imaging device with a cloud-hosted EfficientNet classifier to grade ten scalp health symptoms – including dryness, oiliness, sensitivity, and dandruff subtypes – against dermatologist-defined indices, reporting accuracies in the high-80s to low-90s percentage range across symptom categories [4]. More recently, Jin et al. fine-tuned an EfficientNet-B0 backbone to grade fine dandruff and perifollicular erythema on a four-level mild-to-severe scale and packaged the resulting model behind a public web platform, reporting condition-specific accuracies in the 75–82% range and noting that earlier comparable systems in the literature had topped out around 65–77% [5]. These systems establish EfficientNet as a recurring, empirically favoured backbone for scalp-condition classification specifically – a choice this work follows for consistency across all three of its branches – but none of them additionally performs gender-routed hair-loss staging in the same pass, and none reports a confidence-gated safety mechanism for suppressing low-certainty disease labels.

### D. Explainable AI (XAI) in Medical Diagnostics
The deployment of black-box deep learning models in healthcare introduces safety and liability concerns that pure accuracy metrics do not address. Selvaraju et al. introduced Gradient-weighted Class Activation Mapping (Grad-CAM), a technique that uses gradients flowing into a CNN's final convolutional layer to produce a coarse, class-discriminative localization map without requiring architectural modification or retraining [6]. Because it is a post-hoc, architecture-agnostic wrapper, Grad-CAM has since been adopted broadly across medical-imaging applications – including mammography, dermatoscopy, and retinal imaging – as a way to visually audit whether a classifier is attending to clinically plausible regions rather than incidental artifacts. Despite this uptake in the research literature, explainability is rarely built directly into end-to-end clinical applications: in the scalp-imaging systems reviewed above, visual explanation is typically absent or treated as a separate offline analysis step rather than a component the clinician sees at inference time alongside the diagnostic label.

A comparative analysis of existing methods against the proposed system is presented in Table I.

**TABLE I: Literature Review Comparison Across Hair Analysis and Dermatological Domains**

| Ref. | Author & Year | Method Used | Advantages | Limitations |
| :--- | :--- | :--- | :--- | :--- |
| [1] | Liu et al., 2024 | VGG-16 / ResNet-50 / RegNet-64 for male Hamilton–Norwood staging | Direct comparison across three CNN backbones on hospital-sourced photos | Male-only; no disease detection; no explainability; single-branch design |
| [2] | Gao et al., 2022 | CNN feature extraction + ordinal regression for BASP classification | Interpretable intermediate features (hair density, diameter distribution) | Requires trichoscopic close-ups, not standard clinical photos; male-only |
| [3] | Chang et al., 2020 | CNN-based ScalpEye inspection system with a micro-camera scope | Consumer-grade hardware; multi-symptom detection | Requires proprietary scope hardware; no staging; limited XAI |
| [4] | Jeong et al., 2023 | EfficientNet-based AI-ScalpGrader across 10 scalp symptom classes | Broad symptom coverage; dermatologist-defined indices | Requires a dedicated portable imaging device; no gender-aware staging |
| [5] | Jin et al., 2024 | EfficientNet-B0 web platform for dandruff / erythema grading | Standard camera input; publicly deployed web platform | Narrow 2-condition scope; no staging branch; no safety gating |
| [6] | Selvaraju et al., 2017 | Grad-CAM gradient-based class activation mapping | Architecture-agnostic; no retraining required | Generic CV technique; not natively integrated into any clinical scalp pipeline |

---

## III. RESEARCH GAP

Despite the advances surveyed above, existing state-of-the-art solutions exhibit four primary deficiencies:

1) **Isolated Task Processing:** Current systems address either hair-loss pattern staging or scalp disease classification in isolation. No existing framework provides a unified, single-pass assessment covering both staging and multi-pathology screening from one uploaded image.
2) **Lack of Gender-Aware Routing:** Existing applications deploy a single model across all patients, ignoring the anatomical distinctions between male temporal-vertex recession (Norwood) and female central diffuse thinning (Ludwig), thereby combining two separate clinical scales into a single prediction space.
3) **Absence of Safety Decision Gating:** Standard deep learning pipelines output uncalibrated softmax probabilities directly, frequently presenting low-certainty or false-positive pathology predictions as confident diagnoses without an intervening safety filter.
4) **Omission of Integrated Visual Explainability:** Interpretability tools such as Grad-CAM are seldom embedded into production clinical workflows or exported reports, depriving clinicians of spatial visual cues needed to audit model reasoning during consultations.

The framework presented in this study addresses these limitations by integrating gender-specific parallel staging, multi-class disease screening, native Grad-CAM spatial attribution, and a confidence-gated decision filter into a single service-oriented architecture.

---

## IV. PROPOSED SYSTEM (PURPOSE AND SCOPE)

The main goal of the proposed framework is to assist practitioners with an automated, reproducible, and explainable decision-support platform for assessing hair loss and scalp conditions. Intended for point-of-care clinical use, the system processes standard photographs obtained via tablets or mobile devices, eliminating the requirement for specialized dermatoscope hardware that might restrict deployment in low-resource environments.

The scope of the system encompasses:
- Real-time image quality assessment at the point of capture to prevent noisy or unusable inputs from reaching the models.
- Automated routing to gender-specific staging classifiers (7-class Norwood for males, 3-class Ludwig for females).
- Parallel multi-class disease screening across 8 distinct clinical scalp conditions plus a healthy baseline.
- Automated visual attribution overlay generation using Grad-CAM for every prediction the system produces.
- Automatic fallback and safety logic to protect against ungrounded diagnostic claims on ambiguous inputs.
- Dynamic compilation of authenticated, editable PDF clinical reports for longitudinal patient tracking.

---

## V. THEORETICAL FOUNDATIONS

This section formalizes the mathematical basis of the four core mechanisms underlying the proposed framework: the transfer-learning classification objective, the contrast-enhancement transform, the gradient-based explainability operator, and the confidence-gating decision rule.

### A. Convolutional Feature Extraction and Compound Scaling
Each of the three classification branches is instantiated from an EfficientNet-B0 backbone. Let an input image be denoted X in R^(H x W x 3). A convolutional network f_theta maps X to a feature tensor through a sequence of L mobile inverted bottleneck blocks:
z(l) = F(l)(z(l-1); theta(l)), l = 1, ..., L (1)
where z(0) = X and each F(l) composes a depthwise-separable convolution, a squeeze-and-excitation gate, and a non-linear activation. EfficientNet's defining property is compound scaling [7]: rather than arbitrarily increasing depth, width, or input resolution, the three are jointly scaled by a compound coefficient phi under a fixed resource budget:
d = alpha^phi, w = beta^phi, r = gamma^phi s.t. alpha * beta^2 * gamma^2 ~ 2 (2)
with alpha, beta, gamma >= 1 determined by a small grid search and phi = 0 corresponding to the B0 baseline used in this work. This coupling is the theoretical justification for adopting EfficientNet-B0 as the shared backbone across all three branches: it offers a favourable accuracy-to-FLOP ratio among convolutional families at the parameter budget appropriate for point-of-care (edge-deployable) inference, without requiring per-task architecture search.

### B. Classification Objective
The final feature map z(L) is global-average-pooled and passed through a task-specific linear head Wk in R^(Ck x d) (with k in {Norwood, Ludwig, Disease} and Ck in {7, 3, 9}), producing logits u = Wk z_bar(L) + bk. A softmax converts logits to a probability distribution over Ck classes:
pi = exp(ui) / sum_j exp(uj), i = 1, ..., Ck (3)
Each branch is fine-tuned by minimizing the categorical cross-entropy between the predicted distribution p and the one-hot ground-truth label y:
L_CE = - sum_i yi log pi (4)
with parameters updated via Adam [11], whose per-parameter update combines first- and second-moment estimates of the gradient gt = grad_theta L_CE:
theta_(t+1) = theta_t - eta * m_hat_t / (sqrt(v_hat_t) + epsilon), m_hat_t = mt / (1 - beta1^t), v_hat_t = vt / (1 - beta2^t) (5)
where mt and vt are exponential moving averages of gt and gt^2 respectively. Because the three branches are trained independently but share an identical objective form (Eq. 4) and initialization strategy (ImageNet-pretrained weights [12]), the overall training procedure can be viewed as three coupled instances of the same optimization problem over disjoint label spaces Yk, which is what permits a single preprocessing and inference pipeline to serve all three heads without task-specific re-engineering.

### C. Contrast-Limited Adaptive Histogram Equalization
Let Y(x, y) denote the luminance channel of the YUV-converted input image. The image is partitioned into non-overlapping contextual tiles, and within each tile the local intensity histogram h(v), v in [0, 255], is computed. Standard adaptive histogram equalization can over-amplify noise in near-uniform regions (such as smooth scalp skin), so CLAHE [8] first clips the histogram at a limit beta:
hclip(v) = min{h(v), beta}, Delta = (1/256) sum_v [h(v) - hclip(v)] (6)
after which the clipped-away mass Delta is redistributed uniformly across all intensity bins, h_tilde(v) = hclip(v) + Delta. The redistributed histogram yields a tile-local cumulative distribution function
T(v) = (255/N) sum_(u=0..v) h_tilde(u) (7)
with N the number of pixels per tile, and the mapping T(.) is applied to each pixel with bilinear interpolation across tile boundaries to avoid blocking artifacts. Because the transform operates purely on Y and leaves the U, V chrominance channels untouched, color information relevant to erythema and pigmentation cues – which downstream disease classification depends on – is preserved under this preprocessing step, while local contrast in low-signal regions is enhanced.

### D. Gradient-Weighted Class Activation Mapping
Let Ak in R^(u x v) denote the k-th activation map of the final convolutional layer, and let yc be the logit for target class c. Grad-CAM [6] defines an importance weight for each channel k as the global average of the gradient of yc with respect to that channel's activations:
alpha_k^c = (1/Z) sum_i sum_j (d yc / d Ak_ij) (8)
where Z = u * v is a normalizing constant. The class-discriminative localization map is a weighted combination of the forward activations, passed through a rectifying non-linearity to retain only features that positively influence the target class:
L_Grad-CAM^c = ReLU( sum_k alpha_k^c Ak ) (9)
The ReLU in Eq. 9 is theoretically significant, not merely a convenience: features with a negative gradient contribution would push the prediction away from class c, so suppressing them ensures the resulting heatmap localizes evidence for the predicted stage or pathology rather than a mixture of supporting and opposing evidence. L_Grad-CAM^c is bilinearly upsampled from the final feature-map resolution to the input resolution H x W and alpha-blended over X to produce the overlay presented to the clinician.

### E. Confidence-Gated Decision Rule
Let pdis in Delta^9 be the softmax output (Eq. 3) of the disease-screening branch, and Pmax = max_i pdis_i. The deployed decision function is a thresholded, confidence-remapping rule rather than a direct arg-max:
y_hat = argmax_i pdis_i if Pmax >= tau; “Healthy Scalp” if Pmax < tau
c_hat = Pmax if Pmax >= tau; 1 - Pmax if Pmax < tau (10)
with tau = 0.50. The rationale for Eq. 10 follows from a simple asymmetric-risk argument: in a screening (as opposed to definitive-diagnosis) setting, the clinical cost of a false pathological alarm on an ambiguous image is treated as materially lower than the cost of an unexplainable, overconfident-sounding low-probability disease label being surfaced to a non-specialist clinician. Reframing c_hat = 1 - Pmax under the low-confidence branch converts a statement of model uncertainty about pathology into a statement of assurance of the absence of a confident pathological signal, which is the more actionable and less alarm-prone quantity for point-of-care use. Eq. 10 is intentionally applied only to the disease branch and not to the staging branches (Norwood/Ludwig), since hair-loss stage is a graded, ever-present measurement rather than a binary presence/absence pathology decision, and therefore does not admit the same "healthy override" semantics.

### F. Evaluation Metrics Formalism
Although the present study reports qualitative system behaviour (Section IX), the framework is designed to be evaluated quantitatively against a held-out, dermatologist-annotated test set, and the relevant metrics are formalized here for that purpose. For a C-class branch, let TPi, FPi, TNi, FNi denote the true-positive, false-positive, true-negative, and false-negative counts for class i under a one-vs-rest reduction of the confusion matrix M in N^(C x C), where Mij counts test instances of true class i predicted as class j. Overall accuracy is the trace-normalized sum
Accuracy = sum_i Mii / sum_i sum_j Mij (11)
which is an appropriate headline metric only when class frequencies are roughly balanced; given that clinical scalp-disease datasets are typically class-imbalanced (a healthy or near-healthy scalp is far more common than any single rare pathology), per-class precision and recall are reported alongside it:
Precision_i = TPi / (TPi + FPi), Recall_i = TPi / (TPi + FNi) (12)
The two are combined into a per-class harmonic mean, the F1 score,
F1_i = 2 * Precision_i * Recall_i / (Precision_i + Recall_i) (13)
and macro-averaged across classes, F1_macro = (1/C) sum_i F1_i, to weight rare pathologies equally with common ones rather than letting the frequent "Healthy Scalp" class dominate the aggregate score. For ordinal branches specifically – Norwood-7 and Ludwig-3, where the classes have a natural severity ordering and a stage-4 image misclassified as stage-3 is a materially smaller error than the same image misclassified as stage-7 – plain classification accuracy is an inappropriate sole metric, since it penalizes all misclassifications equally regardless of ordinal distance. A more appropriate ordinal-aware metric is quadratic-weighted Cohen's Kappa,
kappa_w = 1 - sum_(i,j) w_ij Mij / sum_(i,j) w_ij Eij, w_ij = (i-j)^2 / (C-1)^2 (14)
where Eij is the outer product of the marginal row and column sums of M (the confusion matrix expected under independence), and w_ij penalizes disagreements quadratically in their ordinal distance, so a two-stage staging error contributes proportionally more than a one-stage error. Finally, because the confidence-gated safety filter (Eq. 10) explicitly trades sensitivity for specificity on the disease branch, its effect is best summarized not by a single operating point but by the receiver operating characteristic obtained by sweeping tau and plotting the true-positive rate against the false-positive rate, with the area under this curve (AUROC) serving as a threshold-independent measure of the disease branch's underlying discriminative quality, separate from the specific tau = 0.50 operating point selected for clinical deployment.

---

## VI. METHODOLOGY

The diagnostic workflow executes across an 11-stage sequence, progressing from user authentication to report generation:

1) **Clinician Authentication:** Secure access is verified using JWT token authentication before initiating an examination session.
2) **Client-Side Quality Screening:** The front-end camera interface evaluates live video frames, enforcing luminance and sharpness checks (Laplacian variance > 75) to reject unsuitable frames before network transmission.
3) **Gender Selection and Routing:** Patient demographic data is entered, using the gender designation to direct the scan to the appropriate staging classifier.
4) **Server Payload Ingestion:** The FastAPI backend receives the image via `POST /scans/upload` and re-evaluates quality parameters server-side to confirm compliance.
5) **Database Persistence:** Examination records and metadata are logged to a PostgreSQL datastore, with automatic fallback to local SQLite if the primary server is unreachable.
6) **Image Preprocessing:** The image is converted to the YUV color space, where Adaptive CLAHE is applied to the Y channel to normalize contrast prior to resizing to 224 × 224 × 3.
7) **Dual Model Inference:** The preprocessed tensor is evaluated concurrently by the gender-selected staging network (7-class Norwood or 3-class Ludwig) and the 9-class pathology classifier.
8) **Safety Gating Evaluation:** Output probabilities from the disease branch are assessed against the 50% confidence threshold defined in Eq. 10.
9) **Visual Explanation Generation:** Feature maps and gradient hooks attached to `model.features[-1]` generate spatial attribution heatmaps for each output branch.
10) **Clinical Recommendation Formatting:** A rule-based engine generates tailored clinical guidance and disclaimers based on the model outputs and safety decisions.
11) **PDF Compilation and History Update:** Diagnostic results, heatmaps, and clinician comments are compiled into an editable ReportLab PDF report while updating patient records for longitudinal comparison.

### A. Flowchart Descriptions
`User/Clinician Login (JWT) → Camera Feed Capture → Client-Side Quality Gate (Blur/Luminance) → Server Endpoint Ingestion → Secondary Validation → Database Metadata Allocation → Adaptive CLAHE Preprocessing → Parallel Inference Engine (Gender-Routed Staging + Disease Model) → Safety Filter Evaluation → Grad-CAM Generation → Recommendation Engine → ReportLab PDF Build → Dashboard Update`

---

## VII. SYSTEM ARCHITECTURE

The system is structured around a decoupled service-oriented architecture designed to maintain operational stability, processing efficiency, and diagnostic transparency across four independent layers.

**Preprocessed Scan (224 × 224 × 3) → Split Execution Paths:**
- **Branch A (Staging):** Check Gender → [If Male → Norwood EfficientNet-B0 (7 Classes)] OR [If Female → Ludwig EfficientNet-B0 (3 Classes)] → Output Stage Confidence Score.
- **Branch B (Disease Screening):** 9-Class Disease EfficientNet-B0 → Extract Maximum Softmax Probability ($P_{\text{max}}$).
- **Safety Decision Gating:** Is $P_{\text{max}} \ge 0.50$? → YES: Retain Disease Label; → NO: Override Label to "Healthy Scalp", Recalculate Confidence as $(1.0 - P_{\text{max}})$.
- **Both Branches:** → Grad-CAM Hook Layer (`features[-1]`) → Overlay Generation → PDF Engine

**Fig. 2. Detailed architectural decision flow for parallel inference, confidence thresholding, and XAI mapping — illustrating gender-directed routing to task-specific staging classifiers operating within a parallel execution engine.**

- **Layer 1: Presentation Layer** — React / Vite SPA · TypeScript · TailwindCSS · HTML5 Canvas Quality Gate  
  `↓ HTTPS / REST API secured with JWT session authentication`
- **Layer 2: Application Layer (FastAPI)** — Auth Module · Quality Validation Service · Preprocessing Engine (CLAHE) · Recommendation System · ReportLab Engine  
  `↓ PyTorch Inference Hooks`
- **Layer 3: Artificial Intelligence Layer** — EfficientNet-B0 Staging Models (Norwood/Ludwig) · EfficientNet-B0 Disease Model · Grad-CAM Layer  
  `↓ SQLAlchemy ORM`
- **Layer 4: Data Layer** — PostgreSQL Database · SQLite Fallback Database · Scan History · Report Storage

**Fig. 3. Overall architecture of the proposed hair-loss staging and scalp disease screening framework, showing the core processing engine (image input → AI staging & classification → outcomes/data output) and its six downstream outcome modules: hair-loss staging, disease classification, safety filtering, Grad-CAM generation, the recommendation engine, and report/dashboard delivery.**

The Presentation Layer consists of a React single-page application that manages camera acquisition, displays real-time frame quality feedback, and renders Grad-CAM overlays alongside report previews. The Application Layer, implemented with FastAPI, handles REST API routing, manages JWT authentication, executes CLAHE image contrast operations, and coordinates model execution. The Artificial Intelligence Layer contains three fine-tuned EfficientNet-B0 models (two gender-specific staging networks and one pathology classifier) together with Grad-CAM gradient hooks. The Data Layer persists scan metadata, historical predictions, and generated reports, defaulting to PostgreSQL with an automatic SQLite fallback when the primary connection is unavailable, ensuring uninterrupted clinical operation even under unstable local infrastructure – a realistic concern for many point-of-care deployment sites.

---

## VIII. IMPLEMENTATION

### A. Model Training Configuration
All three classification networks (Norwood-7, Ludwig-3, and Disease-9) use an EfficientNet-B0 backbone pretrained on ImageNet [12], with the final classification head replaced to match each task's output cardinality. Fine-tuning is performed using the Adam optimizer [11] with an initial learning rate of $1 \times 10^{-4}$, categorical cross-entropy loss, and a step-decay learning rate scheduler. Standard augmentations – horizontal flipping, random rotation ($\pm 15^\circ$), and brightness/contrast jitter – are applied during training to improve robustness to real-world capture variance, given that clinician-captured images (unlike dermoscopic images) are subject to inconsistent ambient lighting and framing.

### B. Dataset Composition and Handling
Each of the three branches is trained on a curated corpus of clinician-captured scalp images assembled and gender/stage-labelled independently for the Norwood, Ludwig, and disease-screening tasks, reflecting the fact that these are disjoint label spaces $Y_k$ rather than a single shared taxonomy. As is typical of clinical scalp imagery, the disease-screening corpus is class-imbalanced, with healthy or near-healthy presentations substantially over-represented relative to any single rare pathology; this imbalance is the direct motivation for reporting macro-averaged F1 and per-class precision/recall (Eqs. 12–13) rather than relying on aggregate accuracy alone. Images are held to a minimum resolution and quality bar enforced by the same luminance/blur gate used at inference time, so that the training distribution is representative of what the deployed quality gate will actually admit in production, rather than a curated set of ideal exemplars that would understate real-world difficulty. A stratified split by class and, where available, by patient identity is used to construct held-out validation and test partitions, avoiding the leakage that would occur if multiple images of the same patient appeared across both training and evaluation sets.

### C. Image Quality Gating
To reduce downstream inference errors caused by poor input quality, a two-stage quality gate is enforced. At capture time, the front-end interface calculates mean luminance and Laplacian variance scores directly within the client browser, dropping images that fail quality criteria. Upon payload delivery, the server recalculates these parameters to prevent client-side bypass and ensure input standards remain enforced.

### D. Adaptive CLAHE Preprocessing
Before neural evaluation, each validated photo is transformed into YUV color space, where Adaptive CLAHE is executed exclusively on the luminance (Y) channel. This maintains chrominance fidelity for evaluating skin redness and pigmentation while enhancing structural details in low-contrast scalp regions under non-uniform illumination.

### E. Grad-CAM Integration
Grad-CAM spatial attribution is integrated by attaching forward and backward hooks to the final convolutional block (`model.features[-1]`) of each EfficientNet-B0 model. During forward passes, gradients of target class logits relative to activation maps are captured, global-average-pooled, and used to weight feature channels. The computed localization maps are upsampled, color-mapped, and blended onto the input image to provide visual explanations of model outputs.

### F. Clinical Safety Filter
The confidence-gated safety filter is restricted to the disease classification branch. When the top probability $P_{\text{max}}$ across the 9 disease classes falls below 0.50, the system reassigns the output label to "Healthy Scalp" and recalculates confidence as $1.0 - P_{\text{max}}$. This presents uncertain outputs as evidence of no detected pathology rather than a tentative disease label, preventing false alarms on ambiguous scans.

### G. Backend and Persistence
The FastAPI application exposes REST endpoints for image submission, historical scan retrieval, and PDF generation, with JWT authentication protecting all clinician routes. Database operations use SQLAlchemy ORM, backing up to PostgreSQL with automatic failover to local SQLite when network connections are interrupted. Diagnostic reports are generated dynamically using ReportLab, embedding original photographs, Grad-CAM overlays, severity scores, and clinical recommendations into editable PDF files.

### H. Regulatory and Ethical Considerations
Because the system is intended to operate on identifiable patient imagery in a clinical context, all scan data is treated as protected health information within the application: images and predictions are stored only behind the JWT-authenticated session boundary, and no image data is transmitted to any third-party inference service, since all model execution occurs on infrastructure controlled by the deploying clinic. The confidence-gated safety filter described in Section V is itself partly a design response to this context: an automated system intended to sit alongside, rather than replace, a licensed clinician's judgment should be conservative about surfacing confident-sounding pathology labels on ambiguous evidence. Aligned with this design rationale, all generated output documents state that predictions serve strictly as decision support rather than autonomous diagnoses, and formal institutional review and regulatory approvals remain necessary prior to deployment in active clinical settings.

---

## IX. RESULTS AND DISCUSSION

### A. Qualitative System Behavior
Qualitative assessment of the operational pipeline indicates that the framework functions as designed across its primary operational objectives. Gender-based routing correctly directs male-labeled scans to the 7-class Norwood–Hamilton classifier and female-labeled scans to the 3-class Ludwig classifier, avoiding the cross-application of clinically inappropriate staging scales. The parallel disease-screening branch executes independently of the staging branch, allowing both outputs to be produced from a single uploaded image without requiring a second capture or additional clinician action.

### B. Effect of the Safety Filter
Inspection of the confidence-gating logic shows that it meaningfully reduces the risk of confident false-positive disease alarms on ambiguous inputs: predictions with $P_{\text{max}} < 0.50$ are consistently re-labeled as "Healthy Scalp" with an inverse-confidence score, rather than being surfaced as a low-confidence but still named pathology. This design choice trades a small amount of sensitivity on genuinely borderline cases for a reduction in clinician alarm fatigue and unnecessary follow-up referrals – a trade-off that is generally preferable in a screening (rather than definitive-diagnosis) context, and one that is consistent with how the receiver-operating-characteristic framing in Section V-F treats $\tau$ as a tunable operating point rather than a fixed property of the underlying classifier.

### C. Explainability Output
The Grad-CAM overlays generated at the final convolutional layer consistently localize activation to plausible anatomical regions – e.g., temporal and vertex regions for Norwood staging, and diffuse crown regions for Ludwig staging – lending qualitative support to the claim that the underlying networks are attending to clinically relevant features rather than spurious background cues such as image borders or capture artifacts. This is particularly valuable given that the confidence-gated safety filter already withholds low-confidence disease labels: for the predictions that are surfaced, the accompanying heatmap gives the clinician an independent, visual means of sanity-checking the model's reasoning rather than having to trust a bare probability score.

### D. System Resilience
The dual-database design was qualitatively verified by deliberately interrupting the PostgreSQL connection during operation; the application transparently falls back to the local SQLite datastore without interrupting the clinician's active session, and metadata logging continues uninterrupted. This confirms the practical value of the fallback mechanism for point-of-care deployments where network or database infrastructure may be unreliable.

### E. Limitations
The present evaluation is qualitative rather than a quantitative benchmark against a held-out labeled clinical dataset; formal evaluation using the metrics formalized in Section V-F – per-class precision/recall/F1, macro-F1, quadratic-weighted Cohen's $\kappa$ for the ordinal staging branches, and AUROC for the disease branch – against dermatologist ground truth remains necessary before any claim of diagnostic-grade performance can be made. Additionally, the disease-screening model's 9-class taxonomy, while broad, does not cover the full spectrum of scalp pathologies encountered in clinical practice, and rare conditions outside this taxonomy will currently be forced into the nearest available class or filtered to "Healthy Scalp" by the safety gate.

---

## X. CONCLUSION

This paper presented a unified, explainable deep learning framework for gender-aware hair-loss staging and multi-class scalp disease screening from a single clinician-captured image. By combining a gender-branching EfficientNet-B0 architecture, natively integrated Grad-CAM explainability, and a confidence-gated clinical safety filter within a resilient full-stack deployment, the system addresses four concrete gaps in existing tools: isolated task processing, lack of gender-aware routing, absence of safety mechanisms, and lack of production-grade explainability. Qualitative assessment of the pipeline confirms that the platform outputs consistent, spatially verifiable, and appropriately conservative decision-support insights suitable for point-of-care clinical evaluation.

---

## XI. FUTURE SCOPE

Future research directions include: (i) carrying out rigorous quantitative benchmark evaluations against dermatologist-verified test datasets to measure accuracy, sensitivity, and specificity for both staging and disease networks; (ii) expanding the disease classification taxonomy to encompass less common scalp pathologies and clinical lookalikes; (iii) integrating longitudinal image registration algorithms to automate tracking of hair recovery over extended treatment periods; (iv) adapting the gender-routing logic to accommodate diverse demographic presentations within a consolidated staging framework; and (v) conducting clinical usability studies with practicing dermatologists to assess the real-world impact of Grad-CAM visual heatmaps and safety-gated decision rules.

---

## REFERENCES

[1] X. Liu et al., "Deep Learning Based Hamilton–Norwood Hair Loss Classification Using CNN Architectures," *IEEE Access*, vol. 12, pp. 1–12, 2024.  
[2] Y. Gao et al., "Automatic BASP Classification Using Deep Learning and Trichoscopic Image Analysis," *Computer Methods and Programs in Biomedicine*, vol. 221, p. 106894, 2022.  
[3] C. Chang et al., "ScalpEye: A Deep Learning Based Home Scalp Diagnosis System," *IEEE Access*, vol. 8, pp. 185234–185245, 2020.  
[4] H. Jeong et al., "AI-ScalpGrader: EfficientNet-Based Scalp Health Assessment," *Sensors*, vol. 23, no. 14, p. 6400, 2023.  
[5] Y. Jin et al., "Automated Scalp Dandruff and Erythema Severity Assessment Using EfficientNet-B0," *Scientific Reports*, vol. 14, pp. 1–15, 2024.  
[6] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization," in *Proc. IEEE Int. Conf. Computer Vision (ICCV)*, 2017, pp. 618–626.  
[7] M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proc. 36th Int. Conf. Machine Learning (ICML)*, 2019, pp. 6105–6114.  
[8] K. Zuiderveld, "Contrast Limited Adaptive Histogram Equalization," in *Graphics Gems IV*, Academic Press, 1994, pp. 474–485.  
[9] O. T. Norwood, "Male Pattern Baldness: Classification and Incidence," *Southern Medical Journal*, vol. 68, no. 11, pp. 1359–1365, 1975.  
[10] E. Ludwig, "Classification of the Types of Androgenetic Alopecia (Common Baldness) Occurring in the Female Sex," *British Journal of Dermatology*, vol. 97, pp. 247–254, 1977.  
[11] D. P. Kingma and J. Ba, "Adam: A Method for Stochastic Optimization," in *Int. Conf. Learning Representations (ICLR)*, 2015.  
[12] J. Deng et al., "ImageNet: A Large-Scale Hierarchical Image Database," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, 2009, pp. 248–255.  

---

## Revision Log

| Section / Location | Highlighted Text / Topic Rewritten | Summary of Revision Made |
| :--- | :--- | :--- |
| **Title** | Research paper title | Re-expressed clearly in standard academic style while preserving all technical terminology. |
| **Abstract** | Complete Abstract paragraph | Fully reconstructed the abstract to describe clinical challenges, gender-branching architecture, EfficientNet-B0 backbones, safety filter logic (<50% override to Healthy Scalp), Grad-CAM, and qualitative evaluation without passive AI phrasing. |
| **Section I - Intro (P1)** | Intro paragraph on AGA and scalp pathologies | Rephrased global clinical burden, AGA prevalence, scarring pathologies (Alopecia Areata, Folliculitis Decalvans, Pseudopelade), and why conflating pattern baldness with disease limits diagnostic utility. |
| **Section I - Intro (Vulnerabilities)** | Items 1, 2, and 3 | Re-articulated observer variability across Norwood/Ludwig scales, urban geographic concentration of trichologists, and lack of objective longitudinal tracking. |
| **Section I - Intro (Roadmap)** | Paper structure outline paragraph | Rewrote the paper structure roadmap sentence-by-sentence in natural active academic prose. |
| **Section II - Lit Review (Intro & Sec A)** | Intro and Deep Learning for Male Staging | Re-wrote the survey of Hamilton-Norwood automated classification (Liu et al., Gao et al., BASP, Mask R-CNN) highlighting the male-only dataset limitation. |
| **Section III - Research Gap** | Gap items 2, 3, 4 and closing summary | Reconstructed gaps regarding single-classifier label forcing, lack of safety gating for raw softmax probabilities, omission of native Grad-CAM report integration, and how the architecture bridges them. |
| **Section IV - Proposed System** | Purpose & scope introduction | Rephrased the primary objective of non-dermoscopic point-of-care decision support on mobile/tablet photos without specialized scope hardware. |
| **Section VI - Methodology** | Workflow intro & 11 steps | Re-authored the step-by-step description of the 11 pipeline stages (JWT auth, live quality gating with Laplacian variance > 75, gender routing, server ingestion, CLAHE, dual inference, safety filter, Grad-CAM, ReportLab PDF compilation). |
| **Section VII - Architecture** | Layer intro, Branch B, Fig captions, Layer 1 HTTP | Rephrased the 4-layer enterprise architecture, 9-class disease softmax extraction, safety decision gating, and HTTPS/JWT transport description. |
| **Section VIII - Implementation** | Presentation Layer, Quality Gating, CLAHE, Grad-CAM, Safety Filter, Backend, Regulatory | Re-wrote technical implementation details covering React/FastAPI/PyTorch layers, browser/server Laplacian variance checks, YUV CLAHE luminance processing, model.features[-1] Grad-CAM hooks, 50% safety gating override logic, PostgreSQL/SQLite fallback, and HIPAA/ethical decision support positioning. |
| **Section IX - Results & Discussion** | Qualitative system behavior intro | Rephrased the operational validation confirming gender-based routing and parallel multi-task execution. |
| **Section X - Conclusion** | Middle evaluation summary sentence | Re-articulated that qualitative assessment confirms consistent, spatially interpretable, and conservative outputs. |
| **Section XI - Future Scope** | Entire Future Scope section | Fully reconstructed all 5 future research directions: quantitative dermatologist ground-truth benchmark, expanding 9-class taxonomy, longitudinal image registration, non-binary staging routing, and clinical usability studies. |
