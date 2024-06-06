import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Platform, StyleSheet } from 'react-native';
import BackgroundActions from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';
import DatePicker from 'react-native-date-picker';

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
    channelId: "background-task-channel",
    channelName: "Background Task Channel",
    channelDescription: "A channel to categorize your background task notifications",
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`)
);

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskDataArguments) => {
  const { alarmTime } = taskDataArguments;
  console.log('Task started');

  while (BackgroundActions.isRunning()) {
    const now = new Date();
    if (
      now.getHours() === alarmTime.getHours() &&
      now.getMinutes() === alarmTime.getMinutes() &&
      now.getSeconds() === alarmTime.getSeconds()
    ) {
      PushNotification.localNotification({
        channelId: "background-task-channel",
        title: "Alarm",
        message: "It's time!",
      });

      console.log("Alarm triggered");
      await BackgroundActions.stop();
      break;
    }

    await sleep(1000); // Check every second
  }

  console.log('Task ended');
};

const options = {
  taskName: 'Alarm',
  taskTitle: 'Alarm Task',
  taskDesc: 'Alarm running in background',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane',
  parameters: {
    delay: 1000,
  },
};

const App = () => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [alarmTime, setAlarmTime] = useState(null);

  useEffect(() => {
    return () => {
      BackgroundActions.stop();
    };
  }, []);

  const startBackgroundTask = async (alarmDate) => {
    try {
      console.log('Starting background task');
      await BackgroundActions.start(veryIntensiveTask, { ...options, parameters: { alarmTime: alarmDate } });
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

  const alarmOn = (selectedDate) => {
    setOpen(false);
    setAlarmTime(selectedDate);
    setDate(selectedDate);
    startBackgroundTask(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text>Background Actions Example</Text>

      <Button title="Open" onPress={() => setOpen(true)} />
      <DatePicker
        modal
        open={open}
        date={date}
        onConfirm={(date) => {
          alarmOn(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />

      <Button title="Stop Background Task" onPress={stopBackgroundTask} />
      <Text>{date.toLocaleTimeString()}</Text>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});
