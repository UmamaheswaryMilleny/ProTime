import { ProTimeBackend } from "../../../api/instance";
import { API_ROUTES } from "../../../shared/constants/constants.routes";

export interface ProBuddyChatResponse {
  success: boolean;
  response: string;
}

export const proBuddyApi = {
  chat: async (prompt: string) => {
    const response = await ProTimeBackend.post<ProBuddyChatResponse>(
      API_ROUTES.PROBUDDY_CHAT,
      { prompt }
    );
    return response.data;
  },
};
