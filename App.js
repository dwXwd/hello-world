import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView } from 'react-native';
// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// import react native gesture handler
import 'react-native-gesture-handler';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }





  // alert the user input
  alertMyText(input = []) {
    Alert.alert(input.text);
  }

  render() {
      // Create the navigator
    return (
      
      <NavigationContainer>
              <Stack.Navigator
        initialRouteName="Start"
      >
        <Stack.Screen
          name="Start"
          component={Start}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
      </Stack.Navigator>
                {/*   <View style={styles.container}>

added a new text-input
          <View style={{ flex: 30, justifyContent: 'center' }}>
            <TextInput
              style={{ height: 80, backgroundColor: 'white', borderColor: 'gray', borderWidth: 1 }}
              onChangeText={(text) => this.setState({ text })}
              value={this.state.text}
              placeholder='Type here ...'

            />
            <Text>You wrote: {this.state.text}</Text>
            <Button
              onPress={() => {
                this.alertMyText({ text: this.state.text });
              }}
              title="Press Me"a
            />
          </View>
          <ScrollView>
            <Text style={{ flex: 30, fontSize: 12 }}>This text is so big! And so long! You have to scroll!</Text>
          </ScrollView>
        </View> */}
      </NavigationContainer>

    );
  }
}

const styles = StyleSheet.create({

});
