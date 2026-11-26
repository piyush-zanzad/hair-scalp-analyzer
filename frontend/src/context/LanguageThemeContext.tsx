import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'de' | 'fr';
export type Theme = 'light' | 'dark';

interface LanguageThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Sidebar / Navigation
  "Dashboard": { en: "Dashboard", es: "Panel de Control", de: "Dashboard", fr: "Tableau de bord" },
  "New Scan": { en: "New Scan", es: "Nuevo Escaneo", de: "Neuer Scan", fr: "Nouveau scan" },
  "Scan History": { en: "Scan History", es: "Historial de Escaneos", de: "Scan-Verlauf", fr: "Historique" },
  "Help Center": { en: "Help Center", es: "Centro de Ayuda", de: "Hilfe-Center", fr: "Aide" },
  "Settings": { en: "Settings", es: "Ajustes", de: "Einstellungen", fr: "Paramètres" },
  "Log Out": { en: "Log Out", es: "Cerrar Sesión", de: "Abmelden", fr: "Déconnexion" },
  
  // Dashboard
  "Clinical Dashboard": { en: "Clinical Dashboard", es: "Panel Clínico", de: "Klinisches Dashboard", fr: "Tableau de bord clinique" },
  "Conduct New Scan": { en: "Conduct New Scan", es: "Realizar Escaneo", de: "Neuen Scan durchführen", fr: "Effectuer un scan" },
  "Welcome back": { en: "Welcome back", es: "Bienvenido de nuevo", de: "Willkommen zurück", fr: "Bon retour" },
  "Total Scans Conducted": { en: "Total Scans Conducted", es: "Total de Escaneos", de: "Gesamt Scans", fr: "Total des scans" },
  "Healthy Diagnoses": { en: "Healthy Diagnoses", es: "Diagnósticos Saludables", de: "Gesunde Diagnosen", fr: "Diagnostics sains" },
  "Detected Scalp Diseases": { en: "Detected Scalp Diseases", es: "Enfermedades Detectadas", de: "Kopfhauterkrankungen", fr: "Affections détectées" },
  "Latest Diagnosis": { en: "Latest Diagnosis", es: "Último Diagnóstico", de: "Letzte Diagnose", fr: "Dernier diagnostic" },
  "Recent Scan Reports": { en: "Recent Scan Reports", es: "Informes Recientes", de: "Aktuelle Berichte", fr: "Rapports récents" },
  "View All Reports": { en: "View All Reports", es: "Ver Todos", de: "Alle Berichte anzeigen", fr: "Tous les rapports" },
  "No scan logs captured yet.": { en: "No scan logs captured yet.", es: "No hay registros de escaneo.", de: "Noch keine Scans erfasst.", fr: "Aucun scan enregistré." },
  "Scan patient now": { en: "Scan patient now", es: "Escanear paciente ahora", de: "Patienten jetzt scannen", fr: "Scanner le patient" },
  "Scan Date": { en: "Scan Date", es: "Fecha", de: "Scan-Datum", fr: "Date du scan" },
  "Hair Loss Prediction": { en: "Hair Loss Prediction", es: "Predicción Caída", de: "Haarausfall-Prognose", fr: "Perte de cheveux" },
  "Scalp Condition": { en: "Scalp Condition", es: "Condición del Cuero", de: "Kopfhaut-Zustand", fr: "État du cuir chevelu" },
  "Avg Confidence": { en: "Avg Confidence", es: "Confianza Promedio", de: "Mittleres Vertrauen", fr: "Confiance moy." },
  "Actions": { en: "Actions", es: "Acciones", de: "Aktionen", fr: "Actions" },
  "Diagnosis": { en: "Diagnosis", es: "Diagnóstico", de: "Diagnose", fr: "Diagnostic" },
  
  // Settings Page
  "System Settings": { en: "System Settings", es: "Ajustes del Sistema", de: "Systemeinstellungen", fr: "Paramètres du système" },
  "Configure diagnostic hardware interfaces and UI preferences.": { en: "Configure diagnostic hardware interfaces and UI preferences.", es: "Configure las interfaces de hardware y preferencias de la interfaz.", de: "Konfigurieren Sie Hardware-Schnittstellen und Benutzeroberfläche.", fr: "Configurez le matériel de diagnostic et les préférences de l'interface." },
  "User Interface Customization": { en: "User Interface Customization", es: "Personalización de la Interfaz", de: "Anpassung der Benutzeroberfläche", fr: "Personnalisation de l'interface" },
  "Interface Display Theme": { en: "Interface Display Theme", es: "Tema de Pantalla", de: "Anzeige-Design", fr: "Thème d'affichage" },
  "Toggle between standard medical light and high contrast dark modes.": { en: "Toggle between standard medical light and high contrast dark modes.", es: "Alternar entre modo claro médico estándar y modo oscuro de alto contraste.", de: "Wechseln Sie zwischen hellem Modus und kontrastreichem dunklen Modus.", fr: "Basculez entre le mode clair et le mode sombre à fort contraste." },
  "Language & Regional Localization": { en: "Language & Regional Localization", es: "Localización y Idioma", de: "Sprache & Lokalisierung", fr: "Langue et localisation" },
  "Display Language": { en: "Display Language", es: "Idioma de Pantalla", de: "Anzeigesprache", fr: "Langue d'affichage" },
  "Select preferred localized vocabulary translations.": { en: "Select preferred localized vocabulary translations.", es: "Seleccione las traducciones de vocabulario preferidas.", de: "Wählen Sie Ihre bevorzugte Übersetzung aus.", fr: "Sélectionnez vos préférences de traduction." },
  "Alerts & Notifications": { en: "Alerts & Notifications", es: "Alertas y Notificaciones", de: "Benachrichtigungen", fr: "Alertes et notifications" },
  "Auto-Email PDF Reports": { en: "Auto-Email PDF Reports", es: "Enviar Informes PDF", de: "PDF-Berichte automatisch senden", fr: "Envoi automatique du PDF" },
  "Real-Time Lighting & Blur Cautions": { en: "Real-Time Lighting & Blur Cautions", es: "Alertas de Calidad en Vivo", de: "Echtzeit-Qualitätswarnungen", fr: "Alertes de qualité en temps réel" },
  "Database Administration": { en: "Database Administration", es: "Administración de Base de Datos", de: "Datenbank-Verwaltung", fr: "Administration de la base de données" },
  "Export System Dump": { en: "Export System Dump", es: "Exportar Datos", de: "System-Dump exportieren", fr: "Exporter la base" },
  "Save Configuration": { en: "Save Configuration", es: "Guardar Ajustes", de: "Einstellungen speichern", fr: "Enregistrer la configuration" },
  "Light Mode": { en: "Light Mode", es: "Modo Claro", de: "Heller Modus", fr: "Mode clair" },
  "Dark Mode": { en: "Dark Mode", es: "Modo Oscuro", de: "Dunkler Modus", fr: "Mode sombre" },
  "System Clinical Backup": { en: "System Clinical Backup", es: "Copia de Seguridad Clínica", de: "Klinisches System-Backup", fr: "Sauvegarde clinique" },
  "Export structured diagnosis records, histories, and doctor comments to backup.": { en: "Export structured diagnosis records, histories, and doctor comments to backup.", es: "Exporte registros estructurados, historias y comentarios médicos a una copia de seguridad.", de: "Exportieren Sie strukturierte Befunde, Verläufe und Kommentare.", fr: "Exportez les dossiers de diagnostic, les historiques et les commentaires." },
  "Display Language Info": { en: "Display Language", es: "Idioma de Pantalla", de: "Anzeigesprache", fr: "Langue d'affichage" },
  "System configs updated.": { en: "System configs updated.", es: "Configuraciones actualizadas.", de: "Systemkonfiguration aktualisiert.", fr: "Paramètres système enregistrés." },

  // Help Center
  "Clinician Help & Reference Center": { en: "Clinician Help & Reference Center", es: "Centro de Referencia y Ayuda", de: "Hilfe- & Referenzzentrum", fr: "Centre d'aide et de référence" },
  "Access clinical documentation, model specifications, and diagnostic guides.": { en: "Access clinical documentation, model specifications, and diagnostic guides.", es: "Acceda a documentación clínica, especificaciones y guías.", de: "Zugriff auf klinische Dokumentation, Spezifikationen und Anleitungen.", fr: "Accédez à la documentation clinique, aux spécifications et aux guides." },
  "Norwood-Hamilton Hair Loss Scale": { en: "Norwood-Hamilton Hair Loss Scale", es: "Escala de Caída Norwood-Hamilton", de: "Norwood-Hamilton Haarausfall-Skala", fr: "Échelle de perte Norwood-Hamilton" },
  "Standard classification system for male pattern baldness, tracking recessions at temples and thinning at vertex.": { en: "Standard classification system for male pattern baldness, tracking recessions at temples and thinning at vertex.", es: "Sistema estándar para alopecia masculina, que mide entradas en sienes y coronilla.", de: "Standardsystem für Haarausfall bei Männern, erfasst Geheimratsecken und Tonsur.", fr: "Système de classification standard pour la calvitie masculine." },
  "Ludwig Scale (Female Hair Thinning)": { en: "Ludwig Scale (Female Hair Thinning)", es: "Escala Ludwig (Alopecia Femenina)", de: "Ludwig-Skala (Haarausfall bei Frauen)", fr: "Échelle de Ludwig (alopécie féminine)" },
  "Tracks diffuse hair thinning across the crown, preserving the frontal hairline.": { en: "Tracks diffuse hair thinning across the crown, preserving the frontal hairline.", es: "Mide el adelgazamiento difuso del cabello en la coronilla.", de: "Erfasst diffusen Haarausfall am Oberkopf bei erhaltener Stirn-Haargrenze.", fr: "Mesure la perte diffuse sur le sommet du crâne." },
  "Stage I:": { en: "Stage I:", es: "Fase I:", de: "Stufe I:", fr: "Stade I :" },
  "Stage II:": { en: "Stage II:", es: "Fase II:", de: "Stufe II:", fr: "Stade II :" },
  "Stage III:": { en: "Stage III:", es: "Fase III:", de: "Stufe III:", fr: "Stade III :" },
  "Stage III - IV:": { en: "Stage III - IV:", es: "Fase III - IV:", de: "Stufe III - IV:", fr: "Stade III - IV :" },
  "Stage V - VII:": { en: "Stage V - VII:", es: "Fase V - VII:", de: "Stufe V - VII:", fr: "Stade V - VII :" },
  "No recessions. High density hair.": { en: "No recessions. High density hair.", es: "Sin entradas. Alta densidad de cabello.", de: "Kein Haarausfall. Hohe Haardichte.", fr: "Pas de recul. Densité de cheveux élevée." },
  "Mild temporal recessions. Minor density fall.": { en: "Mild temporal recessions. Minor density fall.", es: "Entradas temporales leves. Menor densidad.", de: "Leichte Geheimratsecken. Geringer Dichteverlust.", fr: "Léger recul temporal. Faible perte de densité." },
  "Moderate thinning. Symmetrical recessions at the temples. Stage III-Vertex introduces vertex crown thinning.": { en: "Moderate thinning. Symmetrical recessions at the temples. Stage III-Vertex introduces vertex crown thinning.", es: "Entradas simétricas moderadas. El grado III-Vertex presenta adelgazamiento de coronilla.", de: "Mittlerer Haarausfall. Symmetrische Geheimratsecken. Stufe III-Vertex erfasst Tonsur.", fr: "Perte modérée. Recul temporal symétrique." },
  "Severe loss. The bridge dividing hairline and crown thins completely, leaving a horseshoe hair pattern.": { en: "Severe loss. The bridge dividing hairline and crown thins completely, leaving a horseshoe hair pattern.", es: "Pérdida severa. El cabello de la coronilla y sienes se une dejando forma de herradura.", de: "Schwerer Haarausfall. Die Brücke dünnt sich aus, Hufeisenmuster entsteht.", fr: "Perte sévère. Forme de fer à cheval restante." },
  "Mild thinning along the center part.": { en: "Mild thinning along the center part.", es: "Adelgazamiento leve a lo largo de la raya central.", de: "Leichte Ausdünnung entlang des Scheitels.", fr: "Légère perte le long de la raie." },
  "Moderate thinning. Part line widens noticeably, and hair density falls.": { en: "Moderate thinning. Part line widens noticeably, and hair density falls.", es: "Adelgazamiento moderado. La raya se ensancha y la densidad disminuye.", de: "Mittlerer Haarausfall. Scheitel merklich verbreitert, Dichte fällt.", fr: "Perte modérée. La raie s'élargit nettement." },
  "Severe central thinning. Scalp surface is highly visible across the crown.": { en: "Severe central thinning. Scalp surface is highly visible across the crown.", es: "Adelgazamiento central severo. Cuero cabelludo muy visible.", de: "Schwerer Haarausfall. Kopfhaut am Oberkopf stark sichtbar.", fr: "Perte centrale sévère. Le cuir chevelu est très visible." },
  "How does Grad-CAM work?": { en: "How does Grad-CAM work?", es: "¿Cómo funciona Grad-CAM?", de: "Wie funktioniert Grad-CAM?", fr: "Comment fonctionne Grad-CAM ?" },
  "Grad-CAM (Gradient-weighted Class Activation Mapping) uses gradients of target categories flowing into the final convolutional layers to produce a coarse localization map highlighting the regions that influenced predictions.": { en: "Grad-CAM (Gradient-weighted Class Activation Mapping) uses gradients of target categories flowing into the final convolutional layers to produce a coarse localization map highlighting the regions that influenced predictions.", es: "Grad-CAM resalta con mapas térmicos las zonas en las que la red neuronal se fijó para dar el diagnóstico.", de: "Grad-CAM visualisiert über Heatmaps die Bildbereiche, die zur Klassifizierung beigetragen haben.", fr: "Grad-CAM génère des cartes d'activation pour localiser les zones influençant la décision." },
  "Red Zones:": { en: "Red Zones:", es: "Zonas Rojas:", de: "Rote Zonen:", fr: "Zones rouges :" },
  "Yellow/Green:": { en: "Yellow/Green:", es: "Amarillo/Verde:", de: "Gelb/Grün:", fr: "Jaune/vert :" },
  "Blue Zones:": { en: "Blue Zones:", es: "Zonas Azules:", de: "Blaue Zonen:", fr: "Zones bleues :" },
  "Critical Features (follicles/plaques)": { en: "Critical Features (follicles/plaques)", es: "Características Críticas (folículos/placas)", de: "Kritische Merkmale (Follikel/Plaques)", fr: "Caractéristiques critiques" },
  "Secondary Contextual Shapes": { en: "Secondary Contextual Shapes", es: "Formas Contextuales Secundarias", de: "Sekundäre Formen", fr: "Formes secondaires" },
  "Irrelevant Features (background)": { en: "Irrelevant Features (background)", es: "Características Irrelevantes (fondo)", de: "Irrelevante Merkmale (Hintergrund)", fr: "Éléments non pertinents" },
  "Scalp Diseases & Symptoms": { en: "Scalp Diseases & Symptoms", es: "Enfermedades y Síntomas del Cuero Cabelludo", de: "Kopfhauterkrankungen & Symptome", fr: "Affections et symptômes du cuir chevelu" },

  // Scan Page
  "Conduct Hair & Scalp Scan": { en: "Conduct Hair & Scalp Scan", es: "Realizar Escaneo de Cabello y Cuero Cabelludo", de: "Haar- & Kopfhaut-Scan durchführen", fr: "Effectuer un scan capillaire" },
  "Specify patient gender profile to select Norwood (Male) vs Ludwig (Female) classification model.": { en: "Specify patient gender profile to select Norwood (Male) vs Ludwig (Female) classification model.", es: "Seleccione el género para elegir el modelo de clasificación correcto.", de: "Wählen Sie das Geschlecht für das passende Klassifikationsmodell.", fr: "Sélectionnez le profil pour choisir le modèle de classification adapté." },
  "MALE (NORWOOD)": { en: "MALE (NORWOOD)", es: "MASCULINO (NORWOOD)", de: "MÄNNLICH (NORWOOD)", fr: "HOMME (NORWOOD)" },
  "FEMALE (LUDWIG)": { en: "FEMALE (LUDWIG)", es: "FEMENINO (LUDWIG)", de: "WEIBLICH (LUDWIG)", fr: "FEMME (LUDWIG)" },
  "Running AI pipeline...": { en: "Running AI pipeline...", es: "Procesando pipeline de IA...", de: "KI-Pipeline läuft...", fr: "Traitement IA en cours..." },
  "Clinical Guidelines": { en: "Clinical Guidelines", es: "Guías Clínicas", de: "Klinische Richtlinien", fr: "Directives cliniques" },
  "Expose target area (part hair if necessary to view scalp surface).": { en: "Expose target area (part hair if necessary to view scalp surface).", es: "Exponga el área (abra el pelo si es necesario para ver el cuero cabelludo).", de: "Zielbereich freilegen (Haare bei Bedarf scheiteln).", fr: "Dégagez la zone cible (séparez les cheveux si nécessaire)." },
  "Position scalp inside the central oval boundary guide.": { en: "Position scalp inside the central oval boundary guide.", es: "Coloque el cuero cabelludo dentro de la guía ovalada central.", de: "Kopfhaut innerhalb des ovalen Rahmens positionieren.", fr: "Placez le cuir chevelu dans le repère ovale central." },
  "Ensure the Lighting HUD indicator turns": { en: "Ensure the Lighting HUD indicator turns", es: "Asegúrese de que el indicador de luz se ponga", de: "Stellen Sie sicher, dass die Lichtanzeige", fr: "Assurez-vous que l'indicateur de lumière devienne" },
  "Optimal": { en: "Optimal", es: "Óptimo", de: "Optimal", fr: "Optimal" },
  "Remain completely still during the 3-second capture timer.": { en: "Remain completely still during the 3-second capture timer.", es: "Permanezca quieto durante el temporizador de 3 segundos.", de: "Halten Sie während des 3-Sekunden-Timers still.", fr: "Restez immobile pendant le compte à rebours de 3 secondes." },
  "The image will upload and process automatically.": { en: "The image will upload and process automatically.", es: "La imagen se subirá y procesará automáticamente.", de: "Das Bild wird automatisch hochgeladen und verarbeitet.", fr: "L'image sera téléchargée et traitée automatiquement." },
  "Neural Processing HUD": { en: "Neural Processing HUD", es: "HUD de Procesamiento Neuronal", de: "Neurales Verarbeitungs-HUD", fr: "HUD de traitement neuronal" },
  "Model Pipeline:": { en: "Model Pipeline:", es: "Modelo:", de: "Modell-Pipeline:", fr: "Modèle de diagnostic :" },
  "Preprocessing:": { en: "Preprocessing:", es: "Preprocesamiento:", de: "Vorverarbeitung:", fr: "Pré-traitement :" },
  "Adaptive CLAHE": { en: "Adaptive CLAHE", es: "CLAHE Adaptativo", de: "Adaptives CLAHE", fr: "CLAHE adaptatif" },
  "Blur Threshold:": { en: "Blur Threshold:", es: "Límite de Desenfoque:", de: "Unschärfe-Schwelle:", fr: "Seuil de flou :" },
  "Laplacian (Var > 75)": { en: "Laplacian (Var > 75)", es: "Laplaciano (Var > 75)", de: "Laplace (Var > 75)", fr: "Laplacien (Var > 75)" },
  "Network Latency:": { en: "Network Latency:", es: "Latencia:", de: "Netzwerklatenz:", fr: "Latence réseau :" },
  "Local Async": { en: "Local Async", es: "Asíncrono Local", de: "Lokal Asynchron", fr: "Asynchrone local" },

  // Diagnoses translations (Fully dynamic)
  "Healthy Scalp": { en: "Healthy Scalp", es: "Cuero Cabelludo Sano", de: "Gesunde Kopfhaut", fr: "Cuir chevelu sain" },
  "Alopecia Areata": { en: "Alopecia Areata", es: "Alopecia Areata", de: "Alopecia Areata", fr: "Pelade" },
  "Acne Keloidalis": { en: "Acne Keloidalis", es: "Acné Queloideo", de: "Acne Keloidalis", fr: "Acné chéloïdienne" },
  "Trichotillomania": { en: "Trichotillomania", es: "Tricotilomanía", de: "Trichotillomanie", fr: "Trichotillomanie" },
  "Androgenic Alopecia": { en: "Androgenic Alopecia", es: "Alopecia Androgénica", de: "Androgenetische Alopezie", fr: "Alopécie androgénique" },
  "Folliculitis Decalvans": { en: "Folliculitis Decalvans", es: "Foliculitis Decalvante", de: "Folliculitis Decalvans", fr: "Folliculite décalvante" },
  "Dissecting Cellulitis": { en: "Dissecting Cellulitis", es: "Celulitis Disecante", de: "Dissecting Cellulitis", fr: "Cellulite disséquante" },
  "Pseudopelade": { en: "Pseudopelade", es: "Pseudopelada", de: "Pseudopelade", fr: "Pseudopelade" },
  "Tufted Folliculitis": { en: "Tufted Folliculitis", es: "Foliculitis en Penacho", de: "Tufted Folliculitis", fr: "Folliculite en touffes" },
  
  "Norwood Stage I": { en: "Norwood Stage I", es: "Fase Norwood I", de: "Norwood Stufe I", fr: "Stade Norwood I" },
  "Norwood Stage II": { en: "Norwood Stage II", es: "Fase Norwood II", de: "Norwood Stufe II", fr: "Stade Norwood II" },
  "Norwood Stage III": { en: "Norwood Stage III", es: "Fase Norwood III", de: "Norwood Stufe III", fr: "Stade Norwood III" },
  "Norwood Stage IV": { en: "Norwood Stage IV", es: "Fase Norwood IV", de: "Norwood Stufe IV", fr: "Stade Norwood IV" },
  "Norwood Stage V": { en: "Norwood Stage V", es: "Fase Norwood V", de: "Norwood Stufe V", fr: "Stade Norwood V" },
  "Norwood Stage VI": { en: "Norwood Stage VI", es: "Fase Norwood VI", de: "Norwood Stufe VI", fr: "Stade Norwood VI" },
  "Norwood Stage VII": { en: "Norwood Stage VII", es: "Fase Norwood VII", de: "Norwood Stufe VII", fr: "Stade Norwood VII" },
  
  "Ludwig Stage I": { en: "Ludwig Stage I", es: "Fase Ludwig I", de: "Ludwig Stufe I", fr: "Stade Ludwig I" },
  "Ludwig Stage II": { en: "Ludwig Stage II", es: "Fase Ludwig II", de: "Ludwig Stufe II", fr: "Stade Ludwig II" },
  "Ludwig Stage III": { en: "Ludwig Stage III", es: "Fase Ludwig III", de: "Ludwig Stufe III", fr: "Stade Ludwig III" },

  // Scan History Filters
  "All Conditions": { en: "All Conditions", es: "Todas las Condiciones", de: "Alle Bedingungen", fr: "Toutes les conditions" },
  "Norwood Scale (Male)": { en: "Norwood Scale (Male)", es: "Escala Norwood (Masc.)", de: "Norwood-Skala (Männer)", fr: "Échelle Norwood (Homme)" },
  "Ludwig Scale (Female)": { en: "Ludwig Scale (Female)", es: "Escala Ludwig (Fem.)", de: "Ludwig-Skala (Frauen)", fr: "Échelle Ludwig (Femme)" },
  "Healthy Hair": { en: "Healthy Hair", es: "Cabello Sano", de: "Gesundes Haar", fr: "Cheveux sains" },
  "All Diseases": { en: "All Diseases", es: "Todas las Enfermedades", de: "Alle Erkrankungen", fr: "Toutes les affections" },
  "Folliculitis / Keloidalis": { en: "Folliculitis / Keloidalis", es: "Foliculitis / Queloidea", de: "Follikulitis / Keloidalis", fr: "Folliculite / chéloïdienne" },
  "Other Conditions": { en: "Other Conditions", es: "Otras Condiciones", de: "Andere Bedingungen", fr: "Autres affections" },
  "Visual Thumbnail": { en: "Visual Thumbnail", es: "Miniatura Visual", de: "Vorschaubild", fr: "Miniature visuelle" },
  
  // Results Page
  "Download PDF Report": { en: "Download PDF Report", es: "Descargar Informe PDF", de: "PDF-Bericht herunterladen", fr: "Télécharger le rapport PDF" },
  "Clinical Recommendations": { en: "Clinical Recommendations", es: "Recomendaciones Clínicas", de: "Klinische Empfehlungen", fr: "Recommandations cliniques" },
  "Active Scan": { en: "Active Scan", es: "Escaneo Activo", de: "Aktiver Scan", fr: "Scan actif" },
  "Historical Record": { en: "Historical Record", es: "Registro Histórico", de: "Historischer Datensatz", fr: "Enregistrement historique" },
  "Compare with Historical Scans": { en: "Compare with Historical Scans", es: "Comparar con Historial", de: "Mit historischem Verlauf vergleichen", fr: "Comparer avec l'historique" },
  "Diagnostics Output": { en: "Diagnostics Output", es: "Resultados del Diagnóstico", de: "Diagnoseergebnisse", fr: "Résultats du diagnostic" },
  "Save Practitioner Comments": { en: "Save Practitioner Comments", es: "Guardar Comentarios Médicos", de: "Kommentare speichern", fr: "Enregistrer les commentaires" }
};

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'light';
  });

  useEffect(() => {
    // Apply theme class to document element on load/change
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('app-theme', t);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language] || translation['en'] || key;
    }
    return key;
  };

  return (
    <LanguageThemeContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (context === undefined) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
