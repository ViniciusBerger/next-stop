import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChartProps {
  data: number[];
  labels: string[];
  color: string;
  height?: number;
}

export const Chart = ({ data, labels, color, height = 150 }: ChartProps) => {
  const maxValue = Math.max(...data);

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { height }]}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * height;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      backgroundColor: color,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{labels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '60%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
  },
});