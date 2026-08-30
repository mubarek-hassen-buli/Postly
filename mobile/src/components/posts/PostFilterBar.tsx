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

export type PostStatusFilter = 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface PostFilterBarProps {
  activeStatus: PostStatusFilter;
  onStatusChange: (status: PostStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PostFilterBar: React.FC<PostFilterBarProps> = ({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  const handleTabPress = (status: PostStatusFilter) => {
    Haptics.selectionAsync().catch(() => {});
    onStatusChange(status);
  };

  const tabs: Array<{ key: PostStatusFilter; label: string }> = [
    { key: 'ALL', label: 'All Posts' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'PUBLISHED', label: 'Published' },
    { key: 'FAILED', label: 'Failed' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Input
        placeholder="Search posts content or channels..."
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

      {/* Horizontal Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  searchContainer: {
    marginBottom: spacing.xs,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeTab: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  tabText: {
    ...typography.presets.subhead,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
