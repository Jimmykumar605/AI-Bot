import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GEMINI_API_KEY } from '../Config/gemini';

interface ChatbotModalProps {
  visible: boolean;
}

interface Message {
  text: string;
  isUser: boolean;
}

const initialMessages: Message[] = [
  { text: "Hi there! I'm your AI assistant. How can I help you today?", isUser: false },
];

const client = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export default function ChatbotModal({ visible }: ChatbotModalProps) {
  const [userMessage, setUserMessage] = useState('');
  const [messagesList, setMessagesList] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (userMessage.trim()) {
      setMessagesList(prev => [...prev, { text: userMessage, isUser: true }]);
      setUserMessage('');
      setIsLoading(true);

      try {
        const response = await client.models.generateContent({
          model: 'gemini-1.5-flash-latest',
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
        });

        const textResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          setMessagesList(prev => [...prev, { text: textResponse, isUser: false }]);
        } else {
          setMessagesList(prev => [...prev, { text: 'No valid response from AI.', isUser: false }]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessagesList(prev => [...prev, { text: 'Something went wrong. Try again.', isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messagesList]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.modalContent, isDarkMode && { backgroundColor: '#000' }]}>
        <View style={[styles.header, isDarkMode && { backgroundColor: '#000' }]}>
          <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>AI BOT</Text>
          <TouchableOpacity onPress={() => setIsDarkMode(prev => !prev)} style={styles.toggleButton}>
          <Text style={{ fontSize: 24 }}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>

          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {messagesList.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.botMessage,
                  isDarkMode && {
                    backgroundColor: message.isUser ? '#444' : '#1a1a1a',
                  },
                ]}
              >
                <Text style={[styles.messageText, isDarkMode && { color: '#fff' }]}>{message.text}</Text>
              </View>
            ))}

            {isLoading && (
              <View
                style={[
                  styles.messageContainer,
                  styles.botMessage,
                  isDarkMode && { backgroundColor: '#1a1a1a' },
                ]}
              >
                <Text style={[styles.messageText, isDarkMode && { color: '#fff' }]}>...</Text>
              </View>
            )}

          </ScrollView>

          <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#1a1a1a' }]}>
            <TextInput
              style={[
                styles.input,
                isDarkMode && {
                  backgroundColor: '#333',
                  color: '#fff',
                },
              ]}
              placeholder="Type your message..."
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              value={userMessage}
              onChangeText={setUserMessage}
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (isLoading || !userMessage.trim()) && styles.disabledButton,
              ]}
              onPress={handleSendMessage}
              disabled={isLoading || !userMessage.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#fff' : '#000'} />
              ) : (
                <Text style={{ fontSize: 20, color: isDarkMode ? '#fff' : '#000' }}>🚀</Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
