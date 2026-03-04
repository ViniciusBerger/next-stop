import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchNoResultsProps {
  query: string;
  onClear?: () => void;
  onSuggestions?: () => void;
}

export const SearchNoResults = ({ query, onClear, onSuggestions }: SearchNoResultsProps) => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <Ionicons name="search-outline" size={60} color="#ccc" />
    </View>
    <Text style={styles.title}>No Results Found</Text>
    <Text style={styles.message}>
      We couldn't find any matches for "{query}". Try adjusting your search or filters.
    </Text>
    <View style={styles.actions}>
      {onClear && (
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onClear}>
          <Text style={styles.primaryButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
      {onSuggestions && (
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onSuggestions}>
          <Text style={styles.secondaryButtonText}>View Suggestions</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#7d77f0',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE4FF',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});