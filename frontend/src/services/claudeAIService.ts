import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

export class ClaudeAIService {
  static async analyzeNote(content: string): Promise<{
    summary: string;
    tags: string[];
    suggestedTitle: string;
  }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/ai/analyze`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}
