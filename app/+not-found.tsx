import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'לא נמצא' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🤷</Text>
        <Text style={styles.title}>הדף לא נמצא</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>חזרה למסך הראשי</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textInverse,
    writingDirection: 'rtl',
  },
});
