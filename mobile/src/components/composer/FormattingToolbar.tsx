import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Bold,
  Code,
  EyeOff,
  Italic,
  Link2,
  Strikethrough,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type FormattingMode = 'HTML' | 'MARKDOWN' | 'PLAIN';

export interface FormattingToolbarProps {
  mode: FormattingMode;
  onModeChange: (mode: FormattingMode) => void;
  onInsertTag: (startTag: string, endTag: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  mode,
  onModeChange,
  onInsertTag,
}) => {
  const handleTagPress = (tagType: 'bold' | 'italic' | 'code' | 'strike' | 'spoiler' | 'link') => {
    Haptics.selectionAsync().catch(() => {});

    if (mode === 'HTML') {
      switch (tagType) {
        case 'bold':
          onInsertTag('<b>', '</b>');
          break;
        case 'italic':
          onInsertTag('<i>', '</i>');
          break;
        case 'code':
          onInsertTag('<code>', '</code>');
          break;
        case 'strike':
          onInsertTag('<s>', '</s>');
          break;
        case 'spoiler':
          onInsertTag('<tg-spoiler>', '</tg-spoiler>');
          break;
        case 'link':
          onInsertTag('<a href="https://">', '</a>');
          break;
      }
    } else if (mode === 'MARKDOWN') {
      switch (tagType) {
        case 'bold':
          onInsertTag('**', '**');
          break;
        case 'italic':
          onInsertTag('*', '*');
          break;
        case 'code':
          onInsertTag('`', '`');
          break;
        case 'strike':
          onInsertTag('~~', '~~');
          break;
        case 'spoiler':
          onInsertTag('||', '||');
          break;
        case 'link':
          onInsertTag('[link text](https://', ')');
          break;
      }
    }
  };

  const handleModeChange = (newMode: FormattingMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onModeChange(newMode);
  };

  return (
    <View style={styles.container}>
      {/* Mode switcher tabs on Left */}
      <View style={styles.modeTabs}>
        {(['HTML', 'MARKDOWN', 'PLAIN'] as FormattingMode[]).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => handleModeChange(item)}
            style={[styles.modeTab, mode === item && styles.activeModeTab]}
          >
            <Text style={[styles.modeText, mode === item && styles.activeModeText]}>
              {item === 'MARKDOWN' ? 'MD' : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Formatting button shortcuts on Right */}
      {mode !== 'PLAIN' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolsRow}
        >
          <TouchableOpacity
            onPress={() => handleTagPress('bold')}
            style={styles.toolBtn}
            accessibilityLabel="Bold"
          >
            <Bold size={16} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTagPress('italic')}
            style={styles.toolBtn}
            accessibilityLabel="Italic"
          >
            <Italic size={16} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTagPress('code')}
            style={styles.toolBtn}
            accessibilityLabel="Monospace Code"
          >
            <Code size={16} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTagPress('strike')}
            style={styles.toolBtn}
            accessibilityLabel="Strikethrough"
          >
            <Strikethrough size={16} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTagPress('spoiler')}
            style={styles.toolBtn}
            accessibilityLabel="Telegram Spoiler"
          >
            <EyeOff size={16} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTagPress('link')}
            style={styles.toolBtn}
            accessibilityLabel="Link"
          >
            <Link2 size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.sm,
    padding: 2,
    marginRight: spacing.sm,
  },
  modeTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  activeModeTab: {
    backgroundColor: colors.primary.DEFAULT,
  },
  modeText: {
    ...typography.presets.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
