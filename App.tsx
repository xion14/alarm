import React, { useEffect } from 'react';
import { View, Text, Button, Alert, Platform } from 'react-native';
import BackgroundActions from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);
  },
  requestPermissions: Platform.OS === 'ios'
});

// Create notification channel
PushNotification.createChannel(
  {
    channelId: "background-task-channel", // (required)
    channelName: "Background Task Channel", // (required)
    channelDescription: "A channel to categorize your background task notifications", // (optional) default: undefined.
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  console.log('Task started');

  let counter = 1

  while (BackgroundActions.isRunning()) {
 

    // Show notification every 5 seconds
    PushNotification.localNotification({
      channelId: "background-task-channel",
      title: "Background Task",
      message: `This is a notification from background task ${counter}`,
    });

    console.log(`Notification sent,${counter}`);

    counter++;
    await sleep(5000); // Wait for 5 seconds before sending the next notification
  }

  console.log('Task ended');


};

const options = {
  taskName: 'Example',
  taskTitle: 'Example Task',
  taskDesc: 'Example description',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // Optional: Provide a URI for the user to navigate to when they click on the notification
  parameters: {
    delay: 1000,
  },
};

const App = () => {
  useEffect(() => {
    return () => {
      BackgroundActions.stop();
    };
  }, []);

  const startBackgroundTask = async () => {
    try {
      console.log('Starting background task');
      await BackgroundActions.start(veryIntensiveTask, options);
    } catch (e) {
      console.error('Error', e);
      Alert.alert('Error', e.message);
    }
  };

  const stopBackgroundTask = async () => {
    try {
      console.log('Stopping background task');
      await BackgroundActions.stop();
    } catch (e) {
      console.error('Error', e);
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View>
      <Text>Background Actions Example</Text>
      <Button title="Start Background Task" onPress={startBackgroundTask} />
      <Button title="Stop Background Task" onPress={stopBackgroundTask} />
    </View>
  );
};

export default App;
