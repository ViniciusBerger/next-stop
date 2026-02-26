import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      if (isMounted) {
        setIsConnected(state.isConnected ?? false);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable ?? false);
        
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    });

    // Get initial state immediately
    NetInfo.fetch().then(state => {
      if (isMounted) {
        setIsConnected(state.isConnected ?? false);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable ?? false);
        setIsInitialized(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { 
    isConnected, 
    connectionType, 
    isInternetReachable,
    isInitialized 
  };
};