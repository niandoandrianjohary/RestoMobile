import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// 📢 Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔥 Demande de permission et récupération du token Expo
const requestNotificationPermission = async () => {
  if (!Device.isDevice) {
    console.warn("⚠️ Les notifications push ne fonctionnent pas sur un émulateur.");
    return null;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("🚫 Permission de notification refusée.");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("🔑 Token Expo:", token);
  return token;
};

export { requestNotificationPermission, Notifications };
