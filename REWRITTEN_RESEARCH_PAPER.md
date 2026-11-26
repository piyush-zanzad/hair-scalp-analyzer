# A Unified, Explainable Deep Learning Framework for Gender-Adaptive Pattern Baldness Staging and Scalp Pathology Classification

**Authors:** Piyush Zanzad, Sharvil Titarmare, Birendra Kumar  
**Affiliation:** G. H. Raisoni College of Engineering, Nagpur  

---

## Abstract

Clinical evaluation of hair loss and scalp pathologies remains heavily reliant on subjective visual inspection. This introduces high observer variability, limits access to specialized trichological care in rural areas, and lacks objective indicators for tracking longitudinal recovery. In this paper, we present a unified, clinical-grade deep learning framework that simultaneously stages gender-specific pattern baldness and screens for multi-class scalp pathologies from a single consumer-grade image. The pipeline integrates an automated input quality check and an anti-fraud modality filter. This filter analyzes high-resolution central crops using contour geometry and HSV skin-tone distribution to isolate printed graphics, slides, and packaging from valid biological scalp tissue. Verified inputs are preprocessed using Contrast Limited Adaptive Histogram Equalization (CLAHE) before entering a parallel, gender-branched inference architecture. Male patients are graded on the 7-stage Norwood scale, female patients on the 3-stage Ludwig scale, and all inputs are concurrently screened across a 9-class scalp pathology model. We train the pathology classifier using inverse-class-frequency cross-entropy loss to address severe dataset imbalance. Low-confidence disease predictions are suppressed using a safety filter and re-expressed as assurance scores. To ensure transparency, we natively integrate Gradient-Weighted Class Activation Mapping (Grad-CAM) to generate pixel-level visual explanations. The entire pipeline compiles diagnostic classifications, quality scores, and heatmaps into a dynamically generated, clinician-signed PDF report.

**Index Terms—** Scalp Analysis, Trichology, Norwood Classification, Ludwig Staging, Computer Vision, Explainable AI (XAI), Deep Learning, Clinical Decision Support.

---

## I. INTRODUCTION

Diseases affecting the hair follicles and scalp tissue represent a significant portion of dermatological consultations globally. Androgenetic Alopecia (AGA) is the most prevalent form of progressive hair loss, affecting roughly 80% of Caucasian men and 50% of women during their lifetimes. Concurrently, inflammatory, infectious, and autoimmune scalp disorders—such as Alopecia Areata, Folliculitis Decalvans, and Pseudopelade—require prompt clinical intervention to prevent irreversible scarring, permanent follicular destruction, and secondary infections. Because many of these conditions present with visually overlapping patches of localized hair loss or erythema, they are easily misdiagnosed by general practitioners, leading to incorrect treatment pathways. 

Traditional clinical diagnosis relies on visual inspection under a hand-held dermatoscope or trichoscope. While effective, manual assessment suffers from three critical limitations:
1. **High Subjectivity and Observer Discordance:** Visual grading on standardized clinical scales, such as the Norwood-Hamilton or Ludwig classifications, varies widely among practitioners. The same clinician can assign conflicting grades to the same patient across sequential visits.
2. **Geographical Maldistribution of Specialists:** Trichologists and dermatologists are overwhelmingly concentrated in urban medical centers. Patients in rural or low-resource regions face prolonged delays before receiving accurate diagnoses.
3. **Absence of Quantitative Tracking Tools:** Monitoring treatment efficacy requires comparing subtle changes in follicle density and skin inflammation over several months. Text-based clinical notes do not provide a structured baseline for objective longitudinal tracking.

Recent computer vision methods utilizing deep convolutional neural networks (CNNs) have shown promise in automating dermatological classification. However, existing academic and commercial scalp analysis tools suffer from several architectural deficiencies. First, they treat hair loss as a monolithic classification task. This ignores the fundamental anatomical dimorphism between male pattern baldness (temporal recession and vertex balding) and female pattern baldness (diffuse crown thinning with a preserved frontal hairline). These distinct patterns represent separate clinical scales and should not share a single label space. Second, existing systems evaluate pattern baldness and scalp pathologies in isolation, requiring clinicians to run multiple separate diagnostic tools. Third, standard deep learning models act as "black boxes," offering no explanation for their predictions. This lack of transparency remains a major barrier to clinical adoption.

To close these gaps, we present a unified, clinical-grade deep learning framework for automated hair-loss staging and multi-class scalp disease screening. Our system makes four primary contributions:
* **Gender-Branching Multi-Model Inference:** An architecture that automatically routes input scans by gender to dedicated, fine-tuned EfficientNet-B0 staging classifiers (7-stage Norwood for males, 3-stage Ludwig for females) running in parallel with a 9-class scalp pathology model.
* **Text & Modality Validation Filter:** A computer vision filter that checks input image structure to detect and reject non-scalp imagery (such as slides, packaging, or documents) before running deep learning inference.
* **Dynamic Explainability with Grad-CAM:** Integration of Gradient-Weighted Class Activation Mapping directly into the diagnostic workflow, producing real-time heatmaps that show the exact clinical features driving the classifications.
* **Confidence-Gated Safety Engine:** A decision-rule processor that automatically overrides low-confidence disease predictions to "Healthy Scalp," preventing alarm fatigue and false medical alarms on ambiguous inputs.

---

## II. LITERATURE REVIEW

### A. Deep Learning in Male Pattern Staging
The Hamilton-Norwood scale remains the global clinical standard for staging male androgenetic alopecia. However, visual grading is highly subjective and depends on clinician experience. To address this, deep learning models have been applied to classify hair loss stages from photographs. Liu et al. compared VGG-16, ResNet-50, and RegNet-64 architectures using facial and crown images, finding that RegNet-64 achieved the highest classification accuracy for Norwood stages. Gao et al. focused on trichoscopy, extracting quantitative features like hair density and shaft diameter to feed an ordinal regression framework for Basic and Specific (BASP) staging. More recently, researchers have used Mask R-CNN segmentations to isolate the hairline and calculate area-ratio metrics. However, these systems focus exclusively on male cohorts, ignoring female diffuse thinning patterns.

### B. Female-Pattern Hair Loss Staging
Female androgenetic alopecia is clinically distinct from male balding, presenting as diffuse thinning across the central crown while preserving the frontal hairline. Conventionally graded on the 3-point Ludwig scale, female hair loss is underrepresented in deep learning literature. Most scalp-imaging systems either omit female subjects entirely or group them into a binary "hair loss present/absent" category. This clinical asymmetry highlights the need for our gender-branching architecture, which treats the Ludwig scale as a dedicated, first-class diagnostic pipeline.

### C. Scalp Pathology Classification
Beyond pattern baldness, several deep learning systems target inflammatory and autoimmune scalp conditions. Chang et al. introduced *ScalpEye*, which pairs a custom smartphone micro-camera with a CNN to detect dandruff, folliculitis, and thinning. Jeong et al. developed *AI-ScalpGrader*, utilizing a cloud-hosted EfficientNet classifier to grade ten different scalp symptoms. Similarly, Jin et al. fine-tuned an EfficientNet-B0 model to grade dandruff and erythema on a four-level scale. While these approaches confirm that EfficientNet-B0 is a highly effective backbone for scalp analysis, none of them run staging and pathology screening in parallel, and none incorporate input validation or confidence gating.

### D. Explainable AI (XAI) in Medical Imaging
Using black-box models in clinical diagnostics introduces significant liability and safety concerns. Selvaraju et al. developed Gradient-Weighted Class Activation Mapping (Grad-CAM), which uses gradients flowing into the final convolutional layer of a CNN to produce a coarse localization map showing the regions most responsible for a prediction. While Grad-CAM has been applied to various medical imaging modalities, it is rarely integrated directly into active clinical workflows. In most scalp analysis systems, visual explanations are either absent or relegated to offline research steps.

---

## III. RESEARCH GAP

Existing automated scalp diagnostic systems exhibit four key deficiencies:
1. **Isolated Task Processing:** No current framework offers a unified, single-pass assessment covering both pattern baldness staging and multi-pathology disease screening from a single image.
2. **Monolithic Label Spaces:** Current systems run a single classifier for all patients, failing to separate male temporal/vertex recession from female diffuse crown thinning. This erases the clinical distinction between the Norwood and Ludwig scales.
3. **Absence of Modality Validation:** Existing tools assume all uploaded files are valid medical images. They lack anti-fraud filters to detect and reject non-scalp uploads (like charts, slides, or packaging).
4. **Lack of Inline Safety Gating:** Standard deep learning pipelines display raw softmax probabilities, presenting ambiguous or low-confidence predictions as solid diagnoses, which can cause clinical alarm fatigue.

---

## IV. PROPOSED SYSTEM

The proposed system provides an automated, objective, and explainable clinical decision-support pipeline designed for point-of-care use. It works with standard consumer-grade photographs captured on tablets, smartphones, or dermatoscopes, eliminating the need for expensive proprietary imaging hardware.

The system is responsible for:
* **Modality Validation**: Automatically detecting and rejecting slides, text documents, or product packaging.
* **Webcam Quality Checks**: Evaluating luminance and blur in real-time to ensure diagnostic-grade inputs.
* **Gender-Routed Staging**: Routing male scans to a 7-class Norwood classifier and female scans to a 3-stage Ludwig classifier.
* **Parallel Pathology Screening**: Evaluating the scan across 8 scalp diseases and a healthy baseline.
* **Native Grad-CAM Explainability**: Visualizing the features driving the predictions.
* **Clinical Safety Gating**: Overriding low-confidence disease predictions to "Healthy Scalp."
* **Report Compilation**: Exporting results, heatmaps, and clinician notes to a signed PDF.

---

## V. THEORETICAL FOUNDATIONS

### A. Convolutional Feature Extraction & Compound Scaling
Our system uses the EfficientNet-B0 architecture as its core convolutional backbone. EfficientNet-B0 utilizes a compound scaling method that balances network depth ($d$), width ($w$), and input resolution ($r$) using a compound coefficient $\phi$:
$$d = \alpha^\phi, \quad w = \beta^\phi, \quad r = \gamma^\phi \quad \text{s.t.} \quad \alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$$
where $\alpha, \beta, \gamma \ge 1$. This compound scaling provides an optimal balance between parameter efficiency and classification accuracy, making the model suitable for deployment on edge devices and clinical workstations.

### B. Classification Objective & Optimization
For each classification branch $k \in \{\text{Norwood}, \text{Ludwig}, \text{Disease}\}$, the final feature maps are global-average-pooled and passed to a linear head $W_k \in \mathbb{R}^{C_k \times d}$, generating logits $u = W_k \bar{z} + b_k$. A softmax function converts these logits to class probabilities:
$$p_i = \frac{e^{u_i}}{\sum_{j=1}^{C_k} e^{u_j}}$$
We optimize each branch by minimizing the categorical cross-entropy loss between the predicted distribution $p$ and the one-hot ground-truth label $y$:
$$\mathcal{L}_{\text{CE}} = - \sum_{i=1}^{C_k} y_i \log(p_i)$$
Parameters are updated using the Adam optimizer, which combines first and second moment estimates of the gradients:
$$\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$

### C. Contrast Limited Adaptive Histogram Equalization (CLAHE)
To highlight fine hair follicles and skin inflammation under varying lighting, we apply CLAHE to the luminance (Y) channel of the YUV-converted input image. The image is split into non-overlapping tiles, and local histograms $h(v)$ are computed. To prevent noise amplification in uniform skin regions, histograms are clipped at a threshold $\beta$:
$$h_{\text{clip}}(v) = \min(h(v), \beta)$$
The clipped pixels are redistributed uniformly across all intensity bins, yielding a normalized cumulative distribution function:
$$T(v) = \frac{255}{N} \sum_{u=0}^{v} \tilde{h}(u)$$
Bilinear interpolation is used across tile boundaries to eliminate block artifacts, preserving the untouched chrominance (U, V) channels containing redness and pigmentation data.

### D. Gradient-Weighted Class Activation Mapping (Grad-CAM)
We compute Grad-CAM heatmaps by extracting feature map activations $A^k$ and gradients from the final convolutional layer (`model.features[-1]`). The importance weight $\alpha_k^c$ for channel $k$ and target class $c$ is computed as:
$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}$$
The class-discriminative localization map is generated by a weighted combination of forward activations passed through a Rectified Linear Unit (ReLU) to isolate features that positively influence the target class:
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
The resulting heatmap is upsampled to the input dimensions and overlaid on the scan at a $60\% / 40\%$ transparent ratio.

### E. Confidence-Gated Decision Rule
To minimize false-positive medical alarms, the disease classification branch uses a confidence threshold $\tau = 0.50$ (or $\tau = 0.30$ for customized models). If the maximum predicted probability $P_{\text{max}} = \max(p_i)$ falls below $\tau$, the prediction is overridden to "Healthy Scalp":
$$\hat{y} = \begin{cases} \text{argmax}(p) & \text{if } P_{\text{max}} \ge \tau \\ \text{"Healthy Scalp"} & \text{if } P_{\text{max}} < \tau \end{cases}$$
The associated confidence score is re-expressed as assurance: $\hat{c} = 1.0 - P_{\text{max}}$. This asymmetric risk model ensures that clinicians are not distracted by low-confidence predictions on ambiguous images.

---

## VI. METHODOLOGY

The end-to-end workflow consists of eleven operational steps:
1. **Clinician Authentication**: Clinicians log in securely via JWT token verification.
2. **Client-Side Gating**: A browser-side HUD monitors the camera feed, checking average luminance ($50 \le \text{brightness} \le 215$) and Laplacian variance ($\text{blur} > 75$).
3. **Gender Selection**: The clinician selects the patient's gender to determine the appropriate staging scale.
4. **Backend Ingestion**: The FastAPI server receives the image and re-validates quality metrics.
5. **Modality & Antifraud Filter**: The server checks the image to reject non-scalp uploads. It rejects images with $>30\%$ white pixels (slides/documents), images with $<8\%$ skin/hair HSV density (non-skin objects), and images containing $>30$ letter-like contours in a high-res central crop (printed packaging/barcodes).
6. **Adaptive CLAHE Preprocessing**: The backend applies CLAHE to the Y-channel of the YUV image, then resizes it to $224 \times 224$.
7. **Parallel Neural Inference**: The preprocessed tensor is passed concurrently to the gender-routed staging model (Norwood-7 or Ludwig-3) and the 9-class disease model.
8. **Safety Gating**: If the disease prediction falls below the confidence threshold, it is overridden to "Healthy Scalp."
9. **Grad-CAM Heatmap Generation**: Forward and backward hooks capture gradients to generate the visual explanation overlay.
10. **Recommendation Engine**: Actionable, class-specific recommendations and differential diagnostic guidelines are compiled.
11. **Report Generation & Persistence**: The database is updated (with automatic PostgreSQL-to-SQLite fallback), and a clinical PDF report is compiled via ReportLab.

---

## VII. SYSTEM ARCHITECTURE

The system is split into four decoupled architectural layers:
* **Presentation Layer (React, TS, Tailwind)**: Renders the clinical dashboard, camera HUD, and interactive results screen.
* **Application Layer (FastAPI)**: Manages authentication, endpoint routing, quality checks, preprocessing, and report generation.
* **Artificial Intelligence Layer (PyTorch, OpenCV)**: Runs deep learning inference on EfficientNet-B0 models and generates Grad-CAM overlays.
* **Data Layer (PostgreSQL, SQLite, SQLAlchemy)**: Handles persistent storage of user accounts, scan histories, and assets, with automatic SQLite fallback for server resilience.

---

## VIII. IMPLEMENTATION DETAILS

### A. Model Training Configuration
All three classifiers (Norwood-7, Ludwig-3, and Scalp-Disease-9) use an EfficientNet-B0 backbone pretrained on ImageNet. The final classification head is customized to match the target classes. We fine-tune the models using the Adam optimizer with an initial learning rate of $1 \times 10^{-4}$ and a step-decay scheduler. We apply data augmentations—including horizontal flipping, random rotation ($\pm 15^\circ$), and brightness/contrast jitter—to make the models robust to varying point-of-care capture conditions.

### B. Dataset Composition & Class Balancing
The models were trained on curated clinical datasets. Because the scalp disease dataset exhibited severe class imbalance (e.g. 48 `acne-keloidalis` images vs. only 4 `alopecia-areata` images), we implemented an inverse-class-frequency weight vector in the cross-entropy loss function. This applies a $12\times$ higher loss penalty to minority classes like *Alopecia Areata*, forcing the network to learn their distinct visual features.

### C. Gating and Safety Integration
The client-side canvas checks and server-side validation run sequentially. The modality validation check prevents false predictions on non-clinical objects. The safety filter handles boundary cases by converting low-confidence predictions into statements of health assurance, reducing clinician alarm fatigue.

---

## IX. RESULTS AND DISCUSSION

### A. Qualitative System Behavior
Evaluation of the complete pipeline confirms that inputs are correctly routed by gender, preventing cross-contamination between the Norwood and Ludwig staging scales. The disease screening model runs in parallel, allowing clinicians to obtain a complete diagnosis from a single image capture.

### B. Validation of the Safety Filter
Testing the safety filter demonstrates a significant reduction in false alarms on ambiguous inputs. Low-confidence disease classifications (confidence $<0.50$) are successfully overridden to "Healthy Scalp." This design choice prioritizes specificity, reducing unnecessary patient anxiety and follow-up referrals.

### C. Modality Validation Performance
Our modality verification filter successfully rejects non-scalp inputs:
* **PowerPoint Slides**: Rejected by the white pixel percentage check ($84.5\%$ white background).
* **Printed Packaging**: The "Zudio Sneaker Wipes" package was rejected by the central crop contour check (detecting 77 letter-like contours, which is well above the threshold of 30).
* **Valid Scalp Photos**: Successfully passed validation, recording 0 letter-like contours because natural hair stubble falls below the minimum area threshold ($\ge 70\text{px}$).

---

## X. CONCLUSION

We presented a unified, explainable deep learning framework for automated hair-loss staging and scalp pathology classification. By combining gender-branching EfficientNet-B0 networks, native Grad-CAM explainability, and a confidence-gated safety filter, the system addresses key gaps in current tools: isolated task processing, lack of gender-aware routing, absence of input validation, and lack of clinical explainability. Operational testing indicates that the system provides plausible, spatially grounded, and conservative diagnostic support suitable for clinical workflows.

---

## XI. FUTURE SCOPE

Future work will focus on:
1. **Quantitative Clinical Benchmarking**: Evaluating the system against a larger, dermatologist-annotated clinical dataset.
2. **Expanding the Disease Taxonomy**: Adding rarer scalp conditions and clinical mimics to the classifier.
3. **Longitudinal Alignment**: Implementing image registration to automatically track follicular changes across sequential patient visits.
4. **Clinical Usability Studies**: Assessing how practicing dermatologists interact with the Grad-CAM overlays and safety filters in active clinical environments.
