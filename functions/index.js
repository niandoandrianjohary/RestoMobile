const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotificationOnCommandeUpdate = functions.database
  .ref('/commandes/{commandeId}')
  .onUpdate(async (change, context) => {
    const commandeData = change.after.val();
    
    // Vérifiez si le statut de la commande est passé à "prête"
    if (commandeData.status === 'prête') {
      const userId = commandeData.user_id;

      // Récupérer le token FCM de l'utilisateur à partir de Firebase Database
      const userSnapshot = await admin.database().ref(`/users/${userId}`).once('value');
      const user = userSnapshot.val();
      
      if (user && user.fcmToken) {
        // Envoi de la notification via FCM
        const message = {
          notification: {
            title: 'Votre commande est prête !',
            body: `La commande #${commandeData.id} est prête à être récupérée.`,
          },
          token: user.fcmToken, // Token FCM de l'utilisateur
        };

        try {
          // Envoi de la notification
          await admin.messaging().send(message);
          console.log('Notification envoyée avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification:', error);
        }
      }
    }
  });
