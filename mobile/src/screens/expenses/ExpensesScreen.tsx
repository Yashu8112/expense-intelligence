import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { expenseAPI, Expense, Category } from '../../services/api';
import ExpenseItem from '../../components/ExpenseItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ExpenseStackParams } from '../../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<ExpenseStackParams, 'ExpensesList'>;

const PAGE_SIZE = 15;

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function ExpensesScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, isDark } = useTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(
    async (reset = false, searchQuery = search) => {
      try {
        const currentPage = reset ? 0 : page;
        const res = await expenseAPI.getAll({
          search: searchQuery || undefined,
          categoryId: selectedCategory ?? undefined,
          page: currentPage,
          size: PAGE_SIZE,
        });
        // Backend wraps every response in ApiResponse { success, message, data }
        const payload = res.data?.data ?? res.data;
        const { content = [], totalElements = 0, totalPages = 0 } = payload ?? {};
        if (reset) {
          setExpenses(content);
          setPage(0);
        } else {
          setExpenses((prev) => [...prev, ...content]);
        }
        setTotalCount(totalElements);
        setHasMore(currentPage < totalPages - 1);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page, search, selectedCategory]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await expenseAPI.categories();
      const cats = res.data?.data ?? res.data;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      // silent
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses(true);
      fetchCategories();
    }, [selectedCategory, fetchExpenses, fetchCategories])
  );

  // Debounced search
  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      setPage(0);
      fetchExpenses(true, text);
    }, 400);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    fetchExpenses(true);
  }, [fetchExpenses]);

  const onLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setPage((prev) => {
      const nextPage = prev + 1;
      fetchExpenses(false);
      return nextPage;
    });
  }, [loadingMore, hasMore, fetchExpenses]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string | number) => {
    try {
      await expenseAPI.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((c) => c - 1);
    } catch (err: any) {
      // Alert already shown in ExpenseItem
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: Expense; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <ExpenseItem
        expense={item}
        onPress={() => navigation.navigate('AddExpense', { expenseId: item.id })}
        onDelete={() => handleDelete(item.id)}
      />
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 80 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses found</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          {search ? 'Try a different search term' : 'Tap the + button to add your first expense'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Expenses</Text>
            <Text style={styles.headerSub}>{totalCount} transactions</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddExpense')}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={handleSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => handleSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* ── Category filter chips ── */}
      <View style={[styles.chipsContainer, { backgroundColor: colors.surface }]}>
        <FlatList
          horizontal
          data={[{ id: null, name: 'All' }, ...categories]}
          keyExtractor={(c) => String(c.id ?? 'all')}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const active = item.id === null ? !selectedCategory : String(item.id) === selectedCategory;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id !== null ? String(item.id) : null)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? COLORS.primary : colors.surfaceElevated,
                    borderColor: active ? COLORS.primary : colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── List ── */}
      {loading ? (
        <LoadingSpinner fullScreen text="Loading expenses…" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  footerLoader: { alignItems: 'center', paddingVertical: 20 },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
