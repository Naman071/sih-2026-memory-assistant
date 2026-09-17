import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noklaiTheme } from '../../theme/noklaiTheme';
import { useTheme } from '../../../context/ThemeContext';
import { useNoklai } from '../../context/NoklaiContext';
import { getAIResponse } from '../../../modules/aiData';

export default function NoklaiAIScreen({ onClose }) {
  const { isDarkMode } = useTheme();
  const { role, activePatientName, activePatientId, caregiverName, reminders, setAiModalVisible } = useNoklai();

  const isCaregiver = role === 'caregiver';
  const pName = activePatientName || 'Patient';
  const cName = caregiverName || 'Caregiver';

  const defaultGreeting = isCaregiver
    ? `Hello ${cName}! I am your Noklai Care Assistant. I can help analyze ${pName}'s cognitive performance, suggest stimulating cultural games, or generate a care summary.`
    : `Hello ${pName}! I am your friendly Noklai companion. How are you feeling today? I can help you remember your daily routine, family stories, or play a game with you!`;

  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'ai',
      text: defaultGreeting,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');

  const quickChips = isCaregiver
    ? [
        `How is ${pName} doing?`,
        'Suggest next brain exercise',
        'Summarize this week\'s progress',
        'Explain Cognitive Vitality Index',
      ]
    : [
        'What is my schedule today?',
        'Tell me a Northeast story',
        'Remind me about my medicine',
        'Who is visiting me today?',
      ];

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Generate response using existing aiData module + smart conversational logic
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('schedule') || lower.includes('routine') || lower.includes('today')) {
        const pending = (reminders || []).filter((s) => !s.done);
        if (pending.length > 0) {
          reply = `Today's upcoming tasks for ${pName}:\n• ` +
            pending.map((p) => `${p.time}: ${p.title}`).join('\n• ') +
            '\n\nWould you like me to set an audio reminder?';
        } else {
          reply = (reminders || []).length > 0
            ? `All scheduled activities for today are completed! Great job maintaining consistency.`
            : `No reminders have been scheduled yet. You can add one anytime in the "My Day & Reminders" section.`;
        }
      } else if (lower.includes('suggest') || lower.includes('game') || lower.includes('exercise')) {
        reply = `Suh Tah Lam (Bamboo Rhythm) is recommended! It stimulates motor-auditory recall and supports pattern memory with joyful cultural music.`;
      } else if (lower.includes('story') || lower.includes('folk')) {
        reply = `Here is a comforting memory from the hills: "Once during the Chapchar Kut spring festival, elders gathered under the great banyan tree while the young danced the bamboo rhythm with joyful songs..." Would you like to play the Story Memory game?`;
      } else if (lower.includes('vitality') || lower.includes('progress') || lower.includes('how is') || lower.includes('doing')) {
        reply = `${pName}'s cognitive sessions are actively logged. Accuracy and Vitality Index update dynamically after each completed exercise!`;
      } else {
        try {
          reply = getAIResponse(query, activePatientId || 'P001');
        } catch (e) {
          reply = isCaregiver
            ? `I'm tracking ${pName}'s daily routines and memory engagement. You can ask me about game scores, schedules, or care recommendations.`
            : `I'm here with you always. Take your time, enjoy today's moments, and let me know if you need any reminders!`;
        }
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 600);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                {isCaregiver ? 'Caregiver Companion & Analytics' : 'Friendly Memory Companion'}
              </Text>
            </View>
          </View>

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
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#28243D' : '#F3E8FF',
                    borderColor: isDarkMode ? '#47396B' : '#E9D5FF',
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
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
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
            style={[
              styles.input,
              { color: isDarkMode ? noklaiTheme.colors.textPrimaryDark : noklaiTheme.colors.textPrimary },
            ]}
            onSubmitEditing={() => handleSend(input)}
          />

          <TouchableOpacity
            onPress={() => handleSend(input)}
            disabled={!input.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim()
                  ? isCaregiver
                    ? noklaiTheme.colors.primary
                    : noklaiTheme.colors.patientGreen
                  : '#CBD5E1',
              },
            ]}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
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
});

