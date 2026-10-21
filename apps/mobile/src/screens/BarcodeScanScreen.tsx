import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { COLORS } from '../components/ui/Theme';
import { barcodeService } from '../services/barcode';
import type { Food, MealSlot } from '@kcal-log/types';
import { ServingCalculatorModal } from '../components/ServingCalculatorModal';
import { useDiary } from '../context/DiaryContext';

interface BarcodeScanScreenProps {
  initialSlot?: MealSlot;
  onClose: () => void;
  onLogComplete?: () => void;
}

export const BarcodeScanScreen: React.FC<BarcodeScanScreenProps> = ({
  initialSlot = 'breakfast',
  onClose,
  onLogComplete,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [resolvedFood, setResolvedFood] = useState<Food | null>(null);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const { addFoodEntry } = useDiary();

  const handleBarcodeScanned = async (barcode: string) => {
    if (scanned || isResolving) return;
    setScanned(true);
    setIsResolving(true);
    setErrorText(null);

    try {
      const food = await barcodeService.scanAndResolve(barcode);
      setResolvedFood(food);
      setCalculatorVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Food not found for this barcode.';
      setErrorText(msg);
    } finally {
      setIsResolving(false);
    }
  };

  const handleManualLookup = () => {
    if (!manualCode.trim()) return;
    handleBarcodeScanned(manualCode.trim());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Barcode</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Viewfinder or Permission Request */}
      {permission && permission.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
            onBarcodeScanned={scanned ? undefined : ({ data }) => handleBarcodeScanned(data)}
          >
            <View style={styles.reticleOverlay}>
              <View style={styles.reticle} />
              <Text style={styles.reticlePrompt}>
                Align barcode within frame
              </Text>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan product barcodes directly.
          </Text>
          <Button
            title="Grant Camera Access"
            variant="primary"
            onPress={requestPermission}
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {/* Loading or Status State */}
      {isResolving && (
        <View style={styles.resolvingBox}>
          <ActivityIndicator size="small" color={COLORS.accentGreen} style={{ marginRight: 8 }} />
          <Text style={styles.resolvingText}>Resolving food via Open Food Facts...</Text>
        </View>
      )}

      {errorText && (
        <View style={styles.errorBox}>
          <Text style={styles.errorMsg}>{errorText}</Text>
          <Button
            title="Scan Again"
            size="sm"
            variant="outline"
            onPress={() => {
              setScanned(false);
              setErrorText(null);
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      {/* Manual Input Fallback */}
      <Card style={styles.manualCard}>
        <Text style={styles.manualLabel}>Manual Barcode Entry (Fallback / Test):</Text>
        <View style={styles.manualRow}>
          <Input
            placeholder="e.g. 3017620422003"
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <Button
            title="Lookup"
            size="sm"
            onPress={handleManualLookup}
            loading={isResolving}
            style={{ marginLeft: 8, height: 42 }}
          />
        </View>
      </Card>

      {/* Food Portion Calculator */}
      <ServingCalculatorModal
        visible={calculatorVisible}
        food={resolvedFood}
        initialMealSlot={initialSlot}
        onClose={() => {
          setCalculatorVisible(false);
          setScanned(false);
        }}
        onConfirm={async payload => {
          await addFoodEntry(payload);
          if (onLogComplete) onLogComplete();
          onClose();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  cameraContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  reticleOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reticle: {
    width: 220,
    height: 120,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  reticlePrompt: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  permissionBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resolvingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resolvingText: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorMsg: {
    fontSize: 12,
    color: COLORS.accentRed,
  },
  manualCard: {
    padding: 14,
    marginTop: 'auto',
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
