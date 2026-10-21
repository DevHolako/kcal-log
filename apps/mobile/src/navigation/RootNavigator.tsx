import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getTodayDateString } from '../context/DiaryContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { FoodSearchScreen } from '../screens/FoodSearchScreen';
import { BarcodeScanScreen } from '../screens/BarcodeScanScreen';
import { WeightLogScreen } from '../screens/WeightLogScreen';
import { AdaptiveReviewScreen } from '../screens/AdaptiveReviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { COLORS } from '../components/ui/Theme';
import type { RootTab } from '../types';
import type { MealSlot } from '@kcal-log/types';

const ICONS = {
  diary: require('../../assets/icons/diary.png'),
  search: require('../../assets/icons/search.png'),
  weight: require('../../assets/icons/weight.png'),
  strategy: require('../../assets/icons/strategy.png'),
  settings: require('../../assets/icons/settings.png'),
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<RootTab>('diary');
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [targetSlot, setTargetSlot] = useState<MealSlot>('breakfast');
  const [targetDate, setTargetDate] = useState<string>(getTodayDateString());

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>kcal-log</Text>
        <Text style={styles.loadingSub}>Loading your diary...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoginScreen />
      </SafeAreaView>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'diary':
        return (
          <DiaryScreen
            onNavigateToSearch={(slot, date) => {
              if (slot) setTargetSlot(slot);
              if (date) setTargetDate(date);
              setActiveTab('search');
            }}
          />
        );
      case 'search':
        return (
          <FoodSearchScreen
            initialSlot={targetSlot}
            targetDate={targetDate}
            onOpenBarcodeScanner={() => setBarcodeModalVisible(true)}
            onLogComplete={() => setActiveTab('diary')}
          />
        );
      case 'weigh_in':
        return <WeightLogScreen />;
      case 'adaptive':
        return <AdaptiveReviewScreen />;
      case 'settings':
        return <SettingsScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Active Screen wrapped in Error Boundary */}
        <View style={styles.screenContainer}>
          <ErrorBoundary>
            {renderScreen()}
          </ErrorBoundary>
        </View>

        {/* Bottom Tab Bar with Icons8 Icons */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('diary')}
            activeOpacity={0.7}
          >
            <Image
              source={ICONS.diary}
              style={[
                styles.tabIcon,
                { tintColor: activeTab === 'diary' ? COLORS.accentGreen : COLORS.textMuted },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.tabLabel, activeTab === 'diary' && styles.tabLabelActive]}>
              Diary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('search')}
            activeOpacity={0.7}
          >
            <Image
              source={ICONS.search}
              style={[
                styles.tabIcon,
                { tintColor: activeTab === 'search' ? COLORS.accentGreen : COLORS.textMuted },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.tabLabel, activeTab === 'search' && styles.tabLabelActive]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('weigh_in')}
            activeOpacity={0.7}
          >
            <Image
              source={ICONS.weight}
              style={[
                styles.tabIcon,
                { tintColor: activeTab === 'weigh_in' ? COLORS.accentGreen : COLORS.textMuted },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.tabLabel, activeTab === 'weigh_in' && styles.tabLabelActive]}>
              Weight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('adaptive')}
            activeOpacity={0.7}
          >
            <Image
              source={ICONS.strategy}
              style={[
                styles.tabIcon,
                { tintColor: activeTab === 'adaptive' ? COLORS.accentGreen : COLORS.textMuted },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.tabLabel, activeTab === 'adaptive' && styles.tabLabelActive]}>
              Strategy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}
            activeOpacity={0.7}
          >
            <Image
              source={ICONS.settings}
              style={[
                styles.tabIcon,
                { tintColor: activeTab === 'settings' ? COLORS.accentGreen : COLORS.textMuted },
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barcode Camera Modal */}
        <Modal
          visible={barcodeModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setBarcodeModalVisible(false)}
        >
          <SafeAreaView style={styles.safeArea}>
            <BarcodeScanScreen
              initialSlot={targetSlot}
              onClose={() => setBarcodeModalVisible(false)}
              onLogComplete={() => {
                setBarcodeModalVisible(false);
                setActiveTab('diary');
              }}
            />
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  loadingLogo: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accentGreen,
    letterSpacing: -0.5,
  },
  loadingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111114',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.accentGreen,
    fontWeight: '800',
  },
});
