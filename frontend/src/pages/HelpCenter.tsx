import React from 'react';
import { HelpCircle, Microscope, AlertCircle, Info, BookOpen, Video } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const HelpCenter: React.FC = () => {
  const { t } = useLanguageTheme();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-clinical-600" /> {t("Clinician Help & Reference Center")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t("Access clinical documentation, model specifications, and diagnostic guides.")}</p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Norwood Classification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="h-5 w-5 text-clinical-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Norwood-Hamilton Hair Loss Scale")}</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t("Standard classification system for male pattern baldness, tracking recessions at temples and thinning at vertex.")}
          </p>
          <div className="space-y-3.5 text-xs">
            <div className="border-l-2 border-slate-200 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage I:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("No recessions. High density hair.")}</span>
            </div>
            <div className="border-l-2 border-clinical-400 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage III - IV:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("Moderate thinning. Symmetrical recessions at the temples. Stage III-Vertex introduces vertex crown thinning.")}</span>
            </div>
            <div className="border-l-2 border-rose-400 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage V - VII:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("Severe loss. The bridge dividing hairline and crown thins completely, leaving a horseshoe hair pattern.")}</span>
            </div>
          </div>
        </div>

        {/* Ludwig Classification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="h-5 w-5 text-clinical-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Ludwig Scale (Female Hair Thinning)")}</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t("Tracks diffuse hair thinning across the crown, preserving the frontal hairline.")}
          </p>
          <div className="space-y-3.5 text-xs">
            <div className="border-l-2 border-slate-200 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage I:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("Mild thinning along the center part.")}</span>
            </div>
            <div className="border-l-2 border-clinical-400 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage II:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("Moderate thinning. Part line widens noticeably, and hair density falls.")}</span>
            </div>
            <div className="border-l-2 border-rose-400 pl-3">
              <span className="font-bold text-slate-700 block">{t("Stage III:")}</span>
              <span className="text-slate-500 font-medium mt-0.5">{t("Severe central thinning. Scalp surface is highly visible across the crown.")}</span>
            </div>
          </div>
        </div>

        {/* Scalp Diseases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertCircle className="h-5 w-5 text-clinical-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Scalp Diseases & Symptoms")}</h3>
          </div>
          <div className="space-y-4 text-xs leading-relaxed font-medium text-slate-500 max-h-[280px] overflow-y-auto pr-2">
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Alopecia Areata")}</h4>
              <p className="mt-1">
                An autoimmune condition causing sudden, patchy hair loss (typically circular or oval bald patches) with completely smooth skin and no visible scalp inflammation.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Acne Keloidalis")}</h4>
              <p className="mt-1">
                A chronic inflammatory condition affecting hair follicles on the nape of the neck, leading to firm keloid-like papules, plaques, and scarring alopecia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Trichotillomania")}</h4>
              <p className="mt-1">
                A hair-pulling disorder characterized by the compulsive urge to pull out hair from the scalp, resulting in uneven patches of broken hairs of varying lengths.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Androgenic Alopecia")}</h4>
              <p className="mt-1">
                Hereditary progressive hair loss/thinning presenting as hairline recession in males (Norwood scale) and diffuse thinning across the crown in females (Ludwig scale).
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Folliculitis Decalvans")}</h4>
              <p className="mt-1">
                A rare, chronic neutrophilic folliculitis leading to progressive scarring hair loss (cicatricial alopecia) with follicular pustules, crusts, and tufted hairs.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Dissecting Cellulitis")}</h4>
              <p className="mt-1">
                A severe, chronic inflammatory disease of the scalp featuring painful nodules, abscesses, and sinuses discharging purulent fluid, leading to scarring alopecia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Pseudopelade")}</h4>
              <p className="mt-1">
                A rare, primary cicatricial alopecia causing slowly progressive, asymptomatic hair loss with small, irregular, smooth bald patches (often described as "footprints in the snow").
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wide">{t("Tufted Folliculitis")}</h4>
              <p className="mt-1">
                A pattern of scarring alopecia where multiple hair shafts emerge from a single dilated follicular opening (resembling a toothbrush), accompanied by inflammation and crusting.
              </p>
            </div>
          </div>
        </div>

        {/* Grad-CAM Explanation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Microscope className="h-5 w-5 text-clinical-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("How does Grad-CAM work?")}</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t("Grad-CAM (Gradient-weighted Class Activation Mapping) uses gradients of target categories flowing into the final convolutional layers to produce a coarse localization map highlighting the regions that influenced predictions.")}
          </p>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between border-b border-slate-200/50 pb-1">
              <span>{t("Red Zones:")}</span>
              <span className="text-rose-600">{t("Critical Features (follicles/plaques)")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-1">
              <span>{t("Yellow/Green:")}</span>
              <span className="text-amber-600">{t("Secondary Contextual Shapes")}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("Blue Zones:")}</span>
              <span className="text-slate-400">{t("Irrelevant Features (background)")}</span>
            </div>
          </div>
        </div>

        {/* Webcam Calibration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Video className="h-5 w-5 text-clinical-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Webcam Troubleshooting & Setup</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-xs text-slate-500 font-medium">
            <div>
              <h4 className="font-bold text-slate-700">1. Adjust Environmental Light</h4>
              <p className="mt-1 leading-relaxed">
                Ensure light source is in front of you. Avoid strong backlighting or overhead glare. Natural daylight or a bright white desk light is optimal.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700">2. Center the Scalp Surface</h4>
              <p className="mt-1 leading-relaxed">
                Place the camera close enough to make follicles visible (approx 6-10 inches). The webcam auto-focus requires high contrast.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700">3. Grant Permissions</h4>
              <p className="mt-1 leading-relaxed">
                If the camera feed is black, click the padlock icon in your browser address bar and verify that Webcam Access is set to "Allow".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
