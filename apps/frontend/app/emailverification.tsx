import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import VerifiedBackground from "@/src/svgs/VerifiedBackground";
import { auth } from "@/src/config/firebase"; 
import { sendEmailVerification } from "firebase/auth";

export default function EmailVerificationScreen() {
    const router = useRouter();
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const checkVerification = async () => {
            const user = auth.currentUser;
            
            if (user) {
                // Reload the user to catch the 'verified' change
                await user.reload(); 
                if (user.emailVerified) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    // This moves them to the 'Success' screen
                    router.replace("/emailverified"); 
                }
            } else {
                router.replace("/login");
            }
        };

        // Poll every 3 seconds so the app feels responsive
        intervalRef.current = setInterval(checkVerification, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleResend = async () => {
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser);
                alert("Verification email resent!");
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    return (
        <View style={styles.background}>
            <View style={styles.content}>
                <VerifiedBackground/>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.message}>
                        A verification link has been sent to your email address. 
                        Please check your inbox. We'll move forward automatically once verified.
                    </Text>
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={{ color: '#7E9AFF', marginTop: 20, fontWeight: 'bold' }}>
                            Didn't receive an email? Resend
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 20, // Space between the SVG shape and the title
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        color: '#444',
        lineHeight: 22,
    }
});