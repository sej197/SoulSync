import axios from "axios";
import { API_BASE_URL } from './apiConfig';
import { attachToken } from './tokenManager';

const surveyApi = axios.create({
  baseURL: `${API_BASE_URL}/api/survey`,
  withCredentials: true,
});
surveyApi.interceptors.request.use(attachToken);

export const submitSurvey = async (surveyData) => {
  const res = await surveyApi.post("/submit", surveyData);
  return res.data;
};

export const getSurveyStatus = async () => {
  const res = await surveyApi.get("/status");
  return res.data;
};

export default surveyApi;
