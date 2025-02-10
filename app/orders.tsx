import React, { useEffect, useState } from "react"; 
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Card, Text, Appbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, ref, query, orderByChild, equalTo } from "firebase/database"; 
import { db } from "./firebaseConfig"; 
import { useRouter } from "expo-router";

// Définition des types
interface Ingredient {
  quantite: number;
  unite: string;
}

interface Dish {
  id: string;
  nom: string;
  recette?: string;
  prix: number;
  ingredients: Record<string, Ingredient>;
}

interface Commande {
  etat_paiement: string;
  plats: Record<string, { quantite: number }>;
  status: string;
  user_id: string;
}

const Orders = () => {
  const [user, setUser] = useState<string | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [plats, setPlats] = useState<{ [key: string]: Dish }>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchCommandes();
    fetchPlats();
  }, []);

  // Récupérer les informations de l'utilisateur depuis AsyncStorage
  const fetchUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.name);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
    }
  };

  // Récupérer les commandes depuis Firebase Realtime Database en filtrant par user_id et status, etat_paiement
  const fetchCommandes = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(storedUser);
      const commandesRef = ref(db, "commandes"); // Référence à la base de données des commandes
      console.log(commandesRef)

      // Requête combinée pour filtrer par user_id, status et etat_paiement
      const commandesQuery = query(
        commandesRef,
        orderByChild("user_id"),
        equalTo(parsedUser.id)
      );

      const snapshot = await get(commandesQuery);
      const commandesData: Commande[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const commande = childSnapshot.val();
          if (commande.status === "En attente" && commande.etat_paiement === "En attente") {
            commandesData.push({
              ...commande,
              id: childSnapshot.key, 
            });
          }
        });
        setCommandes(commandesData); 
      } else {
        console.log("Aucune commande trouvée pour cet utilisateur.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  // Récupérer les plats depuis Firebase Realtime Database
  const fetchPlats = async () => {
    try {
      const platsRef = ref(db, "plats"); 
      const snapshot = await get(platsRef);

      const platsData: { [key: string]: Dish } = {};

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const plat = childSnapshot.val();
          platsData[childSnapshot.key] = plat; 
        });
        setPlats(platsData); 
        console.log("Plats récupérés:", platsData); 
      } else {
        console.log("Aucun plat trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des plats:", error);
    } finally {
      setLoading(false); 
    }
  };

  // Rendu d'une commande dans la liste
  const renderCommandeItem = ({ item }: { item: Commande }) => {
    let totalCommande = 0;

    const renderPlats = Object.keys(item.plats).map((platId) => {
      const plat = plats[platId];
      if (!plat) return null; 
      const totalPlat = plat.prix * item.plats[platId].quantite;
      totalCommande += totalPlat;

      return (
        <Text key={platId} style={styles.platText}>
          - {plat.nom} ({plat.prix} €) x {item.plats[platId].quantite} = {totalPlat.toFixed(2)} €
        </Text>
      );
    });

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.titleC}>#{item.id}</Text>
          <View>{renderPlats}</View>
          <Text style={styles.total}>Prix total: {totalCommande.toFixed(2)} €</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={user ? `Bonjour, ${user}` : "Chargement..."} titleStyle={styles.title} />
        <Appbar.Action icon="home" onPress={() => router.push("/plats")} />
        <Appbar.Action icon="exit-to-app" onPress={() => router.push("/login")} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <View style={styles.commandesContainer}>
          <Text style={styles.sectionTitle}>Commandes en cours</Text>
          <FlatList
            data={commandes}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderCommandeItem}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f4f4f4" },
  appbar: { elevation: 0 },
  card: { marginBottom: 10, padding: 10, backgroundColor: "#fff", borderRadius: 8, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  titleC: { fontSize: 18, fontWeight: "bold", marginLeft: 8, marginBottom:10 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#0085ff", padding:10, paddingTop:20 },
  commandesContainer: { flex: 1 },
  platText: { fontSize: 16, fontWeight: "normal", marginBottom: 5 },
  total: { fontSize: 16, fontWeight: "normal", color: "#000", marginTop: 5, marginLeft: 10 },
});

export default Orders;
