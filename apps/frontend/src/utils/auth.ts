import { Platform } from "react-native";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem("userToken");
  }
  return await getItemAsync("userToken");
};

export const setToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem("userToken", token);
  } else {
    await setItemAsync("userToken", token);
  }
};

export const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem("userToken");
  } else {
    await deleteItemAsync("userToken");
  }
};

export const setRole = async (role: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem("userRole", role);
  } else {
    await setItemAsync("userRole", role);
  }
};

export const getRole = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem("userRole");
  }
  return await getItemAsync("userRole");
};

export const removeRole = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem("userRole");
  } else {
    await deleteItemAsync("userRole");
  }
};