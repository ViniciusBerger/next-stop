import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  category: string | null;
  distance: number | null;
  rating: number | null;
  priceLevel: number | null;
}

interface PlaceFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

const CATEGORIES = ['Restaurant', 'Cafe', 'Bar', 'Park', 'Museum', 'Gym', 'Cinema',];
const DISTANCES = [{ label: '1km', value: 1000 }, { label: '5km', value: 5000 }, { label: '10km', value: 10000 }];
const RATINGS = [{ label: '3+', value: 3 }, { label: '4+', value: 4 }, { label: '4.5+', value: 4.5 }];
const PRICES = [{ label: '$', value: 1 }, { label: '$$', value: 2 }, { label: '$$$', value: 3 }, { label: '$$$$', value: 4 }];

export const PlaceFilter = ({ onFilterChange }: PlaceFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    distance: null,
    rating: null,
    priceLevel: null,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const updated = {
      ...filters,
      [key]: filters[key] === value ? null : value, // toggle off if same value
    };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearAll = () => {
    const cleared = { category: null, distance: null, rating: null, priceLevel: null };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeCount = Object.values(filters).filter(v => v !== null).length;

  return (
    <View style={styles.wrapper}>
      {/* Filter Toggle Button */}
      <TouchableOpacity
        style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons name="funnel-outline" size={20} color={activeCount > 0 ? '#fff' : '#fff'} />
        {activeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown Panel */}
      {isOpen && (
        <View
          style={styles.dropdown}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Filters</Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onStartShouldSetResponderCapture={() => true}
            keyboardShouldPersistTaps="handled"
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, filters.category === cat && styles.chipActive]}
                onPress={() => updateFilter('category', cat)}
              >
                <Text style={[styles.chipText, filters.category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Distance */}
          <Text style={styles.sectionLabel}>Distance</Text>
          <View style={styles.chipRowStatic}>
            {DISTANCES.map(d => (
              <TouchableOpacity
                key={d.value}
                style={[styles.chip, filters.distance === d.value && styles.chipActive]}
                onPress={() => updateFilter('distance', d.value)}
              >
                <Text style={[styles.chipText, filters.distance === d.value && styles.chipTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.sectionLabel}>Rating</Text>
          <View style={styles.chipRowStatic}>
            {RATINGS.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.chip, filters.rating === r.value && styles.chipActive]}
                onPress={() => updateFilter('rating', r.value)}
              >
                <Text style={[styles.chipText, filters.rating === r.value && styles.chipTextActive]}>
                  ⭐ {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Level */}
          <Text style={styles.sectionLabel}>Price</Text>
          <View style={styles.chipRowStatic}>
            {PRICES.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[styles.chip, filters.priceLevel === p.value && styles.chipActive]}
                onPress={() => updateFilter('priceLevel', p.value)}
              >
                <Text style={[styles.chipText, filters.priceLevel === p.value && styles.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
    marginRight: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#7d77f0',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 14,
    color: '#7d77f0',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    marginBottom: 12,
  },
  chipRowContent: {
    paddingRight: 8,
  },
  chipRowStatic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: '#f0f2ff',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#7d77f0',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});