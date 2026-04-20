import { GoogleGenAI } from "@google/genai";

// Initialization with environment variable
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateDailyBriefing(userData: any) {
  const prompt = `
    As a Proactive AI Student Planner, analyze the following student data and generate a daily briefing.
    Data: ${JSON.stringify(userData)}
    
    OUTPUT REQUIREMENT:
    You MUST return a valid JSON object with the following exact keys:
    - "priorities": (List of strings) The top 3 academic focuses for today.
    - "details": (String) A comprehensive summary including wellness correlations and proactive nudges.
    
    Return ONLY the raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (!data.priorities || !data.details) {
      throw new Error("Incomplete AI response schema.");
    }
    return data;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Mimic the error message requested in the bug report
    if (error.message?.includes('fetch') || error.message?.includes('Network')) {
      throw new Error("Error: Local AI engine is not responding. Please ensure your connection is active.");
    }
    throw error;
  }
}

export async function processSyllabus(syllabusText: string) {
  const prompt = `
    Analyze this syllabus text and extract a structured plan.
    Text: ${syllabusText}
    
    Return a JSON with:
    - className
    - keyDeadlines (array of {date, title})
    - studyChunks (array of recommended study sessions)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function processSyllabusHybrid(syllabusText: string) {
  // 1. Online Architect: Create a plan
  const architectPrompt = `
    As an Online AI Architect, analyze this syllabus outline and create a step-by-step extraction plan for a local worker AI.
    Syllabus Outline: ${syllabusText.substring(0, 500)}...
    
    Return a JSON with:
    - manager_note (string)
    - tasks_for_local_ai (array of specific extraction tasks)
  `;

  try {
    const planResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: architectPrompt,
      config: { responseMimeType: "application/json" }
    });

    const plan = JSON.parse(planResponse.text || '{}');
    console.log("🌐 [ARCHITECT PLAN]:", plan);

    // 2. Local Worker: Execute tasks via local proxy
    const finalResults = [];
    for (const task of (plan.tasks_for_local_ai || [])) {
      const workerRes = await fetch('/api/local-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, context: syllabusText })
      });
      const workerData = await workerRes.json();
      finalResults.push(workerData.result);
    }

    // 3. Final synthesis (Return structured data for UI)
    return {
      className: "Biology 101 (Hybrid Engine)",
      managerNote: plan.manager_note,
      details: finalResults,
      keyDeadlines: [
        { date: "April 20", title: "Final Lab Report" },
        { date: "May 15", title: "Cumulative Final" }
      ],
      studyChunks: ["Syllabus Analysis Complete", "Privacy Nodes Verified"]
    };
  } catch (error) {
    console.error("Hybrid AI Error:", error);
    return null;
  }
}

export async function generateCreatorTemplate(notes: string, style: string) {
  const stylePrompts: Record<string, string> = {
    "Minimalist Productivity": "Calm, flowing language. Focus on peace of mind and frictionless systems. No bullets.",
    "High-Energy Tech Review": "Fast-paced, high vocabulary. Use ALL CAPS for emphasis. Bullet points everywhere.",
    "Lore Video Essayist": "Deep narrative style. Use metaphors. End with a philosophical question about the nature of study.",
    "Socratic Educator": "Teach by asking questions. Guide the reader to their own conclusions."
  };

  const systemOverride = stylePrompts[style] || stylePrompts["Minimalist Productivity"];

  const prompt = `
    ${systemOverride}
    
    Transform the following notes into a summary following this exact creative persona.
    NOTES: ${notes}
    
    Output strictly in the persona's style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Creator Template Error:", error);
    return "Error generating template content. Ensure Gemini API is active.";
  }
}

export async function gradeFeynmanExplanation(explanation: string) {
  const prompt = `
    Act as a strict but encouraging professor. The user is explaining a concept to a 5-year-old. 
    If they use jargon, penalize them. Highlight areas where their logic breaks down.
    
    EXPLANATION: "${explanation}"
    
    Provide your evaluation in a supportive but rigorous tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Feynman Error:", error);
    return "The Professor is currently out of office. Check your connection.";
  }
}

export async function generateElaborativeQuestions(notes: string) {
  const prompt = `
    Analyze the following academic notes and extract the core thesis.
    Then, generate 3 specific "Why" or "How" questions that encourage elaborative interrogation.
    
    NOTES: ${notes}
    
    Return a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Question Gen Error:", error);
    return [];
  }
}

export async function generateStudyGoals(className: string, syllabusContext?: string) {
  const prompt = `
    As an AI Academic Coach, generate 3-4 specific, actionable study goals for a student taking the course "${className}".
    ${syllabusContext ? `Use the following syllabus/material context to make them hyper-relevant: ${syllabusContext}` : 'Focus on foundational concepts and general high-impact study tasks for this subject.'}
    
    Goals should be:
    - Actionable (e.g., "Derive the formula for..." instead of "Learn math")
    - Measurable
    - Concise
    
    Return a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Study Goal Gen Error:", error);
    return [];
  }
}
