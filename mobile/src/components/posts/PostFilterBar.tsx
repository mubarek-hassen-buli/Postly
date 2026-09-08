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
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Send,
  Share2,
  X,
} from 'lucide-react-native';
import { Input } from '../ui/Input';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type PostStatusFilter =
  | 'ALL'
  | 'SCHEDULED'
  | 'TELEGRAM'
  | 'LINKEDIN'
  | 'PUBLISHED'
  | 'FAILED';

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

  const tabs: Array<{
    key: PostStatusFilter;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      key: 'ALL',
      label: 'All Posts',
      icon: (isActive) => (
        <Layers
          size={13}
          color={isActive ? '#FFFFFF' : colors.text.secondary}
          strokeWidth={2.5}
        />
      ),
    },
    {
      key: 'SCHEDULED',
      label: 'Scheduled',
      icon: (isActive) => (
        <Clock
          size={13}
          color={isActive ? '#FFFFFF' : colors.status.warning}
          strokeWidth={2.5}
        />
      ),
    },
    {
      key: 'TELEGRAM',
      label: 'Telegram',
      icon: (isActive) => (
        <Send
          size={13}
          color={isActive ? '#FFFFFF' : '#2AABEE'}
          strokeWidth={2.5}
        />
      ),
    },
    {
      key: 'LINKEDIN',
      label: 'LinkedIn',
      icon: (isActive) => (
        <Share2
          size={13}
          color={isActive ? '#FFFFFF' : '#0A66C2'}
          strokeWidth={2.5}
        />
      ),
    },
    {
      key: 'PUBLISHED',
      label: 'Published',
      icon: (isActive) => (
        <CheckCircle2
          size={13}
          color={isActive ? '#FFFFFF' : colors.status.success}
          strokeWidth={2.5}
        />
      ),
    },
    {
      key: 'FAILED',
      label: 'Failed',
      icon: (isActive) => (
        <AlertCircle
          size={13}
          color={isActive ? '#FFFFFF' : colors.status.error}
          strokeWidth={2.5}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Input
        placeholder="Search broadcast content or channels..."
        value={searchQuery}
        onChangeText={onSearchChange}
        leftIcon={<Search size={18} color={colors.text.muted} />}
        rightIcon={
          searchQuery ? (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={colors.text.muted} />
            </TouchableOpacity>
          ) : undefined
        }
        containerStyle={styles.searchContainer}
      />

      {/* Horizontal Pill Selector */}
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
              activeOpacity={0.8}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <View style={styles.tabIconWrap}>{tab.icon(isActive)}</View>
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 3,
    paddingVertical: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeTab: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  tabIconWrap: {
    marginRight: 6,
  },
  tabText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
