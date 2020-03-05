import React, { Component } from 'react';
import { View, Text, PanResponder } from 'react-native';
import PropTypes from 'prop-types';

class LetterPicker extends Component {
  render() {
    return <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: this.props.space }}>{this.props.letter}</Text>;
  }
}

let Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export default class AlphabetPicker extends Component {
  constructor(props, context) {
    super(props, context);
    if (props.alphabet) {
      Alphabet = props.alphabet;
    }
    this.state = {
      alphabet: Alphabet,
      letter: null,
      yPositiion: 0,
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        this.props.onTouchStart && this.props.onTouchStart();

        this.tapTimeout = setTimeout(() => {
          const { alphabet } = this.state;

          const letter = this._findTouchedLetter(gestureState.y0);

          if (!!letter) {
            let top = gestureState.y0 - (this.absContainerTop || 0);
            top =
              (Math.round((top / this.containerHeight) * alphabet.length) - 1) *
              (this.containerHeight / alphabet.length);

            this._onTouchLetter(letter);
            this.setState({ currentLetter: letter, yPositiion: top });
          }
        }, 250);
      },
      onPanResponderMove: (evt, gestureState) => {
        clearTimeout(this.tapTimeout);

        const { alphabet } = this.state;
        const letter = this._findTouchedLetter(gestureState.moveY);

        if (!!letter) {
          let top = gestureState.moveY - (this.absContainerTop || 0);
          top =
            (Math.round((top / this.containerHeight) * alphabet.length) - 1) *
            (this.containerHeight / alphabet.length);

          this._onTouchLetter(letter);
          this.setState({ currentLetter: letter, yPositiion: top });
        }
      },
      onPanResponderTerminate: this._onPanResponderEnd.bind(this),
      onPanResponderRelease: this._onPanResponderEnd.bind(this),
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.alphabet !== nextProps.alphabet) {
      this.setState({ alphabet: nextProps.alphabet });
    }
  }

  _onTouchLetter(letter) {
    letter && this.props.onTouchLetter && this.props.onTouchLetter(letter);
  }

  _onPanResponderEnd() {
    setTimeout(() => {
      this.setState({ currentLetter: null });
    }, 150);

    requestAnimationFrame(() => {
      this.props.onTouchEnd && this.props.onTouchEnd();
    });
  }

  _findTouchedLetter(y) {
    let top = y - (this.absContainerTop || 0);
    const { alphabet } = this.state;

    if (top >= 1 && top <= this.containerHeight) {
      return alphabet[Math.round((top / this.containerHeight) * alphabet.length)];
    }
  }

  _onLayout(event) {
    this.refs.alphabetContainer.measure((x1, y1, width, height, px, py) => {
      this.absContainerTop = py;
      this.containerHeight = height;
    });
  }

  renderTalkBubble() {
    const { currentLetter, yPositiion } = this.state;
    const { backgroundColor, textColor } = this.props;

    return (
      <View
        style={{
          backgroundColor: 'transparent',
          position: 'absolute',
          left: -64,
          top: yPositiion,
        }}
      >
        <View
          style={{
            justifyContent: 'center',
            padding: 10,
            width: 50,
            height: 50,
            backgroundColor: backgroundColor,
            borderRadius: 10,
          }}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: textColor }}>
            {currentLetter}
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            right: -14,
            top: 12,
            width: 0,
            height: 0,
            borderTopColor: 'transparent',
            borderTopWidth: 13,
            borderLeftWidth: 26,
            borderLeftColor: backgroundColor,
            borderBottomWidth: 13,
            borderBottomColor: 'transparent',
          }}
        />
      </View>
    );
  }

  render() {
    const { alphabet, currentLetter } = this.state;
    //1-5
    let space = 3.25;
    // 6-10
    if (alphabet.length > 5 && alphabet.length <= 10)
      space = 3
    else if (alphabet.length > 10 && alphabet.length <= 15)
      space = 2.75
    // 16-23
    else if(alphabet.length > 15 && alphabet.length <= 23)
      space = 2.5
    // >24
    else if(alphabet.length > 23 )
      space = 2.25

    this._letters = alphabet.map(letter => <LetterPicker letter={letter} space={space} key={letter} />);

    return (
      <View
        ref="alphabetContainer"
        {...this._panResponder.panHandlers}
        onLayout={this._onLayout.bind(this)}
        style={{
          paddingHorizontal: 5,
          backgroundColor: '#fff',
          borderRadius: 1,
          justifyContent: 'center',
        }}
      >
        {!!currentLetter && this.renderTalkBubble()}
        <View>{this._letters}</View>
      </View>
    );
  }
}
