import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ViewStyle,
  StyleProp,
  type RefreshControlProps,
} from 'react-native';
import { COLORS } from '../theme/colors';

export interface ScreenContainerProps {
  children?: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export default function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  refreshControl,
}: ScreenContainerProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Container
        style={[styles.container, style]}
        contentContainerStyle={scrollable ? [styles.scrollContent, contentContainerStyle] : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...(scrollable ? { refreshControl } : {})}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
