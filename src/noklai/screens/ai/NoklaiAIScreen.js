import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNoklai } from '../../context/NoklaiContext';
import { getAIResponseAsync, getAIResponse } from '../../../modules/aiData';
import { isGeminiConfigured, sendGeminiAudioMessage } from '../../../services/GeminiService';

export default function NoklaiAIScreen({ onClose }) {
  const { isDarkMode } = useTheme();
  const { currentLanguage } = useLanguage();
  const {
    role,
    activePatientName,
    activePatientId,
    caregiverName,
    reminders,
    analyticsData,
    setAiModalVisible,
  } = useNoklai();

  const isCaregiver = role === 'caregiver';
  const pName = activePatientName || 'Patient';
  const cName = caregiverName || 'Caregiver';
  const isHindi = currentLanguage === 'hi';
  const hasGeminiKey = isGeminiConfigured();

  const defaultGreeting = isCaregiver
    ? (isHindi
        ? `नमस्ते ${cName} जी! मैं आपका नोकलाई केयर असिस्टेंट हूँ। मैं ${pName} जी की दिनचर्या, गेम प्रोग्रेस (CVI), और याददाश्त देखभाल में सहायता के लिए यहाँ हूँ।`
        : `Hello ${cName}! I am your Noklai Care Assistant. I can help analyze ${pName}'s cognitive performance (CVI), suggest stimulating cultural games, or generate a care summary.`)
    : (isHindi
        ? `नमस्ते ${pName} जी! मैं आपका नोकलाई साथी हूँ। आप आज कैसा महसूस कर रहे हैं? मैं आपको दवाइयों, दैनिक दिनचर्या, या पूर्वोत्तर की कहानियों में मदद कर सकता हूँ!`
        : `Hello ${pName}! I am your friendly Noklai companion. How are you feeling today? I can help you remember your daily routine, family stories, or play a game with you!`);

  const storageKey = `@noklai_chat_history_v2_${activePatientId || 'default'}_${role}`;

  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'ai',
      text: defaultGreeting,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const flatListRef = useRef(null);
  const mountedRef = useRef(true);
  const requestControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);

    // Voice input/output
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          'Microphone permission needed',
          'Please allow microphone access in your phone settings to use voice messages.'
        );
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  const isCurrentRequest = (requestId) =>
    mountedRef.current && requestSequenceRef.current === requestId;

  // Load chat history from persistent storage on mount
  useEffect(() => {
    let isMounted = true;
    requestSequenceRef.current += 1;
    requestControllerRef.current?.abort();
    setIsLoading(false);
    setErrorInfo(null);
    setMessages([{
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: defaultGreeting,
      timestamp: 'Just now',
    }]);

    const loadSavedChat = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          const savedMessages = Array.isArray(parsed)
            ? parsed.filter((message) => (
                message &&
                typeof message.id === 'string' &&
                (message.sender === 'user' || message.sender === 'ai') &&
                typeof message.text === 'string' &&
                message.text.trim().length > 0
              )).slice(-100)
            : [];
          if (savedMessages.length > 0) {
            setMessages(savedMessages);
          }
        }
      } catch (err) {
        console.warn('Error reading saved chat history:', err);
      }
    };
    loadSavedChat();
    return () => {
      isMounted = false;
    };
  }, [storageKey, defaultGreeting]);

  useEffect(() => () => {
    mountedRef.current = false;
    requestSequenceRef.current += 1;
    requestControllerRef.current?.abort();
  }, []);

  // Save chat history to storage on update
  const saveMessagesToStorage = async (newMessages) => {
    try {
      const boundedMessages = newMessages.slice(-100);
      await AsyncStorage.setItem(storageKey, JSON.stringify(boundedMessages));
    } catch (err) {
      console.warn('Error saving chat history:', err);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Would you like to reset this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            requestSequenceRef.current += 1;
            requestControllerRef.current?.abort();
            setIsLoading(false);
            const initial = [
              {
                id: `msg-${Date.now()}`,
                sender: 'ai',
                text: defaultGreeting,
                timestamp: 'Just now',
              },
            ];
            setMessages(initial);
            setErrorInfo(null);
            await saveMessagesToStorage(initial);
          },
        },
      ]
    );
  };

  const quickChips = isCaregiver
    ? (isHindi
        ? [
            `${pName} जी की स्थिति कैसी है?`,
            'अगला दिमागी खेल सुझाएं',
            'CVI स्कोर और रिपोर्ट बताएं',
            'आज का शेड्यूल क्या है?',
          ]
        : [
            `How is ${pName} doing?`,
            'Suggest supportive activities',
            'Explain Cognitive Vitality Index',
            'What is the schedule today?',
          ])
    : (isHindi
        ? [
            'मेरा नाम ध्रुव है',
            'मेरा नाम क्या है?',
            'मुझे थकान लग रही है',
            'मैं क्या खेल सकता हूँ?',
            'एक चुटकुला सुनाओ',
            'पूर्वोत्तर की कोई कहानी सुनाओ',
          ]
        : [
            'What is my name?',
            'I feel tired',
            'What can I play?',
            'Tell me a joke',
            'Tell me a Northeast story',
          ]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setErrorInfo(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Scroll to latest message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Prepare multi-turn conversation history for Gemini
    const priorHistory = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    // In-session learned patient name extraction across conversation
    let learnedName = null;
    for (const m of nextMessages) {
      if (m.sender === 'user') {
        const match = m.text.match(/(?:my name is|mera naam hai|mera naam|i am called|call me|main hoon)\s+([A-Za-z\u0900-\u097F\u0980-\u09FF]+)/i);
        if (match && !m.text.toLowerCase().includes('what is') && !m.text.toLowerCase().includes('kya')) {
          const raw = match[1].trim();
          learnedName = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
      }
    }

    const context = {
      patientId: activePatientId || 'P001',
      patientName: learnedName || pName,
      learnedName: learnedName,
      caregiverName: cName,
      role,
      reminders,
      analyticsData,
      language: currentLanguage,
    };

    try {
      const result = await getAIResponseAsync(query, context, priorHistory, controller.signal);
      if (!isCurrentRequest(requestId)) return;
      let replyText = '';

      if (result.success && result.text) {
        replyText = result.text;
      } else if (result.fallback) {
        replyText = result.fallback;
        // Only show the error banner for transient errors where retrying makes sense
        // (rate-limit, timeout, network drop). For API_ERROR with a good local fallback,
        // the patient already got an answer — a red banner would only confuse them.
        const retryableErrors = ['RATE_LIMIT', 'TIMEOUT', 'NETWORK_ERROR'];
        if (result.error && retryableErrors.includes(result.error)) {
          setErrorInfo({
            error: result.error,
            message: result.message || 'Noklai is using its offline response. Tap Retry to try the live AI.',
            retryQuery: query,
          });
        }
      } else {
        replyText = isCaregiver
          ? `I'm tracking ${pName}'s daily routines and memory engagement. You can ask me about game scores (CVI), schedules, or care recommendations.`
          : `I'm here with you always. Take your time, enjoy today's moments, and let me know if you need any reminders!`;
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Just now',
        source: result.source || 'gemini',
      };

            const finalMessages = [...nextMessages, aiMessage];
      setMessages(finalMessages);
      await saveMessagesToStorage(finalMessages);
      Speech.speak(replyText, { language: isHindi ? 'hi-IN' : 'en-IN' });
    } catch (err) {
      if (!isCurrentRequest(requestId) || err?.name === 'AbortError') return;
      console.warn('AI send exception:', err);
      setErrorInfo({
        error: 'EXCEPTION',
        message: 'Could not connect to Noklai AI. Please try again.',
        retryQuery: query,
      });
    } finally {
      if (isCurrentRequest(requestId)) {
        requestControllerRef.current = null;
        setIsLoading(false);
        setTimeout(() => {
          if (mountedRef.current) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    }
  };

  const startVoiceRecording = async () => {
    if (isLoading || recorderState.isRecording) return;
    try {
      Speech.stop();
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.warn('Could not start recording:', err);
      Alert.alert('Recording error', 'Could not access the microphone. Please try again.');
    }
  };

  const stopVoiceRecordingAndSend = async () => {
    if (!recorderState.isRecording) return;

    let uri;
    try {
      await audioRecorder.stop();
      uri = audioRecorder.uri;
    } catch (err) {
      console.warn('Could not stop recording:', err);
      return;
    }
    if (!uri) return;

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setErrorInfo(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: '🎤 (Voice message)',
      timestamp: 'Just now',
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const file = new File(uri);
      const audioBase64 = await file.base64();

      const priorHistory = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const context = {
        patientId: activePatientId || 'P001',
        patientName: pName,
        caregiverName: cName,
        role,
        reminders,
        analyticsData,
        language: currentLanguage,
      };

      const result = await sendGeminiAudioMessage({
        audioBase64,
        mimeType: 'audio/m4a',
        history: priorHistory,
        context,
        signal: controller.signal,
      });
      if (!isCurrentRequest(requestId)) return;

      const replyText = result.success && result.text
        ? result.text
        : (result.message || "Sorry, I couldn't understand that voice message. Please try again or type instead.");

      if (!result.success) {
        setErrorInfo({ error: result.error || 'VOICE_ERROR', message: replyText, retryQuery: null });
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Just now',
        source: result.success ? 'gemini' : 'voice_error',
      };
      const finalMessages = [...nextMessages, aiMessage];
      setMessages(finalMessages);
      await saveMessagesToStorage(finalMessages);
      Speech.speak(replyText, { language: isHindi ? 'hi-IN' : 'en-IN' });
    } catch (err) {
      if (!isCurrentRequest(requestId) || err?.name === 'AbortError') return;
      console.warn('Voice send exception:', err);
      setErrorInfo({
        error: 'EXCEPTION',
        message: 'Could not send your voice message. Please try again.',
        retryQuery: null,
      });
    } finally {
      if (isCurrentRequest(requestId)) {
        requestControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setAiModalVisible(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDarkMode
            ? noklaiTheme.colors.backgroundDark
            : noklaiTheme.colors.background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'
        }
      >
        {/* Top Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: isDarkMode
                ? noklaiTheme.colors.cardBackgroundDark
                : noklaiTheme.colors.cardBackground,
              borderBottomColor: isDarkMode
                ? noklaiTheme.colors.borderDark
                : noklaiTheme.colors.border,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.sparkleCircle}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
                ]}
              >
                Noklai AI Assistant
              </Text>
              <Text style={styles.headerSub}>
                {isCaregiver ? 'Caregiver Companion' : 'Friendly Memory Companion'} • {hasGeminiKey ? 'Gemini 2.0 Live' : 'Offline Mode'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleClearChat}
              style={styles.headerActionBtn}
              accessibilityLabel="Reset conversation"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={isDarkMode ? '#9CA3AF' : '#656F7D'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close AI Assistant"
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={isDarkMode ? '#9CA3AF' : '#656F7D'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Banner with Retry */}
        {errorInfo && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.errorText} numberOfLines={2}>
              {errorInfo.message}
            </Text>
            {errorInfo.retryQuery ? (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => handleSend(errorInfo.retryQuery)}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Quick Chips Row */}
        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickChips}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSend(item)}
                disabled={isLoading}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#28243D' : '#F3E8FF',
                    borderColor: isDarkMode ? '#47396B' : '#E9D5FF',
                    opacity: isLoading ? 0.6 : 1,
                  },
                ]}
              >
                <Ionicons name="sparkles-outline" size={13} color="#7E22CE" style={{ marginRight: 6 }} />
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isAi = item.sender === 'ai';
            return (
              <View
                style={[
                  styles.messageRow,
                  isAi ? styles.aiMessageRow : styles.userMessageRow,
                ]}
              >
                {isAi && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isAi
                      ? [
                          styles.aiBubble,
                          {
                            backgroundColor: isDarkMode ? '#1E2430' : '#FFFFFF',
                            borderColor: isDarkMode ? '#2B3545' : '#E5E7EB',
                          },
                        ]
                      : [
                          styles.userBubble,
                          {
                            backgroundColor: isCaregiver
                              ? noklaiTheme.colors.primary
                              : noklaiTheme.colors.patientGreen,
                          },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: isAi
                          ? isDarkMode
                            ? noklaiTheme.colors.textPrimaryDark
                            : noklaiTheme.colors.textPrimary
                          : '#FFFFFF',
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isLoading ? (
              <View style={[styles.messageRow, styles.aiMessageRow, { opacity: 0.9, marginTop: 4 }]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.bubble,
                    styles.aiBubble,
                    {
                      backgroundColor: isDarkMode ? '#1E2430' : '#FFFFFF',
                      borderColor: isDarkMode ? '#2B3545' : '#E5E7EB',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color={noklaiTheme.colors.primary} style={{ marginRight: 10 }} />
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: isDarkMode ? '#9CA3AF' : '#656F7D',
                        fontStyle: 'italic',
                        fontSize: 13,
                      },
                    ]}
                  >
                    {isHindi ? 'नोकलाई सोच रहे हैं...' : 'Noklai is thinking...'}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDarkMode
                ? noklaiTheme.colors.cardBackgroundDark
                : noklaiTheme.colors.cardBackground,
              borderColor: isDarkMode
                ? noklaiTheme.colors.borderDark
                : noklaiTheme.colors.border,
            },
          ]}
        >
          <TextInput
            placeholder={isCaregiver ? 'Ask about Aaji or request suggestions...' : 'Talk with your memory helper...'}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            maxLength={4000}
            editable={!isLoading}
            style={[
              styles.input,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
               onSubmitEditing={() => handleSend(input)}
          />

          <TouchableOpacity
            onPressIn={startVoiceRecording}
            onPressOut={stopVoiceRecordingAndSend}
            disabled={isLoading}
            style={[
              styles.micButton,
              {
                backgroundColor: recorderState.isRecording
                  ? '#DC2626'
                  : isCaregiver
                    ? noklaiTheme.colors.primary
                    : noklaiTheme.colors.patientGreen,
              },
            ]}
          >
            <Ionicons name={recorderState.isRecording ? 'mic' : 'mic-outline'} size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim() && !isLoading
                  ? isCaregiver
                    ? noklaiTheme.colors.primary
                    : noklaiTheme.colors.patientGreen
                  : '#CBD5E1',
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: noklaiTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    color: '#656F7D',
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
  },
  chipsContainer: {
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: noklaiTheme.radii.full,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E22CE',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: noklaiTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: noklaiTheme.radii.xl,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 12,
    borderRadius: noklaiTheme.radii.full,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 6,
    borderRadius: noklaiTheme.radii.full,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: noklaiTheme.radii.md,
    marginLeft: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
