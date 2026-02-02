import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { X, Filter, MapPin, Calendar, Users, ChevronDown } from 'lucide-react-native';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { useThemeStore, useGamesStore } from '@/store';
import { CITIES, GAME_FORMATS, GameFormat } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants';

interface GameFiltersProps {
  visible: boolean;
  onClose: () => void;
}

export function GameFilters({ visible, onClose }: GameFiltersProps) {
  const { theme } = useThemeStore();
  const { filters, setFilters, fetchGames } = useGamesStore();

  const [selectedCity, setSelectedCity] = useState<string | null>(filters.city || null);
  const [selectedFormat, setSelectedFormat] = useState<GameFormat | null>(filters.format || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(filters.date || null);
  const [publicOnly, setPublicOnly] = useState(filters.publicOnly || false);

  // Generate date options (today + next 7 days)
  const dateOptions = Array.from({ length: 8 }).map((_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'היום' : i === 1 ? 'מחר' : format(date, 'EEEE, d/M', { locale: he }),
    };
  });

  const handleApply = () => {
    setFilters({
      city: selectedCity,
      format: selectedFormat,
      date: selectedDate,
      publicOnly,
    });
    fetchGames();
    onClose();
  };

  const handleReset = () => {
    setSelectedCity(null);
    setSelectedFormat(null);
    setSelectedDate(null);
    setPublicOnly(false);
    setFilters({
      city: null,
      format: null,
      date: null,
      publicOnly: false,
    });
    fetchGames();
  };

  const hasActiveFilters =
    selectedCity || selectedFormat || selectedDate || publicOnly;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>סינון משחקים</Text>
          <TouchableOpacity onPress={handleReset} disabled={!hasActiveFilters}>
            <Text
              style={[
                styles.resetText,
                { color: hasActiveFilters ? Colors.primary[500] : theme.colors.muted },
              ]}
            >
              איפוס
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* City filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={Colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                עיר
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <FilterChip
                  label="הכל"
                  selected={selectedCity === null}
                  onPress={() => setSelectedCity(null)}
                />
                {CITIES.map((city) => (
                  <FilterChip
                    key={city}
                    label={city}
                    selected={selectedCity === city}
                    onPress={() => setSelectedCity(city)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Format filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={Colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                פורמט
              </Text>
            </View>
            <View style={styles.chipRow}>
              <FilterChip
                label="הכל"
                selected={selectedFormat === null}
                onPress={() => setSelectedFormat(null)}
              />
              {GAME_FORMATS.map((format) => (
                <FilterChip
                  key={format.value}
                  label={format.label}
                  selected={selectedFormat === format.value}
                  onPress={() => setSelectedFormat(format.value)}
                />
              ))}
            </View>
          </View>

          {/* Date filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                תאריך
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <FilterChip
                  label="הכל"
                  selected={selectedDate === null}
                  onPress={() => setSelectedDate(null)}
                />
                {dateOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    selected={selectedDate === option.value}
                    onPress={() => setSelectedDate(option.value)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Public only toggle */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.toggleRow,
                { backgroundColor: theme.colors.card },
              ]}
              onPress={() => setPublicOnly(!publicOnly)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, { color: theme.colors.text }]}>
                הצג רק משחקים פתוחים
              </Text>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: publicOnly
                      ? Colors.primary[500]
                      : 'transparent',
                    borderColor: publicOnly
                      ? Colors.primary[500]
                      : theme.colors.border,
                  },
                ]}
              >
                {publicOnly && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Apply button */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Button title="החל סינון" onPress={handleApply} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

// Filter chip component
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? Colors.primary[500] : theme.colors.card,
          borderColor: selected ? Colors.primary[500] : theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#FFFFFF' : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Quick filter bar for home screen
interface QuickFilterBarProps {
  onFilterPress: () => void;
  activeFiltersCount: number;
}

export function QuickFilterBar({ onFilterPress, activeFiltersCount }: QuickFilterBarProps) {
  const { theme } = useThemeStore();
  const { filters, setFilters, fetchGames } = useGamesStore();

  const quickFilters = [
    { label: 'היום', date: format(new Date(), 'yyyy-MM-dd') },
    { label: 'מחר', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
  ];

  return (
    <View style={styles.quickFilterBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFiltersCount > 0 ? Colors.primary[500] : theme.colors.card,
              borderColor: activeFiltersCount > 0 ? Colors.primary[500] : theme.colors.border,
            },
          ]}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Filter size={16} color={activeFiltersCount > 0 ? '#FFFFFF' : theme.colors.text} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter.date}
            style={[
              styles.chip,
              {
                backgroundColor:
                  filters.date === filter.date
                    ? Colors.primary[500]
                    : theme.colors.card,
                borderColor:
                  filters.date === filter.date
                    ? Colors.primary[500]
                    : theme.colors.border,
              },
            ]}
            onPress={() => {
              setFilters({
                date: filters.date === filter.date ? null : filter.date,
              });
              fetchGames();
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    filters.date === filter.date ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  resetText: {
    fontSize: FontSizes.base,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  toggleText: {
    fontSize: FontSizes.base,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  quickFilterBar: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  filterButton: {
    width: 40,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
