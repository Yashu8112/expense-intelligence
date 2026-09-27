import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { expenseAPI, Category, Expense } from '../../services/api';
import { ExpenseStackParams } from '../../navigation/AppNavigator';
import LoadingSpinner from '../../components/LoadingSpinner';

type NavProp = NativeStackNavigationProp<ExpenseStackParams, 'AddExpense'>;
type RoutePropType = RouteProp<ExpenseStackParams, 'AddExpense'>;

const PAYMENT_METHODS = [
  { key: 'CARD', label: 'Card', icon: 'card-outline' as const },
  { key: 'CASH', label: 'Cash', icon: 'cash-outline' as const },
  { key: 'UPI', label: 'UPI', icon: 'phone-portrait-outline' as const },
  { key: 'BANK_TRANSFER', label: 'Bank', icon: 'business-outline' as const },
  { key: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

const PAYMENT_COLORS: Record<string, string> = {
  CARD: COLORS.primary,
  CASH: COLORS.success,
  UPI: COLORS.secondary,
  BANK_TRANSFER: COLORS.warning,
  OTHER: COLORS.danger,
};

// Must live at module level: defining it inside the screen gives it a new
// component type on every render, which remounts the wrapped TextInput and
// dismisses the keyboard after each keystroke.
function Field({
  label,
  icon,
  prefix,
  children,
  error,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  prefix?: string;
  children: React.ReactNode;
  error?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.input,
            borderColor: error ? COLORS.danger : colors.inputBorder,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        {prefix ? (
          <Text style={[styles.prefix, { color: colors.textSecondary }]}>{prefix}</Text>
        ) : null}
        {children}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function AddExpenseScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { colors } = useTheme();

  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('CARD');
  const [categoryId, setCategoryId] = useState<string | number | null>(null);
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load existing expense if editing ──────────────────────────────────────
  const loadExpense = useCallback(async () => {
    if (!expenseId) return;
    try {
      const res = await expenseAPI.getById(expenseId);
      // Backend wraps every response in ApiResponse { success, message, data }
      const e = res.data?.data ?? res.data;
      setTitle(e.title);
      setAmount(String(e.amount));
      setDate((e.expenseDate ?? e.date)?.slice(0, 10) ?? format(new Date(), 'yyyy-MM-dd'));
      setPaymentMethod(e.paymentMethod);
      setCategoryId(e.category?.id ?? e.categoryId ?? null);
      setMerchant(e.merchant ?? '');
      setNotes(e.notes ?? '');
      setRecurring(e.isRecurring ?? e.recurring ?? false);
    } catch {
      Alert.alert('Error', 'Could not load expense');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [expenseId, navigation]);

  useEffect(() => {
    expenseAPI
      .categories()
      .then((res) => {
        const cats = res.data?.data ?? res.data;
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
    if (isEditing) loadExpense();
  }, [isEditing, loadExpense]);

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    const amt = parseFloat(amount);
    if (!amount) errs.amount = 'Amount is required';
    else if (isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid positive amount';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        // Backend CreateRequest/UpdateRequest use expenseDate + isRecurring
        expenseDate: date,
        paymentMethod,
        categoryId: categoryId ?? undefined,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
        isRecurring: recurring,
      };
      if (isEditing) {
        await expenseAPI.update(expenseId, payload);
      } else {
        await expenseAPI.create(payload as any);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('ExpensesList');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.message ?? 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading…" />;

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name ?? 'Select Category';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('ExpensesList');
            }
          }}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Expense' : 'New Expense'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Field label="Title" icon="text-outline" error={errors.title}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. Coffee, Lunch, Netflix"
              placeholderTextColor={colors.placeholder}
              value={title}
              onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
              returnKeyType="next"
            />
          </Field>

          {/* Amount */}
          <Field label="Amount" icon="cash-outline" prefix="₹" error={errors.amount}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.placeholder}
              value={amount}
              onChangeText={(t) => { setAmount(t); setErrors((e) => ({ ...e, amount: '' })); }}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </Field>

          {/* Date */}
          <Field label="Date (YYYY-MM-DD)" icon="calendar-outline" error={errors.date}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="2024-01-15"
              placeholderTextColor={colors.placeholder}
              value={date}
              onChangeText={(t) => { setDate(t); setErrors((e) => ({ ...e, date: '' })); }}
              keyboardType="numeric"
            />
          </Field>

          {/* Payment Method */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
            <View style={styles.paymentGrid}>
              {PAYMENT_METHODS.map((pm) => {
                const active = paymentMethod === pm.key;
                const color = PAYMENT_COLORS[pm.key];
                return (
                  <TouchableOpacity
                    key={pm.key}
                    onPress={() => setPaymentMethod(pm.key as Expense['paymentMethod'])}
                    style={[
                      styles.paymentChip,
                      {
                        backgroundColor: active ? color + '18' : colors.input,
                        borderColor: active ? color : colors.inputBorder,
                      },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={pm.icon}
                      size={16}
                      color={active ? color : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.paymentLabel,
                        { color: active ? color : colors.textSecondary },
                      ]}
                    >
                      {pm.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <TouchableOpacity
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.inputBorder },
              ]}
              onPress={() => setShowCategoryPicker((s) => !s)}
              activeOpacity={0.75}
            >
              <Ionicons name="pricetag-outline" size={18} color={colors.textMuted} />
              <Text
                style={[
                  styles.input,
                  { color: categoryId ? colors.text : colors.placeholder, paddingVertical: 0 },
                ]}
              >
                {selectedCategoryName}
              </Text>
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { setCategoryId(null); setShowCategoryPicker(false); }}
                >
                  <Text style={[styles.dropdownText, { color: colors.textSecondary }]}>
                    None
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={String(cat.id)}
                    style={[
                      styles.dropdownItem,
                      cat.id === categoryId && { backgroundColor: COLORS.primary + '12' },
                    ]}
                    onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: cat.id === categoryId ? COLORS.primary : colors.text },
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {cat.id === categoryId && (
                      <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Merchant */}
          <Field label="Merchant (optional)" icon="storefront-outline">
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. Starbucks, Amazon"
              placeholderTextColor={colors.placeholder}
              value={merchant}
              onChangeText={setMerchant}
              returnKeyType="next"
            />
          </Field>

          {/* Notes */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (optional)</Text>
            <View
              style={[
                styles.textAreaRow,
                { backgroundColor: colors.input, borderColor: colors.inputBorder },
              ]}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="Any additional notes…"
                placeholderTextColor={colors.placeholder}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Recurring Toggle */}
          <View
            style={[
              styles.toggleRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.toggleInfo}>
              <Ionicons name="repeat-outline" size={20} color={COLORS.secondary} />
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Recurring</Text>
                <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                  Mark as a recurring expense
                </Text>
              </View>
            </View>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ false: colors.border, true: COLORS.primary + '60' }}
              thumbColor={recurring ? COLORS.primary : colors.textMuted}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{ marginTop: 24 }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name={isEditing ? 'create-outline' : 'add-circle-outline'} size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving…' : isEditing ? 'Update Expense' : 'Add Expense'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingVertical: 16,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  saveBtn: { color: '#fff', fontSize: 16, fontWeight: '700' },
  body: { padding: 20, paddingTop: 16 },
  fieldWrapper: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  prefix: { fontSize: 16, fontWeight: '700' },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  errorText: { fontSize: 12, color: COLORS.danger },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  paymentLabel: { fontSize: 13, fontWeight: '600' },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  dropdownText: { fontSize: 14 },
  textAreaRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    minHeight: 80,
  },
  textArea: { flex: 1, fontSize: 15 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleSub: { fontSize: 12, marginTop: 2 },
  saveButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
