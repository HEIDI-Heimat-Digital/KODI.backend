const admin = require("firebase-admin");
const database = require("./database");
const tables = require("../constants/tableNames");
const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE || "{}");

async function sendPushNotificationToAll(topic="warnings", title="New Notification", body="Check it out", data=null) {

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const message = {
        topic,
        notification: {
            title,
            body
        },
        data
    }
    
    try {
        await admin.messaging().send(message)
    } catch (err) {
        return false
    }
    return true
}


async function sendPushNotificationsToUser(userId, title="BreakingNews", body="Check it out", data=null) {

    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    }, "Test");

    const response = await database.get(tables.FIREBASE_TOKEN, { userId });
    if(!response || response.rows?.length === 0) {
        return false
    }
    response.rows.map(async (token) => {
        const message = {
            token:token.firebaseToken,
            notification: {
                title,
                body
            },
            data
        }
        await firebaseAdmin.messaging().send(message)
    })
    return true
}

module.exports = { sendPushNotificationToAll, sendPushNotificationsToUser }