import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  // Mock user data
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "Toronto, Canada",
    joinDate: "January 2024",
    bio: "Travel enthusiast exploring new cafes and restaurants",
    stats: {
      saved: 24,
      reviews: 12,
      badges: 5
    }
  };

  const menuItems = [
    { icon: "✏️", label: "Edit Profile", color: "#3B82F6" },
    { icon: "❤️", label: "Saved Places", color: "#EF4444" },
    { icon: "⭐", label: "My Reviews", color: "#F59E0B" },
    { icon: "⚙️", label: "Settings", color: "#6B7280" },
    // 🔥 ADDED: Admin Dashboard Access
    { icon: "🛡️", label: "Admin Dashboard", color: "#1F2937" },
    { icon: "🚪", label: "Log Out", color: "#DC2626" },
  ];

  const handleMenuItemPress = (label: string) => {
    console.log(label);
    
    // Special handling for Admin Dashboard
    if (label === "Admin Dashboard") {
      Alert.alert(
        "Admin Access",
        "Navigate to Admin Dashboard?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Go to Admin", 
            onPress: () => {
              // In real app: router.push('/(admin)/dashboard');
              Alert.alert(
                "Admin Dashboard", 
                "Admin dashboard would open here.\n\nYou would see:\n• User Management\n• Content Management\n• System Analytics\n• Moderation Tools",
                [{ text: "OK" }]
              );
            }
          }
        ]
      );
    } else if (label === "Log Out") {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log Out", style: "destructive", onPress: () => console.log("Logged out") }
        ]
      );
    } else {
      // For other menu items
      Alert.alert(label, `${label} feature would open here`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>View and manage your account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => handleMenuItemPress("Edit Profile")}
            >
              <Text style={styles.editAvatarText}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userBio}>{userData.bio}</Text>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.stats.saved}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.stats.reviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.stats.badges}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Text>📧</Text>
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Text>📱</Text>
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{userData.phone}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Text>📍</Text>
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{userData.location}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text>📅</Text>
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Member Since</Text>
                <Text style={styles.contactValue}>{userData.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Profile Options</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem,
                item.label === "Admin Dashboard" && styles.adminMenuItem
              ]}
              onPress={() => handleMenuItemPress(item.label)}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Admin Note (Optional) */}
        <View style={styles.adminNote}>
          <Text style={styles.adminNoteText}>
            💡 <Text style={styles.adminNoteBold}>Admin Access:</Text> 
            Tap "Admin Dashboard" to access administrator features including user management, content moderation, and system analytics.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    right: '40%',
    bottom: 0,
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  editAvatarText: {
    fontSize: 18,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  contactContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  adminMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#1F2937',
    backgroundColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  adminNote: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  adminNoteText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  adminNoteBold: {
    fontWeight: '600',
  },
});