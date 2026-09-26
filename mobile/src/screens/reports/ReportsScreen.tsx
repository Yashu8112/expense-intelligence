import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { aiAPI, reportAPI, MonthlySummary } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function ReportsScreen() {
  const { colors, isDark } = useTheme();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [yearInput, setYearInput] = useState(String(now.getFullYear()));

  // Date range for report exports (backend requires both bounds)
  const [rangeStart, setRangeStart] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const [summaryData, setSummaryData] = useState<MonthlySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const RANGES = [
    { label: 'This month', start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') },
    { label: 'Last month', start: format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd') },
    { label: 'Last 3 months', start: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') },
  ];

  const handleGenerateSummary = async () => {
    const year = parseInt(yearInput, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      Alert.alert('Invalid Year', 'Please enter a valid year (2000–2100)');
      return;
    }
    try {
      setLoadingSummary(true);
      setSelectedYear(year);
      const res = await aiAPI.getMonthlySummary(selectedMonth, year);
      // Response is wrapped: { success, message, data: MonthlySummary }
      setSummaryData(res.data?.data ?? res.data);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownload = async (type: 'pdf' | 'excel') => {
    if (rangeStart > rangeEnd) {
      Alert.alert('Invalid Range', 'Start date must be before end date.');
      return;
    }
    try {
      type === 'pdf' ? setDownloadingPdf(true) : setDownloadingExcel(true);
      await reportAPI.downloadReport(type, rangeStart, rangeEnd);
    } catch (err: any) {
      Alert.alert('Download Failed', err.message ?? 'Could not download the report.');
    } finally {
      setDownloadingPdf(false);
      setDownloadingExcel(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.headerTitle}>Reports & Insights</Text>
          <Text style={styles.headerSub}>AI-powered financial analysis</Text>
        </LinearGradient>

        {/* ── Download section ── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="download-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Reports</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Download your expense reports in PDF or Excel format.
          </Text>

          {/* Quick date-range chips */}
          <View style={styles.rangeRow}>
            {RANGES.map(({ label, start, end }) => {
              const active = rangeStart === start && rangeEnd === end;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => { setRangeStart(start); setRangeEnd(end); }}
                  style={[
                    styles.rangeChip,
                    {
                      backgroundColor: active ? COLORS.primary : colors.surfaceElevated,
                      borderColor: active ? COLORS.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.rangeChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
            {format(new Date(rangeStart), 'dd MMM yyyy')} — {format(new Date(rangeEnd), 'dd MMM yyyy')}
          </Text>

          <View style={styles.downloadRow}>
            <TouchableOpacity
              onPress={() => handleDownload('pdf')}
              disabled={downloadingPdf}
              activeOpacity={0.8}
              style={styles.downloadBtnWrapper}
            >
              <LinearGradient
                colors={[COLORS.danger, '#DC2626']}
                style={styles.downloadBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.downloadBtnText}>
                  {downloadingPdf ? 'Preparing…' : 'PDF Report'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDownload('excel')}
              disabled={downloadingExcel}
              activeOpacity={0.8}
              style={styles.downloadBtnWrapper}
            >
              <LinearGradient
                colors={[COLORS.success, '#059669']}
                style={styles.downloadBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="grid-outline" size={20} color="#fff" />
                <Text style={styles.downloadBtnText}>
                  {downloadingExcel ? 'Preparing…' : 'Excel Report'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── AI Monthly Summary ── */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color={COLORS.secondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Monthly Summary</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Get an AI-generated analysis of your spending for any month.
          </Text>

          {/* Month selector */}
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Select Month</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScroll}
          >
            {MONTHS.map((month, i) => {
              const active = selectedMonth === i + 1;
              return (
                <TouchableOpacity
                  key={month}
                  onPress={() => setSelectedMonth(i + 1)}
                  style={[
                    styles.monthChip,
                    {
                      backgroundColor: active ? COLORS.primary : colors.surfaceElevated,
                      borderColor: active ? COLORS.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.monthChipText, { color: active ? '#fff' : colors.textSecondary }]}>
                    {month.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Year input */}
          <Text style={[styles.pickerLabel, { color: colors.textSecondary, marginTop: 12 }]}>
            Year
          </Text>
          <View
            style={[
              styles.yearInput,
              { backgroundColor: colors.input, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.yearInputText, { color: colors.text }]}
              value={yearInput}
              onChangeText={setYearInput}
              keyboardType="numeric"
              maxLength={4}
              placeholder="YYYY"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <TouchableOpacity
            onPress={handleGenerateSummary}
            disabled={loadingSummary}
            activeOpacity={0.85}
            style={{ marginTop: 16 }}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              style={[styles.generateBtn, loadingSummary && { opacity: 0.7 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={loadingSummary ? 'hourglass-outline' : 'analytics-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.generateBtnText}>
                {loadingSummary
                  ? 'Generating Summary…'
                  : `Generate for ${MONTHS[selectedMonth - 1]} ${yearInput}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Summary result */}
          {loadingSummary && <LoadingSpinner text="AI is analyzing your expenses…" />}

          {summaryData && !loadingSummary && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={[styles.summaryResult, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              {/* Header row */}
              <View style={styles.summaryHeaderRow}>
                <View style={[styles.summaryIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                  <Ionicons name="sparkles" size={20} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>
                    {MONTHS[summaryData.month - 1]} {summaryData.year}
                  </Text>
                  <Text style={[styles.summaryTotalLabel, { color: colors.textSecondary }]}>
                    Total: {formatINR(parseFloat(String(summaryData.totalSpending ?? 0)))}
                  </Text>
                </View>
              </View>

              {/* Change vs previous month */}
              {summaryData.changePercent != null && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={summaryData.changePercent > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={summaryData.changePercent > 0 ? COLORS.danger : COLORS.success}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: summaryData.changePercent > 0 ? COLORS.danger : COLORS.success },
                    ]}
                  >
                    {(summaryData.changePercent > 0 ? '+' : '') +
                      parseFloat(String(summaryData.changePercent)).toFixed(1)}
                    % vs last month
                  </Text>
                </View>
              )}

              {/* Top category */}
              {summaryData.topCategory ? (
                <View style={styles.topCatContainer}>
                  <Text style={[styles.topCatLabel, { color: colors.textSecondary }]}>
                    Top Category
                  </Text>
                  <View style={styles.topCatRow}>
                    <View style={[styles.catDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.catName, { color: colors.text }]}>
                      {summaryData.topCategory}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* AI narrative */}
              {summaryData.aiNarrative ? (
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {summaryData.aiNarrative}
                </Text>
              ) : null}

              {/* Key insights */}
              {(summaryData.keyInsights ?? []).length > 0 && (
                <View style={styles.topCatContainer}>
                  <Text style={[styles.topCatLabel, { color: colors.textSecondary }]}>
                    Key Insights
                  </Text>
                  {summaryData.keyInsights!.map((insight, i) => (
                    <View key={`${i}`} style={styles.topCatRow}>
                      <View style={[styles.insightNum, { backgroundColor: COLORS.primary + '18' }]}>
                        <Text style={[styles.insightNumText, { color: COLORS.primary }]}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.catName, { color: colors.text, flex: 1 }]}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 4,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, lineHeight: 20 },
  downloadRow: { flexDirection: 'row', gap: 10 },
  downloadBtnWrapper: { flex: 1 },
  downloadBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  downloadBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  rangeChipText: { fontSize: 12, fontWeight: '600' },
  rangeLabel: { fontSize: 12, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  changeText: { fontSize: 13, fontWeight: '700' },
  insightNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightNumText: { fontSize: 10, fontWeight: '800' },
  pickerLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6 },
  monthScroll: { gap: 8 },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  monthChipText: { fontSize: 13, fontWeight: '600' },
  yearInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  yearInputText: { flex: 1, fontSize: 15 },
  generateBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  summaryResult: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  summaryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summaryTotalLabel: { fontSize: 13, marginTop: 2 },
  summaryText: { fontSize: 14, lineHeight: 22 },
  topCatContainer: { gap: 8 },
  topCatLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  topCatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 13 },
  catAmt: { fontSize: 13, fontWeight: '600' },
});
