import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { aiAPI, ChatMessage } from '../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Quick suggestion prompts
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  'How much did I spend this month?',
  'What\'s my highest expense category?',
  'Give me tips to save money',
  'Analyze my recent spending habits',
  'How can I reduce food expenses?',
  'Create a budget for next month',
];

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator dots
// ─────────────────────────────────────────────────────────────────────────────
function TypingDot({ delay }: { delay: number }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.textMuted, marginLeft: delay > 0 ? 4 : 0 },
        style,
      ]}
    />
  );
}

function TypingIndicator() {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.card }]}>
      <View style={styles.dotsRow}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[
        styles.messageBubble,
        isUser
          ? styles.userBubble
          : [styles.aiBubble, { backgroundColor: colors.card }],
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.avatarGrad}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </LinearGradient>
        </View>
      )}
      <View style={styles.bubbleBody}>
        {!isUser && (
          <Text style={[styles.senderName, { color: COLORS.primary }]}>FinBot</Text>
        )}
        <Text
          style={[
            styles.messageText,
            { color: isUser ? '#fff' : colors.text },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatbotScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatbotScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm **FinBot**, your AI financial assistant. I can help you analyze your expenses, suggest savings tips, create budgets, and answer any financial questions. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput('');

      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setTyping(true);
      scrollToBottom();

      try {
        // Backend ChatRequest: { message, sessionId } — sessionId keeps
        // conversation context across requests.
        const res = await aiAPI.chat({ message: trimmed, sessionId });
        // Response is wrapped: { success, message, data: { sessionId, role, content } }
        const d = res.data?.data ?? res.data;
        if (d?.sessionId) setSessionId(String(d.sessionId));
        const botMsg: ChatMessage = {
          role: 'assistant',
          content: d?.content ?? 'Sorry, I could not generate a response. Please try again.',
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: `⚠️ ${err.message ?? 'Something went wrong. Please try again.'}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setTyping(false);
        scrollToBottom();
      }
    },
    [messages, typing, scrollToBottom, sessionId]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerLeft}>
          <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']} style={styles.botAvatar}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>FinBot</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>AI Financial Assistant</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setMessages([
              {
                role: 'assistant',
                content:
                  "👋 Hi again! I'm FinBot. How can I help you with your finances today?",
              },
            ]);
            setSessionId(null); // start a fresh conversation
          }}
          style={styles.clearBtn}
        >
          <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={
            typing ? (
              <View style={styles.typingContainer}>
                <TypingIndicator />
              </View>
            ) : null
          }
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Quick suggestions (shown when only intro message) ── */}
        {messages.length <= 1 && !typing && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>
              Quick questions:
            </Text>
            <FlatList
              horizontal
              data={QUICK_SUGGESTIONS}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => sendMessage(item)}
                  style={[
                    styles.suggestionChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ── Input bar ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Ask FinBot anything…"
              placeholderTextColor={colors.placeholder}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
          </View>
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                input.trim() && !typing
                  ? [COLORS.primary, COLORS.secondary]
                  : ['#CBD5E1', '#CBD5E1']
              }
              style={styles.sendBtn}
            >
              {typing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' },
  onlineText: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 18,
    padding: 12,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    flexDirection: 'row',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    gap: 8,
  },
  aiAvatar: { flexShrink: 0, marginTop: 2 },
  avatarGrad: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleBody: { flex: 1, gap: 2 },
  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  messageText: { fontSize: 14, lineHeight: 21 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  suggestionsContainer: { paddingBottom: 8, paddingTop: 4 },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  suggestionsList: { paddingHorizontal: 16, gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 220,
  },
  suggestionText: { fontSize: 12, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  textInput: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
