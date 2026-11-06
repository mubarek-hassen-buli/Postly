import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X,
} from 'lucide-react-native';
import { TelegramIcon, LinkedInIcon } from '../common/BrandIcons';
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

export interface DashboardSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const DashboardSearchBar: React.FC<DashboardSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search broadcast content or channels...',
}) => {
  return (
    <View style={styles.searchWrapper}>
      <Input
        placeholder={placeholder}
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
        containerStyle={styles.searchInputContainer}
      />
    </View>
  );
};

export interface PostFilterTabsProps {
  activeStatus: PostStatusFilter;
  onStatusChange: (status: PostStatusFilter) => void;
}

export const PostFilterTabs: React.FC<PostFilterTabsProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  const handleTabPress = (status: PostStatusFilter) => {
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
        <TelegramIcon
          size={14}
          color={isActive ? '#FFFFFF' : '#2AABEE'}
        />
      ),
    },
    {
      key: 'LINKEDIN',
      label: 'LinkedIn',
      icon: (isActive) => (
        <LinkedInIcon
          size={14}
          color={isActive ? '#FFFFFF' : '#0A66C2'}
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
    <View style={styles.tabsContainer}>
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
  return (
    <View style={styles.container}>
      <DashboardSearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <PostFilterTabs
        activeStatus={activeStatus}
        onStatusChange={onStatusChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  searchWrapper: {
    paddingHorizontal: 0,
    marginBottom: spacing.xs,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  tabsContainer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 3,
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    minHeight: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeTab: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
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
