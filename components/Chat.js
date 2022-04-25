import React from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { View, Platform, KeyboardAvoidingView } from 'react-native';



export default class Chat extends React.Component {


  // setting up the different states
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
  }


  // adds new messages to the chat
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  // initializes first message 
  componentDidMount() {

    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // sets up both the user and the second party
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
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
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {/*keyboard-fix for android phones*/}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  };
}

