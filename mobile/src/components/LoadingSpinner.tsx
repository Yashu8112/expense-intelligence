import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color ?? COLORS.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {text ? (
          <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text ? (
        <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoadingSpinner;
