import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../theme/colors';
import { Expense } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PAYMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CARD: 'card-outline',
  CASH: 'cash-outline',
  UPI: 'phone-portrait-outline',
  BANK_TRANSFER: 'business-outline',
  OTHER: 'ellipsis-horizontal-outline',
};

const PAYMENT_COLORS: Record<string, string> = {
  CARD: COLORS.primary,
  CASH: COLORS.success,
  UPI: COLORS.secondary,
  BANK_TRANSFER: COLORS.warning,
  OTHER: COLORS.danger,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface ExpenseItemProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress, onDelete }) => {
  const { colors, isDark } = useTheme();

  const paymentColor = PAYMENT_COLORS[expense.paymentMethod] ?? COLORS.primary;
  const paymentIcon = PAYMENT_ICONS[expense.paymentMethod] ?? 'ellipsis-horizontal-outline';

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  let dateStr = '';
  const rawDate = expense.expenseDate ?? expense.date;
  try {
    if (rawDate) {
      dateStr = format(parseISO(rawDate), 'dd MMM yyyy');
    }
  } catch {
    dateStr = rawDate ?? '';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.container, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: paymentColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          {/* Icon */}
          <View style={[styles.iconBox, { backgroundColor: paymentColor + '18' }]}>
            <Ionicons name={paymentIcon} size={18} color={paymentColor} />
          </View>

          {/* Title & category */}
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {expense.title}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {expense.category?.name ?? 'Uncategorized'} • {dateStr}
            </Text>
          </View>

          {/* Amount */}
          <View style={styles.amountArea}>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatINR(expense.amount)}
            </Text>
            {expense.recurring && (
              <View style={[styles.recurringBadge, { backgroundColor: COLORS.secondary + '20' }]}>
                <Ionicons name="repeat" size={10} color={COLORS.secondary} />
                <Text style={[styles.recurringText, { color: COLORS.secondary }]}>Recurring</Text>
              </View>
            )}
          </View>
        </View>

        {expense.merchant ? (
          <Text style={[styles.merchant, { color: colors.textMuted }]} numberOfLines={1}>
            <Ionicons name="storefront-outline" size={11} color={colors.textMuted} /> {expense.merchant}
          </Text>
        ) : null}
      </View>

      {/* Delete button */}
      {onDelete ? (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    overflow: 'hidden',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  amountArea: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: '600',
  },
  merchant: {
    fontSize: 11,
    marginLeft: 46,
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

export default ExpenseItem;
