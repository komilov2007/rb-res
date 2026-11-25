importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js')

const firebaseConfig = {
	apiKey: 'AIzaSyBAQD7ncjCbdnmnxwmtNvzgDpHn10ZPFMk',
	authDomain: 'test-21809.firebaseapp.com',
	projectId: 'test-21809',
	storageBucket: 'test-21809.appspot.com',
	messagingSenderId: '339968482677',
	appId: '1:339968482677:web:8a4880e6e41fa0f511873c',
	measurementId: 'G-KYSLDC4VKM',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
	const notificationTitle = payload.data.title
	const notificationOptions = {
		body: payload.data.body,
		// icon: './logo.svg',
	}

	return self.registration.showNotification(notificationTitle, notificationOptions)
})
