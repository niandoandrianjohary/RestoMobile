import React, { useState } from "react";
import { Button } from "react-native-paper";
import axios from "axios";

interface OrderButtonProps {
  selectedDishes: {
    etat_paiement: string;
    plats: { [id: string]: { quantite: number } };
    status: string;
    user_id: string | null;
  };
}

const API_ORDER_URL = "http://localhost:8000/api/firebase/commandes"; // Remplace avec l'URL de l'API des commandes

const OrderButton: React.FC<OrderButtonProps> = ({ selectedDishes }) => {
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (Object.keys(selectedDishes.plats).length === 0) {
      alert("Aucun plat sélectionné !");
      return;
    }

    setLoading(true);

    // Création des données de la commande avec la bonne structure
    const orderData = {
      etat_paiement: selectedDishes.etat_paiement,
      plats: selectedDishes.plats, // Utilisation des plats directement
      status: selectedDishes.status,
      user_id: selectedDishes.user_id, // L'id de l'utilisateur
    };

    try {
      const response = await axios.post(API_ORDER_URL, orderData); // Envoi des données modifiées
      alert("Commande passée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
      alert("Erreur lors de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button mode="contained" onPress={handleOrder} loading={loading} disabled={loading}>
      Commander
    </Button>
  );
};

export default OrderButton;
