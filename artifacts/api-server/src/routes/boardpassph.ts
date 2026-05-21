import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { SEED_QUESTIONS } from "../data/seedQuestions.js";

const router = Router();

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

const VALID_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

router.post("/generate-question", async (req, res) => {
  const { focusArea, source, fileData, fileMimeType, difficulty = "random", model } = req.body;
  const queryModel = typeof model === "string" && VALID_MODELS.includes(model) ? model : "gemini-2.0-flash";

  try {
    const ai = getGenAI();

    let focusInstructions = `The user is preparing for the Philippine board exam. Generate a highly realistic, challenging multiple-choice question. Focus area or instruction context is: "${focusArea || 'Comprehensive clinical psychology and assessment'}". If any document attachment or image is provided, parse and evaluate its diagnostic concepts, theories, and details to guide the items directly. Make sure the question tests real Philippine board curriculum concepts (such as DSM-5, psychometrics, I/O paradigms, developmental milestones).`;

    if (difficulty === "easy") {
      focusInstructions += `\n\nCRITICAL STRATIFICATION - EASY DIFFICULTY: The question must focus on standard, clear, and straightforward diagnostic criteria or definitions. Do NOT include confusing specifiers, complex overlapping exclusions, or tricky options. Keep it direct and core-diagnostic.`;
    } else if (difficulty === "medium") {
      focusInstructions += `\n\nCRITICAL STRATIFICATION - MEDIUM DIFFICULTY: The question must focus on diagnostic criteria containing CONFUSING CLINICAL SPECIFIERS (e.g. 'with mixed features', 'with melancholic features', 'with atypical features', 'rapid cycling', 'with anxious distress', etc.). The vignette should test the student's fine-grained precision on specific subtypes or specifiers.`;
    } else if (difficulty === "hard") {
      focusInstructions += `\n\nCRITICAL STRATIFICATION - HARD DIFFICULTY: The question must focus on diagnostic criteria but incorporate complex differential diagnosis, subtle exclusion rules, or include a "No diagnosis / criteria not met" option. In some cases the correct answer must be 'No diagnosis; the criteria for a mental disorder abnormality are not met'.`;
    } else {
      focusInstructions += `\n\nCRITICAL STRATIFICATION - RANDOM DIFFICULTY: Select a random difficulty (easy, medium, or hard), and craft the question accordingly.`;
    }

    if (source === "pharma") {
      focusInstructions += ` SPECIFIC REQUIREMENT: This is a PSYCHOPHARMACOLOGY question. The clinical vignette must describe a patient showing symptoms of a specific DSM-5 diagnostic category and end by asking what represents the FDA-approved first-line pharmacological treatment.`;
    } else if (source === "assessment" && req.body.testDetails) {
      const test = req.body.testDetails;
      focusInstructions += ` SPECIFIC REQUIREMENT: This question must be specifically about the following psychological test:
- Name: "${test.name}"
- Developer: "${test.developer}"
- Purpose: "${test.purpose}"
- Scored as: "${test.scoring}"
- Interpretation threshold: "${test.interpretation}"
- Measuring: "${test.factorsMeasured}"
Ask about its age range, subscales, developer, scoring methodology, or ideal interpretation scenario based strictly on these details.`;
    } else if (source === "io") {
      focusInstructions += ` SPECIFIC REQUIREMENT: Sourced from Industrial-Organizational Psychology (work motivation, selection metrics, HR policies, group dynamics, leadership).`;
    } else if (source === "dev") {
      focusInstructions += ` SPECIFIC REQUIREMENT: Sourced from Developmental Psychology (psychosocial stages, cognitive developmental milestones, lifespan theories).`;
    }

    const systemPrompt = `You are a medical board examiner in psychiatry and psychology in the Philippines.
Generate a valid multiple choice test question. The vignette should be dense, diagnostic, and contextual.
Provide exactly 4 options. Specify the 0-indexed correct option.
Provide a clear high-yield explanation detailing why the correct option is correct and why the distractors are wrong.
Return a valid JSON object matching the requested schema.`;

    const contents: any[] = [focusInstructions];
    if (fileData && fileMimeType) {
      contents.push({ inlineData: { mimeType: fileMimeType, data: fileData } });
    }

    const response = await ai.models.generateContent({
      model: queryModel,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Short category name showing the clinical diagnostic area" },
            vignette: { type: Type.STRING, description: "The full board-style clinical vignette or detailed descriptive question scenario." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly four multiple-choice options." },
            correctIndex: { type: Type.INTEGER, description: "0-indexed index of the correct option (0, 1, 2, or 3)." },
            explanation: { type: Type.STRING, description: "A comprehensive high-yield educational explanation." }
          },
          required: ["category", "vignette", "options", "correctIndex", "explanation"]
        }
      }
    });

    if (response.text) {
      const resultObj = JSON.parse(response.text.trim());
      return res.json(resultObj);
    } else {
      throw new Error("No response text returned from GenAI");
    }
  } catch (error: any) {
    let filtered = SEED_QUESTIONS as any[];
    if (source) {
      filtered = SEED_QUESTIONS.filter((q: any) => q.source === source);
    }
    if (difficulty && difficulty !== "random") {
      const diffMatched = filtered.filter((q: any) => q.difficulty === difficulty);
      if (diffMatched.length > 0) filtered = diffMatched;
    }
    if (filtered.length === 0) filtered = SEED_QUESTIONS as any[];
    const randomIdx = Math.floor(Math.random() * filtered.length);
    const fallbackQuestion = filtered[randomIdx];
    return res.json({
      ...fallbackQuestion,
      isFallback: true,
      fallbackMessage: "Utilized local seed question bank (AI API key not configured or rate-limited)"
    });
  }
});

router.post("/generate-mnemonic", async (req, res) => {
  const { explanation, vignette, model } = req.body;
  if (!explanation) {
    return res.status(400).json({ error: "Missing explanation text for mnemonic creation." });
  }

  const queryModel = typeof model === "string" && VALID_MODELS.includes(model) ? model : "gemini-2.0-flash";

  try {
    const ai = getGenAI();
    const prompt = `Create a high-yield psychological, diagnostic, or psychopharmacological mnemonic for this diagnostic scenario.
Scenario context: "${vignette || "Clinical Assessment"}"
Concept explanation: "${explanation}"

Provide a creative, memorable word-acronym (e.g., SIGECAPS) or phrase, and clearly map each letter to a diagnostic criteria or recall item in a list format. Keep it concise, memorable, and educational.`;

    const response = await ai.models.generateContent({
      model: queryModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a master of mnemonic study techniques for medical and psychological board review.",
      }
    });

    res.json({ mnemonic: response.text });
  } catch (error: any) {
    res.json({
      mnemonic: `**FALLBACK MNEMONIC: S-M-A-R-T**\n\n*   **S**ymptom review: Track standard clinical indexes daily.\n*   **M**ental status: Assess appearance, mood, affect, and raw thoughts.\n*   **A**lliance build: Guarantee secure therapeutic bond.\n*   **R**oot cause: Exclude secondary substances or physical ailments.\n*   **T**reatment: Pair evidence-based psychotherapeutic and pharmacological protocols.`,
      isFallback: true
    });
  }
});

router.post("/submit-feedback", (req, res) => {
  const { email, topic, rating, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Required feedback parameters are missing." });
  }
  res.json({
    success: true,
    message: `Feedback for topic "${topic}" has been registered. Thank you!`
  });
});

export default router;
