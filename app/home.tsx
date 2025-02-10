import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const HomeScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('user'); // Récupération des données utilisateur depuis le localStorage
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Mise à jour de l'état avec les données utilisateur
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {user?.name || 'User'}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Phone: {user?.phone || 'N/A'}</Text>
      <Text>Role: {user?.role}</Text>
      <Text>Active: {user?.isActive ? 'Yes' : 'No'}</Text>
      <Text>Created At: {user?.createdAt}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HomeScreen;
