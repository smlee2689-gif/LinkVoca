import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeColors = Readonly<{
  canvas: string;
  surface: string;
  subtle: string;
  text: string;
  secondaryText: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  border: string;
  success: string;
}>;

const homeColors: Readonly<{ light: HomeColors; dark: HomeColors }> = {
  light: {
    canvas: '#F7F8FA',
    surface: '#FFFFFF',
    subtle: '#EEF1F5',
    text: '#17202A',
    secondaryText: '#5D6875',
    primary: '#3563E9',
    primaryPressed: '#254DC0',
    onPrimary: '#FFFFFF',
    border: '#D9DEE5',
    success: '#16856F',
  },
  dark: {
    canvas: '#101318',
    surface: '#191E25',
    subtle: '#242B34',
    text: '#F3F5F7',
    secondaryText: '#B7C0CA',
    primary: '#7C9DFF',
    primaryPressed: '#9AB3FF',
    onPrimary: '#0C1738',
    border: '#39424D',
    success: '#54D3B6',
  },
};

const todayReview = {
  dueCount: 8,
  estimatedMinutes: 6,
};

const recentWordbook = {
  title: '간호 영어 핵심 단어',
  wordCount: 42,
  reviewedToday: 6,
  preview: ['administer', 'dosage', 'follow-up'],
};

function showMockMessage(title: string, message: string) {
  Alert.alert(title, message);
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = homeColors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text accessibilityRole="header" style={[styles.eyebrow, { color: colors.secondaryText }]}>
            오늘도 차근차근
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>안녕하세요</Text>
          <Text style={[styles.introduction, { color: colors.secondaryText }]}>
            오늘 익힐 단어부터 가볍게 시작해 보세요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
            오늘 학습
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`오늘 복습 ${todayReview.dueCount}개, 약 ${todayReview.estimatedMinutes}분, 복습 시작`}
            onPress={() =>
              showMockMessage('오늘 복습', '복습 화면은 다음 구현에서 연결할 예정이에요.')
            }
            style={({ pressed }) => [
              styles.reviewCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <View style={[styles.iconTile, { backgroundColor: colors.subtle }]}>
              <Ionicons
                accessibilityElementsHidden
                color={colors.success}
                importantForAccessibility="no-hide-descendants"
                name="sparkles-outline"
                size={24}
              />
            </View>
            <View style={styles.cardCopy}>
              <Text style={[styles.cardKicker, { color: colors.success }]}>복습할 시간이에요</Text>
              <Text style={[styles.reviewCount, { color: colors.text }]}>
                {todayReview.dueCount}개 단어
              </Text>
              <Text style={[styles.cardMeta, { color: colors.secondaryText }]}>
                약 {todayReview.estimatedMinutes}분이면 마칠 수 있어요
              </Text>
            </View>
            <Ionicons
              accessibilityElementsHidden
              color={colors.secondaryText}
              importantForAccessibility="no-hide-descendants"
              name="chevron-forward"
              size={22}
            />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityHint="현재는 사진 선택 대신 Mock 안내를 표시합니다"
          accessibilityLabel="사진에서 단어 가져오기"
          onPress={() =>
            showMockMessage(
              '사진에서 단어 가져오기',
              '사진 선택과 단어 찾기는 아직 연결되지 않았어요.',
            )
          }
          style={({ pressed }) => [
            styles.importCard,
            {
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            },
          ]}>
          <View style={styles.importIcon}>
            <Ionicons
              accessibilityElementsHidden
              color={colors.onPrimary}
              importantForAccessibility="no-hide-descendants"
              name="images-outline"
              size={28}
            />
          </View>
          <View style={styles.cardCopy}>
            <Text style={[styles.importTitle, { color: colors.onPrimary }]}>사진에서 단어 가져오기</Text>
            <Text style={[styles.importBody, { color: colors.onPrimary }]}>
              교재나 스크린샷 한 장으로 시작해요
            </Text>
          </View>
          <Ionicons
            accessibilityElementsHidden
            color={colors.onPrimary}
            importantForAccessibility="no-hide-descendants"
            name="arrow-forward"
            size={22}
          />
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
              최근 단어장
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => showMockMessage('내 단어장', '단어장 목록은 아직 준비 중이에요.')}
              style={({ pressed }) => [styles.textButton, { opacity: pressed ? 0.58 : 1 }]}>
              <Text style={[styles.textButtonLabel, { color: colors.primary }]}>전체 보기</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${recentWordbook.title}, 단어 ${recentWordbook.wordCount}개, 오늘 ${recentWordbook.reviewedToday}개 학습`}
            onPress={() => showMockMessage(recentWordbook.title, '단어장 상세 화면은 아직 준비 중이에요.')}
            style={({ pressed }) => [
              styles.wordbookCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <View style={styles.wordbookTopRow}>
              <View style={[styles.bookIcon, { backgroundColor: colors.subtle }]}>
                <Ionicons
                  accessibilityElementsHidden
                  color={colors.primary}
                  importantForAccessibility="no-hide-descendants"
                  name="book-outline"
                  size={24}
                />
              </View>
              <View style={styles.cardCopy}>
                <Text style={[styles.wordbookTitle, { color: colors.text }]}>
                  {recentWordbook.title}
                </Text>
                <Text style={[styles.cardMeta, { color: colors.secondaryText }]}>
                  {recentWordbook.wordCount}개 단어 · 오늘 {recentWordbook.reviewedToday}개 학습
                </Text>
              </View>
            </View>
            <Text numberOfLines={2} style={[styles.wordPreview, { color: colors.secondaryText }]}>
              {recentWordbook.preview.join('  ·  ')}
            </Text>
          </Pressable>
        </View>

        <View
          accessible
          accessibilityLabel="정리 중인 사진 없음. 새 사진은 사진에서 단어 가져오기로 시작할 수 있습니다."
          style={[styles.emptyState, { borderColor: colors.border }]}>
          <Ionicons
            accessibilityElementsHidden
            color={colors.secondaryText}
            importantForAccessibility="no-hide-descendants"
            name="checkmark-circle-outline"
            size={24}
          />
          <View style={styles.cardCopy}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>정리 중인 사진이 없어요</Text>
            <Text style={[styles.emptyBody, { color: colors.secondaryText }]}>
              새 사진은 위의 가져오기 버튼으로 시작할 수 있어요.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="개발용 OCR 검토 화면 열기"
          onPress={() => router.push('/ocr-review')}
          style={({ pressed }) => [styles.developerLink, { opacity: pressed ? 0.58 : 1 }]}>
          <Text style={[styles.developerLinkText, { color: colors.secondaryText }]}>개발용 · OCR 검토 화면</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  greeting: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 27,
  },
  reviewCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 116,
    padding: 18,
  },
  iconTile: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardKicker: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  reviewCount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 31,
  },
  cardMeta: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  importCard: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    minHeight: 112,
    padding: 20,
  },
  importIcon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  importTitle: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
  },
  importBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    opacity: 0.86,
  },
  textButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingLeft: 12,
  },
  textButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  wordbookCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    minHeight: 132,
    padding: 18,
  },
  wordbookTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  bookIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  wordbookTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  wordPreview: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyState: {
    alignItems: 'flex-start',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  developerLink: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  developerLinkText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
