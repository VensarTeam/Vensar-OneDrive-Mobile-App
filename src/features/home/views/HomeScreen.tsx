import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;
  const vm = useHomeViewModel();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: colors.surface }]}
    >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="OneDrive by Vensar"
              contentFit="contain"
              source={
                colorScheme === 'dark'
                  ? require('../../../../assets/onedrive-vensar-dark.png')
                  : require('../../../../assets/onedrive-vensar-light.png')
              }
              style={styles.brandLogo}
            />
          </View>
          <View style={styles.userGreeting}>
            <View style={styles.greetingCopy}>
              <Text style={[styles.welcomeLabel, { color: colors.textMuted }]}>Welcome,</Text>
              <Text
                numberOfLines={1}
                selectable
                style={[styles.welcomeName, { color: colors.text }]}
              >
                Ritesh Mehra
              </Text>
            </View>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.surfaceMuted, borderColor: `${colors.primary}22` },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>RM</Text>
            </View>
          </View>
        </View>

        <Pressable style={[styles.search, { backgroundColor: colors.background }]}> 
          <Icon color={colors.textMuted} size={21} source="magnify" />
          <Text style={[styles.searchText, { color: colors.textMuted }]}>Search files</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
          <Pressable><Text style={[styles.link, { color: colors.primary }]}>See all</Text></Pressable>
        </View>

        <View style={styles.files}>
          {vm.files.map((file) => (
            <Pressable key={file.id} style={({ pressed }) => [styles.fileRow, { backgroundColor: pressed ? colors.background : colors.surface }]}> 
              <View style={[styles.fileIcon, { backgroundColor: `${file.tint}12` }]}> 
                <Icon color={file.tint} size={27} source={file.icon} />
              </View>
              <View style={styles.fileInfo}>
                <Text numberOfLines={1} style={[styles.fileName, { color: colors.text }]}>{file.name}</Text>
                <Text style={[styles.fileMeta, { color: colors.textMuted }]}>{file.meta}</Text>
              </View>
              <Icon color={colors.textMuted} size={22} source="dots-horizontal" />
            </Pressable>
          ))}
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { paddingBottom: 32, paddingHorizontal: 20 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  brand: { flexShrink: 1, height: 54, justifyContent: 'center', transform: [{ translateX: -12 }], width: 144 }, brandLogo: { height: 54, width: 120 },
  userGreeting: { alignItems: 'center', flexDirection: 'row', flexShrink: 0, gap: 10 },
  greetingCopy: { alignItems: 'flex-end', maxWidth: 104 },
  welcomeLabel: { fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 14 },
  welcomeName: { fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 18 },
  avatar: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, height: 40, justifyContent: 'center', width: 40 }, avatarText: { fontFamily: fontFamilies.semibold, fontSize: 13 },
  search: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 14, flexDirection: 'row', gap: 11, marginTop: 26, minHeight: 52, paddingHorizontal: 16 }, searchText: { flex: 1, fontFamily: fontFamilies.regular, fontSize: 15 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, paddingTop: 30 }, sectionTitle: { fontFamily: fontFamilies.bold, fontSize: 22 }, link: { fontFamily: fontFamilies.semibold, fontSize: 14 },
  files: { gap: 3 }, fileRow: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 14, minHeight: 72, paddingHorizontal: 10 }, fileIcon: { alignItems: 'center', borderRadius: 12, height: 46, justifyContent: 'center', width: 46 }, fileInfo: { flex: 1, gap: 4 }, fileName: { fontFamily: fontFamilies.semibold, fontSize: 15 }, fileMeta: { fontFamily: fontFamilies.regular, fontSize: 12 },
});
