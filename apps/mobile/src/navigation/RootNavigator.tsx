import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { FoodSearchScreen } from '../screens/FoodSearchScreen';
import { BarcodeScanScreen } from '../screens/BarcodeScanScreen';
import { WeightLogScreen } from '../screens/WeightLogScreen';
import { AdaptiveReviewScreen } from '../screens/AdaptiveReviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { COLORS } from '../components/ui/Theme';
import type { RootTab } from '../types';
import type { MealSlot } from '@kcal-log/types';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<RootTab>('diary');
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [targetSlot, setTargetSlot] = useState<MealSlot>('breakfast');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>kcal-log</Text>
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
            onNavigateToSearch={slot => {
              if (slot) setTargetSlot(slot);
              setActiveTab('search');
            }}
          />
        );
      case 'search':
        return (
          <FoodSearchScreen
            initialSlot={targetSlot}
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
        {/* Active Screen */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('diary')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === 'diary' && styles.tabIconActive]}>
              📖
            </Text>
            <Text style={[styles.tabLabel, activeTab === 'diary' && styles.tabLabelActive]}>
              Diary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('search')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === 'search' && styles.tabIconActive]}>
              🔍
            </Text>
            <Text style={[styles.tabLabel, activeTab === 'search' && styles.tabLabelActive]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('weigh_in')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === 'weigh_in' && styles.tabIconActive]}>
              ⚖️
            </Text>
            <Text style={[styles.tabLabel, activeTab === 'weigh_in' && styles.tabLabelActive]}>
              Weight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('adaptive')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === 'adaptive' && styles.tabIconActive]}>
              🎯
            </Text>
            <Text style={[styles.tabLabel, activeTab === 'adaptive' && styles.tabLabelActive]}>
              Strategy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabIconActive]}>
              ⚙️
            </Text>
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
          <BarcodeScanScreen
            initialSlot={targetSlot}
            onClose={() => setBarcodeModalVisible(false)}
            onLogComplete={() => {
              setBarcodeModalVisible(false);
              setActiveTab('diary');
            }}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.accentGreen,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
});
