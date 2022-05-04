import React from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';
import firestore from 'firebase';

//information for the database
const firebaseConfig = {
  apiKey: "AIzaSyCiYLZ0YfqIo5tUNKeBJ_LZmJsbyF7dcQs",
  authDomain: "hello-world-56a59.firebaseapp.com",
  projectId: "hello-world-56a59",
  storageBucket: "hello-world-56a59.appspot.com",
  messagingSenderId: "679395702082",
  appId: "1:679395702082:web:70044162f9200a495d84db"
};


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
      location: null

    };


    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

      // create a reference to the active user's documents (shopping lists)
      this.referenceChatMessages = firebase.firestore().collection('messages');
      // listen for collection changes for current user 
      this.unsubscribe = this.referenceChatMessages
      .orderBy('createdAt', 'desc')
      .onSnapshot(this.onCollectionUpdate);
      
    this.refMsgsUser = null;
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
        user: data.user,
      });
    });
  }

  //adding messages to the database
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || "",
      location: message.location || null,
    });
  }

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessages();
      }
    );
  }

  // Lets you decide on the color of both user's speech bubbles
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          },
          left: {
            backgroundColor: 'yellow'
          }
        }}
      />
    )
  }

  render() {

    //imports bgColor from start screen
    let bgColor = this.props.route.params.bgColor;



    return (

      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            name: this.state.name,
            avatar: this.state.user.avatar,
          }}
        />
        {/*keyboard-fix for android phones*/}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  };


  componentDidMount() {
    //sets user name at top of screen
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // user authentication
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        return await firebase.auth().signInAnonymously();
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
      .collection('messages')
      .where('uid', '==', this.state.uid);


}); 
  }




  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribe();
  }



}




