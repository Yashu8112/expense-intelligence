import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../theme/colors';
import { Insight } from '../services/api';
import { format, parseISO } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  WARNING: { icon: 'warning-outline', color: COLORS.warning },
  TIP: { icon: 'bulb-outline', color: COLORS.secondary },
  SAVING: { icon: 'trending-down-outline', color: COLORS.success },
  ALERT: { icon: 'alert-circle-outline', color: COLORS.danger },
  INFO: { icon: 'information-circle-outline', color: COLORS.primary },
};

const DEFAULT_TYPE = { icon: 'information-circle-outline' as const, color: COLORS.primary };

interface InsightCardProps {
  insight: Insight;
  style?: ViewStyle;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, style }) => {
  const { colors } = useTheme();
  const typeKey = (insight.insightType ?? insight.type ?? 'TIP').toUpperCase();
  const { icon, color } = TYPE_CONFIG[typeKey] ?? DEFAULT_TYPE;

  let dateStr = '';
  try {
    if (insight.createdAt) {
      dateStr = format(parseISO(insight.createdAt), 'dd MMM');
    }
  } catch {
    dateStr = '';
  }

  const descText = insight.content ?? insight.description ?? '';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderLeftColor: color, shadowColor: colors.shadow },
        style,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {insight.title}
          </Text>
          {dateStr ? (
            <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>
          ) : null}
        </View>
        {descText ? (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {descText}
          </Text>
        ) : null}
        <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.typeText, { color }]}>{typeKey}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    gap: 12,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 0,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default InsightCard;
