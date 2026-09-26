import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { expenseAPI, aiAPI, DashboardStats, Insight } from '../../services/api';
import StatCard from '../../components/StatCard';
import InsightCard from '../../components/InsightCard';
import LoadingSpinner from '../../components/LoadingSpinner';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const CATEGORY_COLORS = [
  COLORS.primary, COLORS.secondary, COLORS.success,
  COLORS.warning, COLORS.danger, '#06B6D4', '#EC4899',
];

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        expenseAPI.dashboard(),
        aiAPI.getInsights(5),
      ]);
      setStats(statsRes.data?.data ?? statsRes.data);
      const ins = insightsRes.data?.data ?? insightsRes.data;
      setInsights(Array.isArray(ins) ? ins : []);
    } catch (err: any) {
      // Silently handle – show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleGenerateInsights = async () => {
    try {
      setGeneratingInsights(true);
      await aiAPI.generateInsights();
      const res = await aiAPI.getInsights(5);
      const ins = res.data?.data ?? res.data;
      setInsights(Array.isArray(ins) ? ins : []);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to generate insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard…" />;

  // Bar chart data
  const barData = (stats?.monthlyTrend ?? []).map((m: any, i) => ({
    value: parseFloat(m.total ?? m.amount ?? 0),
    label: m.label ?? m.month?.slice?.(0, 3) ?? '',
    frontColor: i === (stats?.monthlyTrend.length ?? 1) - 1
      ? COLORS.primary
      : (isDark ? '#334155' : '#CBD5E1'),
  }));

  const userDisplayName = user?.fullName?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {userDisplayName} 👋
              </Text>
              <Text style={styles.headerSub}>Here's your financial snapshot</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Logout', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: logout },
                  ])
                }
                style={styles.iconBtn}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total this month big display */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Spent This Month</Text>
            <Text style={styles.heroAmount}>
              {formatINR(stats?.totalThisMonth ?? 0)}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Stat Cards Grid ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.gridContainer}>
          <View style={styles.grid}>
            <StatCard
              title="Highest Category"
              value={typeof stats?.highestCategory === 'string' ? stats.highestCategory : (stats?.highestCategory as any)?.name ?? '—'}
              subtitle={stats?.highestCategoryAmount ? formatINR(stats.highestCategoryAmount) : ((stats?.highestCategory as any)?.amount ? formatINR((stats?.highestCategory as any).amount) : '')}
              icon="flame-outline"
              gradient={[COLORS.danger, '#F97316']}
              style={styles.gridItem}
            />
            <StatCard
              title="Transactions"
              value={String(stats?.totalExpensesCount ?? stats?.totalTransactions ?? 0)}
              subtitle="this month"
              icon="receipt-outline"
              gradient={[COLORS.secondary, '#A855F7']}
              style={styles.gridItem}
            />
            <StatCard
              title="Avg per Transaction"
              value={formatINR(stats?.averageExpense ?? stats?.avgPerTransaction ?? 0)}
              icon="trending-up-outline"
              gradient={[COLORS.success, '#059669']}
              style={styles.gridItem}
            />
            <StatCard
              title="Monthly Budget"
              value="Track Now"
              subtitle="Set up a budget"
              icon="wallet-outline"
              gradient={[COLORS.warning, '#D97706']}
              style={styles.gridItem}
            />
          </View>
        </Animated.View>

        {/* ── Monthly Trend Bar Chart ── */}
        {barData.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Trend</Text>
              <Ionicons name="bar-chart-outline" size={18} color={COLORS.primary} />
            </View>
            <BarChart
              data={barData}
              width={320}
              height={180}
              barWidth={28}
              spacing={16}
              roundedTop
              noOfSections={4}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              hideRules
              isAnimated
            />
          </Animated.View>
        )}

        {/* ── Category Breakdown ── */}
        {(stats?.categoryBreakdown ?? []).length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
              <Ionicons name="pie-chart-outline" size={18} color={COLORS.secondary} />
            </View>
            {stats!.categoryBreakdown.map((cat: any, i) => {
              const catName = cat.category ?? cat.name ?? 'Other';
              const catAmt = parseFloat(cat.total ?? cat.amount ?? 0);
              const maxAmt = Math.max(1, parseFloat((stats?.categoryBreakdown[0] as any)?.total ?? (stats?.categoryBreakdown[0] as any)?.amount ?? 1));
              const pct = Math.min(100, Math.round((catAmt / maxAmt) * 100));
              const barColor = cat.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <View key={`${catName}-${i}`} style={styles.catRow}>
                  <View style={styles.catLabelRow}>
                    <Text style={[styles.catName, { color: colors.text }]} numberOfLines={1}>
                      {catName}
                    </Text>
                    <Text style={[styles.catAmt, { color: colors.textSecondary }]}>
                      {formatINR(catAmt)}
                    </Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]}
                    />
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* ── AI Insights ── */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Insights</Text>
            <TouchableOpacity
              onPress={handleGenerateInsights}
              disabled={generatingInsights}
              style={[styles.generateBtn, { backgroundColor: COLORS.primary + '15' }]}
            >
              <Ionicons
                name={generatingInsights ? 'hourglass-outline' : 'sparkles-outline'}
                size={14}
                color={COLORS.primary}
              />
              <Text style={[styles.generateBtnText, { color: COLORS.primary }]}>
                {generatingInsights ? 'Generating…' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {insights.length === 0 ? (
            <View style={styles.emptyInsights}>
              <Ionicons name="bulb-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No insights yet. Tap Refresh to generate.
              </Text>
            </View>
          ) : (
            insights.map((insight, i) => (
              <InsightCard
                key={String(insight.id)}
                insight={insight}
                style={i > 0 ? { marginTop: 10 } : undefined}
              />
            ))
          )}
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerGradient: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  heroAmount: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  gridContainer: { paddingHorizontal: 16, paddingTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  catRow: { marginBottom: 12, gap: 6 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13, fontWeight: '500', flex: 1 },
  catAmt: { fontSize: 13, fontWeight: '600' },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  generateBtnText: { fontSize: 12, fontWeight: '600' },
  emptyInsights: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
