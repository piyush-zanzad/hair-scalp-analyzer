# Dataset Requirements: Hair Loss & Scalp Disease Models

To train the classification models for hair loss stages (Norwood/Ludwig) and scalp diseases (Dandruff/Psoriasis) using the provided training pipeline (`models/train.py`), structure your training datasets according to the guidelines below.

---

## 1. Directory Structure

Organize image files into categorized folders representing target classification labels.

```
dataset/
├── hair_loss/
│   ├── train/
│   │   ├── healthy/
│   │   ├── norwood_1/
│   │   ├── norwood_2/
│   │   ├── norwood_3/
│   │   ├── norwood_4/
│   │   ├── norwood_5/
│   │   ├── norwood_6/
│   │   ├── norwood_7/
│   │   ├── ludwig_1/
│   │   ├── ludwig_2/
│   │   └── ludwig_3/
│   └── validation/
│       ├── healthy/
│       └── [Norwood/Ludwig folders...]
└── scalp_disease/
    ├── train/
    │   ├── healthy/
    │   ├── dandruff/
    │   └── psoriasis/
    └── validation/
        ├── healthy/
        ├── dandruff/
        └── psoriasis/
```

---

## 2. Image Acquisition Guidelines

To maintain clinical reliability, source training images under standard parameters:

1. **Resolution**: Minimum resolution of $640 \times 480$ pixels.
2. **Magnification**: Macro or close-up scalp images (focusing directly on hair follicles or skin surface plaques).
3. **Lighting**: Consistent white balanced illumination (daylight or neutral 5000K-6000K clinical ring-light source). Avoid extreme shadows.
4. **Orientation**: 
   - **Norwood Stages**: Frontal hairline crops showing temporal recessions and top vertex views showing crown density.
   - **Ludwig Stages**: Crown views showing part lines.
   - **Scalp Diseases**: Close-up vertical views showing skin texture.

---

## 3. Data Augmentation Specs

The `models/train.py` training script applies the following transforms on training data:

* **Resize**: Normalized to $224 \times 224$ pixels (standard ImageNet resolution).
* **Random Horizontal Flip**: $p = 0.5$ (simulates mirror reflections from different webcams).
* **Random Rotation**: Up to $\pm 15^\circ$ (simulates varying patient head tilts).
* **Color Jitter**: Brightness ($\pm 15\%$), Contrast ($\pm 15\%$), and Saturation ($\pm 10\%$) adjustments to normalize webcam color shifts.
* **Standard Normalization**: Zero-centered using ImageNet channel means:
  - $\mu = [0.485, 0.456, 0.406]$
  - $\sigma = [0.229, 0.224, 0.225]$

---

## 4. Class Mappings

Verify your dataset folder indices align with model class sequences:

### Hair Loss Categories (11 Classes)
0. Healthy Hair
1. Norwood Stage I
2. Norwood Stage II
3. Norwood Stage III
4. Norwood Stage IV
5. Norwood Stage V
6. Norwood Stage VI
7. Norwood Stage VII
8. Ludwig Stage I
9. Ludwig Stage II
10. Ludwig Stage III

### Scalp Disease Categories (3 Classes)
0. Healthy Scalp
1. Dandruff
2. Psoriasis
