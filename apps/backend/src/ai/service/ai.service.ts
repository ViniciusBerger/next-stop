// apps/backend/src/ai/ai.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async pickPlace(vibe: string, places: any[]) {
    // 1. Initialize the "Flash" model (fastest and free)
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 } // Forces JSON
    });

    const prompt = `
      You are a local outing assistant. Based on the user's vibe, pick the single best place.
      User's vibe: "${vibe}"
      Available places: ${JSON.stringify(places)}

      Respond ONLY with this JSON structure:
      {
        "id": "the_mongodb_id_of_the_place",
        "reason": "a one-sentence playful explanation"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 🛡️ Extra safety: strip markdown backticks if Gemini ignores the JSON config
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("AI returned invalid JSON:", text);
        throw new InternalServerErrorException("AI recommendation failed to parse.");
    }
  }
}