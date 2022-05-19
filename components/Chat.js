import React from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import {
  GiftedChat,
  Bubble,
  InputToolbar,
  SystemMessage,
} from "react-native-gifted-chat";

//import AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

//import NetInfo
import NetInfo from "@react-native-community/netinfo";

//import firebase
import * as firebase from "firebase";
import "firebase/firestore";

//const firebase = require("firebase");
//require("firebase/firestore");

import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
      image: null,
      location: null,
    };

    //information for the database
    const firebaseConfig = {
      apiKey: "AIzaSyCiYLZ0YfqIo5tUNKeBJ_LZmJsbyF7dcQs",
      authDomain: "hello-world-56a59.firebaseapp.com",
      projectId: "hello-world-56a59",
      storageBucket: "hello-world-56a59.appspot.com",
      messagingSenderId: "679395702082",
      appId: "1:679395702082:web:70044162f9200a495d84db",
    };

    //initialize app
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    //reference firestore database
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /* componentDidMount function gets called after Chat component mounts. State gets set
with static message to see each element of the UI displayed on screen with setState function */
  componentDidMount() {
    //name to be displayed in status bar at the top of the app
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");

        //listener for collection updates
        this.unsubscribe = this.referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);

        //authentication
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                _id: user.uid,
                name: name,
                avatar: "https://placeimg.com/140/140/any",
              },
            });

            this.refMsgsUser = firebase
              .firestore()
              .collection("messages")
              .where("uid", "==", this.state.uid);
          });

        this.saveMessages();
      } else {
        // if user offline
        this.setState({ isConnected: false });
        console.log("offline");
        this.getMessages();
      }
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages,
    });
    // save messages to local AsyncStorge
    this.saveMessages();
  };

  //adding new message to database collection
  addMessage() {
    const message = this.state.messages[0];

    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || "",
      location: message.location || null,
    });
  }

  //when a message is sent, calls saveMessage
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }

  //dont receive updates from collection
  componentWillUnmount() {
    if (this.state.isConnected) {
      this.authUnsubscribe();
      this.unsubscribe();
    }
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "red",
          },
          left: {
            backgroundColor: "#99f57d",
          },
        }}
      />
    );
  }

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  //to access CustomActions
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  //return a MapView when surrentMessage contains location data
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    // color chosen on Start screen to be applied on chat screen
    let bgColor = this.props.route.params.bgColor;

    return (
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: bgColor }}
      >
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          user={{
            _id: this.state.user._id,
            name: this.state.name,
            avatar: this.state.user.avatar,
          }}
        />

        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}