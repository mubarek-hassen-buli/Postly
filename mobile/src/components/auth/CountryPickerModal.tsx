import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Search, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

export interface Country {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
}

export const COUNTRIES_DATA: Country[] = [
  { name: 'Netherlands', dialCode: '+31', code: 'NL', flag: '🇳🇱' },
  { name: 'United States', dialCode: '+1', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', dialCode: '+44', code: 'GB', flag: '🇬🇧' },
  { name: 'Germany', dialCode: '+49', code: 'DE', flag: '🇩🇪' },
  { name: 'France', dialCode: '+33', code: 'FR', flag: '🇫🇷' },
  { name: 'Canada', dialCode: '+1', code: 'CA', flag: '🇨🇦' },
  { name: 'United Arab Emirates', dialCode: '+971', code: 'AE', flag: '🇦🇪' },
  { name: 'Saudi Arabia', dialCode: '+966', code: 'SA', flag: '🇸🇦' },
  { name: 'Turkey', dialCode: '+90', code: 'TR', flag: '🇹🇷' },
  { name: 'Ethiopia', dialCode: '+251', code: 'ET', flag: '🇪🇹' },
  { name: 'Nigeria', dialCode: '+234', code: 'NG', flag: '🇳🇬' },
  { name: 'Kenya', dialCode: '+254', code: 'KE', flag: '🇰🇪' },
  { name: 'Egypt', dialCode: '+20', code: 'EG', flag: '🇪🇬' },
  { name: 'South Africa', dialCode: '+27', code: 'ZA', flag: '🇿🇦' },
  { name: 'India', dialCode: '+91', code: 'IN', flag: '🇮🇳' },
  { name: 'Pakistan', dialCode: '+92', code: 'PK', flag: '🇵🇰' },
  { name: 'Indonesia', dialCode: '+62', code: 'ID', flag: '🇮🇩' },
  { name: 'Australia', dialCode: '+61', code: 'AU', flag: '🇦🇺' },
  { name: 'Brazil', dialCode: '+55', code: 'BR', flag: '🇧🇷' },
  { name: 'Spain', dialCode: '+34', code: 'ES', flag: '🇪🇸' },
  { name: 'Italy', dialCode: '+39', code: 'IT', flag: '🇮🇹' },
  { name: 'Russia', dialCode: '+7', code: 'RU', flag: '🇷🇺' },
  { name: 'Ukraine', dialCode: '+380', code: 'UA', flag: '🇺🇦' },
  { name: 'Poland', dialCode: '+48', code: 'PL', flag: '🇵🇱' },
  { name: 'Sweden', dialCode: '+46', code: 'SE', flag: '🇸🇪' },
  { name: 'Norway', dialCode: '+47', code: 'NO', flag: '🇳🇴' },
  { name: 'Switzerland', dialCode: '+41', code: 'CH', flag: '🇨🇭' },
  { name: 'Austria', dialCode: '+43', code: 'AT', flag: '🇦🇹' },
  { name: 'Belgium', dialCode: '+32', code: 'BE', flag: '🇧🇪' },
  { name: 'Portugal', dialCode: '+351', code: 'PT', flag: '🇵🇹' },
  { name: 'Greece', dialCode: '+30', code: 'GR', flag: '🇬🇷' },
  { name: 'Singapore', dialCode: '+65', code: 'SG', flag: '🇸🇬' },
  { name: 'Malaysia', dialCode: '+60', code: 'MY', flag: '🇲🇾' },
  { name: 'Japan', dialCode: '+81', code: 'JP', flag: '🇯🇵' },
  { name: 'South Korea', dialCode: '+82', code: 'KR', flag: '🇰🇷' },
  { name: 'China', dialCode: '+86', code: 'CN', flag: '🇨🇳' },
  { name: 'Hong Kong', dialCode: '+852', code: 'HK', flag: '🇭🇰' },
  { name: 'Taiwan', dialCode: '+886', code: 'TW', flag: '🇹🇼' },
  { name: 'Thailand', dialCode: '+66', code: 'TH', flag: '🇹🇭' },
  { name: 'Vietnam', dialCode: '+84', code: 'VN', flag: '🇻🇳' },
  { name: 'Philippines', dialCode: '+63', code: 'PH', flag: '🇵🇭' },
  { name: 'Mexico', dialCode: '+52', code: 'MX', flag: '🇲🇽' },
  { name: 'Argentina', dialCode: '+54', code: 'AR', flag: '🇦🇷' },
  { name: 'Colombia', dialCode: '+57', code: 'CO', flag: '🇨🇴' },
  { name: 'Chile', dialCode: '+56', code: 'CL', flag: 'CL' },
  { name: 'Peru', dialCode: '+51', code: 'PE', flag: '🇵🇪' },
  { name: 'Israel', dialCode: '+972', code: 'IL', flag: '🇮🇱' },
  { name: 'Qatar', dialCode: '+974', code: 'QA', flag: '🇶🇦' },
  { name: 'Kuwait', dialCode: '+965', code: 'KW', flag: '🇰🇼' },
  { name: 'Bahrain', dialCode: '+973', code: 'BH', flag: '🇧🇭' },
  { name: 'Oman', dialCode: '+968', code: 'OM', flag: '🇴🇲' },
  { name: 'Jordan', dialCode: '+962', code: 'JO', flag: '🇯🇴' },
  { name: 'Lebanon', dialCode: '+961', code: 'LB', flag: '🇱🇧' },
  { name: 'Ghana', dialCode: '+233', code: 'GH', flag: '🇬🇭' },
  { name: 'Morocco', dialCode: '+212', code: 'MA', flag: '🇲🇦' },
  { name: 'Algeria', dialCode: '+213', code: 'DZ', flag: '🇩🇿' },
  { name: 'Tunisia', dialCode: '+216', code: 'TN', flag: '🇹🇳' },
  { name: 'Kazakhstan', dialCode: '+7', code: 'KZ', flag: '🇰🇿' },
  { name: 'Uzbekistan', dialCode: '+998', code: 'UZ', flag: '🇺🇿' },
  { name: 'New Zealand', dialCode: '+64', code: 'NZ', flag: '🇳🇿' },
  { name: 'Ireland', dialCode: '+353', code: 'IE', flag: '🇮🇪' },
  { name: 'Denmark', dialCode: '+45', code: 'DK', flag: '🇩🇰' },
  { name: 'Finland', dialCode: '+358', code: 'FI', flag: '🇫🇮' },
  { name: 'Czech Republic', dialCode: '+420', code: 'CZ', flag: '🇨🇿' },
  { name: 'Hungary', dialCode: '+36', code: 'HU', flag: '🇭🇺' },
  { name: 'Romania', dialCode: '+40', code: 'RO', flag: '🇷🇴' },
];

export interface CountryPickerModalProps {
  visible: boolean;
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  selectedCountry,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES_DATA;
    return COUNTRIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (country: Country) => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(country);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search country name or code..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Country List */}
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => `${item.code}-${item.dialCode}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCountry.code;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[styles.countryRow, isSelected && styles.selectedRow]}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.countryName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.dialCode}>{item.dialCode}</Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.primary.DEFAULT} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedRow: {
    backgroundColor: 'rgba(42, 171, 238, 0.05)',
  },
  flag: {
    fontSize: 24,
    marginRight: 14,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  dialCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  checkIcon: {
    marginLeft: 10,
  },
});
