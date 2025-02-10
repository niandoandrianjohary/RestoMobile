import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Card, Text, Checkbox, IconButton, Appbar, Badge } from "react-native-paper";
import { get, ref, query, orderByChild, equalTo } from "firebase/database"; // Import de get et ref
import { db } from "./firebaseConfig"; // Import de db depuis firebaseConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderButton from "./OrderButton";
import { useRouter } from "expo-router";

interface Ingredient {
  quantite: number;
  unite: string;
}

interface Dish {
  id: string;
  name: string;
  recipe?: string;
  price: number;
  ingredients: Record<string, Ingredient>;
  quantity?: number;
}

const DishList = () => {
  const [user, setUser] = useState<string | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<{
    etat_paiement: string;
    plats: { [id: string]: { quantite: number } };
    status: string;
    user_id: string | null;
  }>({
    etat_paiement: "En attente",
    plats: {},
    status: "En attente",
    user_id: "", // User will be populated later
  });
  const [loading, setLoading] = useState(true);
  const [commandeCount, setCommandeCount] = useState<number>(0); // État pour le comptage des commandes
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchDishes();
    fetchCommandes(); // Appel à la fonction pour compter les commandes
  }, []);

  // Récupérer l'utilisateur depuis AsyncStorage
  const fetchUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.name);
        setSelectedDishes((prev) => ({
          ...prev,
          user_id: parsedUser.id, // User id pour filtrer les commandes
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
    }
  };

  // Récupérer les plats depuis Firebase
  const fetchDishes = async () => {
    try {
      const dishesRef = ref(db, "plats");
      const snapshot = await get(dishesRef);

      if (snapshot.exists()) {
        const dishesArray: Dish[] = [];
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          dishesArray.push({
            id: childSnapshot.key!,
            name: data.nom,
            recipe: data.recette,
            price: data.prix,
            ingredients: data.ingredients || {},
          });
        });
        setDishes(dishesArray);
      } else {
        console.log("Aucun plat trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des plats:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedDishes)

  // Récupérer et compter les commandes avec status et etat_paiement spécifiques
  const fetchCommandes = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(storedUser);
      const commandesRef = ref(db, "commandes");

      const commandesQuery = query(
        commandesRef,
        orderByChild("user_id"),
        equalTo(parsedUser.id)
      );

      const snapshot = await get(commandesQuery);
      const commandesData: any[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const commande = childSnapshot.val();
          if (commande.status === "En attente" && commande.etat_paiement === "En attente") {
            commandesData.push(commande);
          }
        });
        setCommandeCount(commandesData.length); // Mise à jour du nombre de commandes filtrées
      } else {
        console.log("Aucune commande trouvée.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Gestion de la sélection d'un plat
  const toggleSelectDish = (dish: Dish) => {
    setSelectedDishes((prev) => {
      const newSelected = { ...prev };
      if (newSelected.plats[dish.id]) {
        delete newSelected.plats[dish.id];
      } else {
        newSelected.plats[dish.id] = { quantite: 1 };
      }
      return newSelected;
    });
  };

  // Incrémentation de la quantité d'un plat
  const incrementQuantity = (id: string) => {
    setSelectedDishes((prev) => {
      const newSelected = { ...prev };
      if (newSelected.plats[id]) {
        newSelected.plats[id].quantite += 1;
      }
      return newSelected;
    });
  };

  // Décrémentation de la quantité d'un plat
  const decrementQuantity = (id: string) => {
    setSelectedDishes((prev) => {
      const newSelected = { ...prev };
      if (newSelected.plats[id] && newSelected.plats[id].quantite > 1) {
        newSelected.plats[id].quantite -= 1;
      } else {
        delete newSelected.plats[id];
      }
      return newSelected;
    });
  };

  const renderItem = ({ item }: { item: Dish }) => {
    const isSelected = selectedDishes.plats.hasOwnProperty(item.id);
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Checkbox
              status={isSelected ? "checked" : "unchecked"}
              onPress={() => toggleSelectDish(item)}
            />
            <Text style={styles.title}>{item.name} ({item.price} €)</Text>
          </View>
          <Text>{item.recipe || "Aucune recette"}</Text>

          {isSelected && (
            <View style={styles.quantityContainer}>
              <IconButton icon="minus" onPress={() => decrementQuantity(item.id)} />
              <Text style={styles.quantityText}>{selectedDishes.plats[item.id]?.quantite || 1}</Text>
              <IconButton icon="plus" onPress={() => incrementQuantity(item.id)} />
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={user ? `Bonjour, ${user}` : "Chargement..."} titleStyle={styles.title} />
        
        {/* Conteneur pour l'icône et le badge */}
        <View style={styles.iconContainer}>
          <Appbar.Action icon="clipboard-list" onPress={() => router.push("/orders")} />
          {commandeCount > 0 && (
            <Badge style={styles.notificationBadge}>{commandeCount}</Badge> // Badge avec le nombre de commandes
          )}
        </View>
        
        <Appbar.Action icon="exit-to-app" onPress={handleLogout} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <>
          <FlatList data={dishes} keyExtractor={(item) => item.id} renderItem={renderItem} />
          <View style={styles.buttonContainer}>
            <OrderButton selectedDishes={selectedDishes} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f4f4f4" },
  appbar: { elevation: 0 },
  card: { marginBottom: 10, padding: 10, backgroundColor: "#fff", borderRadius: 8, elevation: 3 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  quantityText: { fontSize: 16, marginHorizontal: 8 },
  buttonContainer: { marginTop: 20, padding: 10, alignItems: "center" },
  iconContainer: { position: "relative" }, // Conteneur pour positionner l'icône et le badge
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF0000",
    color: "#fff",
    fontSize: 12,
    borderRadius: 12,
  },
});

export default DishList;
