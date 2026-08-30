import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type ChannelFilterMode = 'ALL' | 'SELECTED' | 'CAN_POST';

export interface ChannelFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: ChannelFilterMode;
  onFilterModeChange: (mode: ChannelFilterMode) => void;
  selectedCount?: number;
  totalCount?: number;
}

export const ChannelFilterBar: React.FC<ChannelFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  selectedCount = 0,
  totalCount = 0,
}) => {
  const handleChipPress = (mode: ChannelFilterMode) => {
    Haptics.selectionAsync().catch(() => {});
    onFilterModeChange(mode);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Input
        placeholder="Search channels by name or username..."
        value={searchQuery}
        onChangeText={onSearchChange}
        leftIcon={<Search size={18} color={colors.text.muted} />}
        rightIcon={
          searchQuery ? (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={16} color={colors.text.muted} />
            </TouchableOpacity>
          ) : undefined
        }
        containerStyle={styles.searchContainer}
      />

      {/* Filter Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          onPress={() => handleChipPress('ALL')}
          style={[styles.chip, filterMode === 'ALL' && styles.activeChip]}
        >
          <Text style={[styles.chipText, filterMode === 'ALL' && styles.activeChipText]}>
            All ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleChipPress('SELECTED')}
          style={[styles.chip, filterMode === 'SELECTED' && styles.activeChip]}
        >
          <Text style={[styles.chipText, filterMode === 'SELECTED' && styles.activeChipText]}>
            Selected ({selectedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleChipPress('CAN_POST')}
          style={[styles.chip, filterMode === 'CAN_POST' && styles.activeChip]}
        >
          <Text style={[styles.chipText, filterMode === 'CAN_POST' && styles.activeChipText]}>
            Can Post
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeChip: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
