import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { ScreenLayout } from "@/components/screenLayout";
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackReportScreen() {
  const [type, setType] = useState<"feedback" | "issue" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSend = () => {
    // UI Only for now
    console.log("Sending:", { type, title, description });
  };

  return (
    <ScreenLayout showBack={true}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>Feedback / Report</Text>

        {/* The Main Card Container */}
        <View style={styles.reportCard}>
          <Ionicons name="warning-outline" size={80} color="#000" style={styles.mainIcon} />

          {/* Type Selection Section */}
          <View style={styles.selectionSection}>
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setType("feedback")}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, type === "feedback" && styles.checkboxActive]}>
                {type === "feedback" && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>Send feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setType("issue")}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, type === "issue" && styles.checkboxActive]}>
                {type === "issue" && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>Report an issue</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput 
              style={styles.input}
              placeholder="Summary of the issue..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Give us more details..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  reportCard: {
    backgroundColor: '#E7EEFF', // Light blue background for the card
    borderRadius: 35,
    padding: 25,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mainIcon: {
    marginBottom: 15,
  },
  selectionSection: {
    alignSelf: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#FFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#5962ff',
    borderColor: '#5962ff',
  },
  checkboxLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#C8D7FF', // Slightly darker blue for inputs
    borderWidth: 1,
    borderColor: '#5962ff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#7d77f0',
    height: 60,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});