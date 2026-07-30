import apiClient from "../config/apiClient";

export const studentOnboardingService = {
  getOnboardingState: async () => {
    const response = await apiClient.get("/student/onboarding-state/");
    return response.data;
  },

  saveStep: async (step, payload) => {
    const response = await apiClient.post("/student/save-onboarding-step/", {
      step,
      ...payload
    });
    return response.data;
  },

  completeMinimumOnboarding: async (payload) => {
    const response = await apiClient.post("/student/complete-minimum-onboarding/", payload);
    return response.data;
  },

  completeProgressiveOnboarding: async (payload) => {
    const response = await apiClient.post("/student/complete-progressive-onboarding/", payload);
    return response.data;
  }
};

export default studentOnboardingService;
