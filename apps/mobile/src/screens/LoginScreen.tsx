import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS } from '../components/ui/Theme';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { apiUrl, updateApiUrl, login } = useAuth();
  const [serverUrl, setServerUrl] = useState(apiUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (serverUrl.trim() !== apiUrl) {
        await updateApiUrl(serverUrl.trim());
      }
      await login(email.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo / Title */}
        <View style={styles.brandContainer}>
          <Text style={styles.logoText}>kcal-log</Text>
          <Text style={styles.tagline}>
            Open-source, privacy-first nutrition & fitness tracking
          </Text>
        </View>

        {/* Login Form Card */}
        <Card style={styles.card}>
          <Text style={styles.formTitle}>Mobile Sign In</Text>

          <Input
            label="API Server Address"
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://10.0.2.2:9000"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <Button
            title="Sign In with Sanctum Token"
            variant="primary"
            size="lg"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.submitBtn}
          />
        </Card>

        {/* Help footer */}
        <Text style={styles.helpText}>
          Issues personal Bearer access tokens via Laravel Sanctum (/api/v1/auth/tokens)
          without exposing master session cookies.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accentGreen,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 8,
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
