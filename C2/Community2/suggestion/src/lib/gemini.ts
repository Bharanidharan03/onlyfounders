import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getRecommendations = async (jsonInput: any) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }] as any
  });

  const prompt = `
    TASK: 
    1. Analyze the learning-related JSON input.
    2. Use Google Search to find real-world upcoming events (hackathons, contests, workshops, exams) on platforms like Unstop, LeetCode, HackerRank, CodeChef, and Devfolio.
    
    INPUT: ${JSON.stringify(jsonInput)}
    
    RESPONSE FORMAT (STRICT JSON):
    {
      "analysis": {
        "detected_skills": ["string"],
        "intent": "string",
        "reasoning": "string"
      },
      "recommendations": [
        {
          "event_name": "string",
          "platform": "string",
          "event_type": "hackathon | contest | workshop | exam",
          "skill_focus": ["string"],
          "registration_deadline": "string",
          "registration_link": "string"
        }
      ]
    }
  `;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error: any) {
    if (error.status === 429) {
      console.warn("Gemini Search Rate Limited. Waiting 1s before fallback...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      result = await fallbackModel.generateContent(prompt + "\nIMPORTANT: Do not use the search tool. Use your internal knowledge to suggest 5-7 highly relevant upcoming event types and platforms.");
    } else {
      throw error;
    }
  }

  try {
    const responseText = result.response.text();
    return JSON.parse(responseText.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("Error parsing Gemini response:", e);
    return {
      analysis: { detected_skills: [], intent: "unknown", reasoning: "Parsing error" },
      recommendations: []
    };
  }
};
