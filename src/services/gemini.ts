import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeWeldingProcess = async (prompt: string) => {
  const model = "gemini-3.1-flash-lite-preview";
  
  const systemInstruction = `
    你是一位资深的焊接工艺专家（Welding Process Specialist）。
    你的任务是为用户提供专业的焊接建议、参数设置、缺陷分析和材料选择指导。
    
    要求：
    1. 语气专业、严谨且富有科技感。
    2. 使用 Markdown 格式输出，包含标题、列表和加粗。
    3. 如果涉及参数，请给出具体的数值范围（如电流、电压、焊接速度）。
    4. 强调安全规范。
    
    回答结构：
    - 工艺概述
    - 核心参数建议
    - 质量控制要点
    - 安全警示
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，分析过程中遇到技术故障。请检查网络连接或稍后重试。";
  }
};
