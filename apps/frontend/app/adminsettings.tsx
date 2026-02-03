import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { AdminScreenLayout } from "@/components/adminScreenLayout";
import { Ionicons } from '@expo/vector-icons';

//FIREBASE IMPORTS (Commented out until ready)
// import { db } from "@/src/service/firebase";
// import { doc, updateDoc, onSnapshot } from "firebase/firestore";

export default function AdminSettingsScreen() {
  const [isGoogleApiActive, setIsGoogleApiActive] = useState(true);
  const [isStripeActive, setIsStripeActive] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  // New States for Privacy & Data
  const [isAnonymizeData, setIsAnonymizeData] = useState(false);
  const [isLocationHistoryActive, setIsLocationHistoryActive] = useState(true);

  /* //REAL-TIME SYNC WITH FIRESTORE
  useEffect(() => {
    const configRef = doc(db, "system", "config");
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsGoogleApiActive(data.googleMapsEnabled);
        setIsStripeActive(data.stripeEnabled);
        setIsMaintenanceMode(data.maintenanceMode);
        setIsAnonymizeData(data.anonymizeData);
        setIsLocationHistoryActive(data.locationHistoryEnabled);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateSystemConfig = async (key: string, value: boolean) => {
    try {
      const configRef = doc(db, "system", "config");
      await updateDoc(configRef, {
        [key]: value,
        lastUpdatedBy: "admin_user_id",
        updatedAt: new Date()
      });
    } catch (error) {
      Alert.alert("Error", "Action failed. Check permissions.");
    }
  };
  */

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    // updateSystemConfig(key, value); 
  };

  const toggleMaintenance = (value: boolean) => {
    Alert.alert(
      "Confirm Action",
      value 
        ? "Activating Maintenance Mode will restrict app access. Continue?"
        : "Deactivating Maintenance Mode will restore app access. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: () => {
            setIsMaintenanceMode(value);
            // updateSystemConfig("maintenanceMode", value);
          } 
        }
      ]
    );
  };

  return (
    <AdminScreenLayout showBack={true}>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>System Control</Text>

        <View style={styles.statusBanner}>
          <View style={[styles.statusDot, { backgroundColor: isMaintenanceMode ? '#dc2626' : '#37E9BB' }]} />
          <Text style={styles.statusLabel}>
            {isMaintenanceMode ? "System: Maintenance Mode" : "System: Healthy"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>API SERVICES</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.textColumn}>
              <Text style={styles.settingLabel}>Google Maps API</Text>
              <Text style={styles.subLabel}>Core location & search services</Text>
            </View>
            <Switch 
              value={isGoogleApiActive} 
              onValueChange={(v) => handleToggle("googleMapsEnabled", v, setIsGoogleApiActive)}
              trackColor={{ false: "#D1D1D1", true: "#37E9BB" }}
            />
          </View>

          <View style={[styles.settingRow, styles.borderTop]}>
            <View style={styles.textColumn}>
              <Text style={styles.settingLabel}>Google Photos API</Text>
              <Text style={styles.subLabel}>Location-based visual data</Text>
            </View>
            <Switch 
              value={isStripeActive} 
              onValueChange={(v) => handleToggle("stripeEnabled", v, setIsStripeActive)}
              trackColor={{ false: "#D1D1D1", true: "#37E9BB" }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitleDark}>ADDITIONS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.buttonRow} activeOpacity={0.7}>
            <Ionicons name="megaphone-outline" size={22} color="#7E9AFF" />
            <Text style={styles.buttonText}>Schedule Announcement</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonRow, styles.borderTop]} activeOpacity={0.7}>
            <Ionicons name="ribbon-outline" size={22} color="#7E9AFF" />
            <Text style={styles.buttonText}>Manage Badges</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonRow, styles.borderTop]} activeOpacity={0.7}>
            <Ionicons name="filter-outline" size={22} color="#7E9AFF" />
            <Text style={styles.buttonText}>Manage Filters</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* --- PRIVACY & DATA SECTION --- */}
        <Text style={styles.sectionTitleDark}>PRIVACY & DATA</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.textColumn}>
              <Text style={styles.settingLabel}>Location History</Text>
              <Text style={styles.subLabel}>Store user movement for heatmap</Text>
            </View>
            <Switch 
              value={isLocationHistoryActive} 
              onValueChange={(v) => handleToggle("locationHistoryEnabled", v, setIsLocationHistoryActive)}
              trackColor={{ false: "#D1D1D1", true: "#37E9BB" }}
            />
          </View>

          <TouchableOpacity style={[styles.buttonRow, styles.borderTop]} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={22} color="#dc2626" />
            <Text style={[styles.buttonText, {color: '#dc2626'}]}>Purge Cached Data</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleDark}>EMERGENCY STOP</Text>
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.settingRow}>
            <View style={styles.textColumn}>
              <Text style={[styles.settingLabel, { color: '#dc2626' }]}>Maintenance Mode</Text>
              <Text style={styles.subLabel}>Restrict app access to Admins only</Text>
            </View>
            <Switch 
              value={isMaintenanceMode} 
              onValueChange={toggleMaintenance}
              trackColor={{ false: "#D1D1D1", true: "#dc2626" }}
            />
          </View>
        </View>
      </View>
    </AdminScreenLayout>
  );
}
const styles = StyleSheet.create({
  contentContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
},
  titleText: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 20, 
    marginTop: -10 
},
  statusBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    alignSelf: 'center', 
    marginBottom: 30,
    marginTop: 5
},
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8 
},
  statusLabel: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: 0.5 
},
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#ffffff', 
    marginBottom: 8,
    marginTop: 15,
    marginLeft: 5, 
    letterSpacing: 1 
},
  sectionTitleDark: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#000000', 
    marginBottom: 8,
    marginTop: 15,
    marginLeft: 5, 
    letterSpacing: 1 
},
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    marginBottom: 25, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
},
  dangerCard: { 
    borderWidth: 1, 
    borderColor: 'rgba(220, 38, 38, 0.2)' 
},
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16 
},
  buttonRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18 
},
  borderTop: { 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
},
  textColumn: { 
    flex: 1, 
    paddingRight: 10 
},
  settingLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
},
  subLabel: { 
    fontSize: 13, 
    color: '#888', 
    marginTop: 2 
},
  buttonText: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginLeft: 12 
},
});