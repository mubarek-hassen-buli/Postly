import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Plus } from 'lucide-react-native';
import { ChannelItem } from '../../services/channels/channelService';
import { TelegramIcon } from '../common/BrandIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface ChannelSelectorPillsProps {
  channels: ChannelItem[];
  selectedChannelIds: string[];
  onToggleChannel: (channelId: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
}

export const ChannelSelectorPills: React.FC<ChannelSelectorPillsProps> = ({
  channels,
  selectedChannelIds,
  onToggleChannel,
  onSelectAll,
  onClearAll,
}) => {
  const handleToggle = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    onToggleChannel(id);
  };

  const isAllSelected = channels.length > 0 && selectedChannelIds.length === channels.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          Target Channels ({selectedChannelIds.length}/{channels.length})
        </Text>
        {channels.length > 1 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              if (isAllSelected) {
                onClearAll?.();
              } else {
                onSelectAll?.();
              }
            }}
          >
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Clear All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {channels.map((channel) => {
          const isSelected = selectedChannelIds.includes(channel.id);

          return (
            <TouchableOpacity
              key={channel.id}
              onPress={() => handleToggle(channel.id)}
              style={[styles.pill, isSelected && styles.selectedPill]}
              accessibilityLabel={`Toggle channel ${channel.title}`}
              accessibilityRole="checkbox"
            >
              <View style={[styles.checkCircle, isSelected && styles.checkedCircle]}>
                {isSelected ? (
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Plus size={10} color={colors.text.muted} />
                )}
              </View>
              <TelegramIcon
                size={12}
                color={isSelected ? colors.primary.DEFAULT : '#2AABEE'}
                style={{ marginHorizontal: 2 }}
              />
              <Text style={[styles.channelTitle, isSelected && styles.selectedTitle]} numberOfLines={1}>
                {channel.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
  },
  selectAllText: {
    ...typography.presets.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    maxWidth: 180,
  },
  selectedPill: {
    backgroundColor: 'rgba(42, 171, 238, 0.15)',
    borderColor: colors.primary.DEFAULT,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkedCircle: {
    backgroundColor: colors.primary.DEFAULT,
  },
  channelTitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  selectedTitle: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
