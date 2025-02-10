import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import {useRouter} from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Initialiser useRouter ici

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email,
        password
      });

      if (response.status === 200) {
        const userData = response.data; // Récupère les données utilisateur depuis la réponse API
        localStorage.setItem('user', JSON.stringify(userData)); // Sauvegarde dans le localStorage (seulement pour une app web)

        Alert.alert('Success', 'Login successful!');
        
        // Utilisation de window.location.href pour naviguer vers la page Home
        // window.location.href = '/home'; // Redirige vers /home après connexion réussie
        router.push('/plats');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    width: '100%',
    padding: 8,
  },
});

export default LoginScreen;
