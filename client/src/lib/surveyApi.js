import axios from "axios";

const surveyApi = axios.create({
  baseURL: `/api/survey`,
  withCredentials: true,
});

export const submitSurvey = async (surveyData) => {
  const res = await surveyApi.post("/submit", surveyData);
  return res.data;
};

export const getSurveyStatus = async () => {
  const res = await surveyApi.get("/status");
  return res.data;
};

export default surveyApi;
