import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { getAIResponseAsync, getAIResponse } from '../modules/aiData';

export default function AIScreen() {
  const { theme } = useTheme();
  const { patientId, patientName, caregiverName } = usePatient?.() || {};
  const { currentLanguage } = useLanguage?.() || {};

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Assistant. How can I help you today?',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const priorHistory = messages.map(m => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const result = await getAIResponseAsync(
        userMessage.text,
        {
          patientId: patientId || 'P001',
          patientName,
          caregiverName,
          language: currentLanguage,
        },
        priorHistory
      );

      const replyText = result.success && result.text
        ? result.text
        : result.fallback || 'I am here with you. How can I assist you?';

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I am here with you. How can I assist you?',
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.aiRow,
        ]}
      >
        {!isUser && (
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser ? '#FFFFFF' : theme.text,
              },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* HEADER */}
        <View
          style={[
            styles.header,
            { borderBottomColor: theme.cardBorder || '#E2E8F0' },
          ]}
        >
          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View>
            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              AI Assistant
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.subText },
              ]}
            >
              Your personal memory assistant
            </Text>
          </View>
        </View>

        {/* CHAT */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor:
                theme.cardBackground || '#FFFFFF',
              borderColor:
                theme.cardBorder || '#E2E8F0',
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={theme.subText || '#94A3B8'}
            multiline
            style={[
              styles.input,
              { color: theme.text },
            ]}
          />

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim()
                  ? '#16A34A'
                  : '#CBD5E1',
              },
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  chatContainer: {
    padding: 18,
    paddingBottom: 20,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  aiRow: {
    justifyContent: 'flex-start',
  },

  aiIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: '#A7E87A',
    borderBottomRightRadius: 5,
  },

  aiBubble: {
    backgroundColor: '#E8F0F7',
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 12,
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 16,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});