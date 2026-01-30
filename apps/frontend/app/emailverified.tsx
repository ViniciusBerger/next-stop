import React, { useEffect } from "react";
import SuccessBackground from "@/src/svgs/SuccessBackground";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function EmailVerifiedScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/home");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.background}>
            <View style={styles.content}>
                <SuccessBackground/>
                
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Email Verified!</Text>
                    <Text style={styles.message}>
                        Redirecting you to the home page...
                    </Text>
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
        marginTop: 20,
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