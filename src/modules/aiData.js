import { t } from '../i18n';

// Localized rule-based responses for all 4 supported languages
export const getAIResponse = (question, patientId = 'P001') => {
  if (!question || typeof question !== 'string') {
    return t('ai.responses.default');
  }

  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes('rahul') ||
    lowerQuestion.includes('ৰাহুল') ||
    lowerQuestion.includes('রাহুল') ||
    lowerQuestion.includes('राहुल')
  ) {
    return t('ai.responses.rahul');
  }

  if (
    lowerQuestion.includes('priya') ||
    lowerQuestion.includes('প্ৰিয়া') ||
    lowerQuestion.includes('প্ৰিয়া') ||
    lowerQuestion.includes('প্রিয়া') ||
    lowerQuestion.includes('प्रिया')
  ) {
    return t('ai.responses.priya');
  }

  if (
    lowerQuestion.includes('today') ||
    lowerQuestion.includes('schedule') ||
    lowerQuestion.includes('আজি') ||
    lowerQuestion.includes('সূচী') ||
    lowerQuestion.includes('আজকের') ||
    lowerQuestion.includes('दिनचर्या') ||
    lowerQuestion.includes('आज')
  ) {
    return t('ai.responses.schedule');
  }

  if (
    lowerQuestion.includes('family') ||
    lowerQuestion.includes('পৰিয়াল') ||
    lowerQuestion.includes('পৰিয়াল') ||
    lowerQuestion.includes('পরিবার') ||
    lowerQuestion.includes('परिवार')
  ) {
    return t('ai.responses.family');
  }

  if (
    lowerQuestion.includes('medicine') ||
    lowerQuestion.includes('med') ||
    lowerQuestion.includes('ঔষধ') ||
    lowerQuestion.includes('ওষুধ') ||
    lowerQuestion.includes('দবা') ||
    lowerQuestion.includes('दवा')
  ) {
    return t('ai.responses.medicine');
  }

  // Default response
  return t('ai.responses.default');
};