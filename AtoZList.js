/**
 * This is the entry point for your experience that you will run on Exponent.
 *
 * Start by looking at the render() method of the component called
 * FirstExperience. This is where the text and example components are.
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AppRegistry,
  Image,
  TouchableHighlight,
  ScrollView,
  StyleSheet,
  Text,
  PanResponder,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native';

import _ from 'lodash';
import FixedHeightWindowedListView from './FixedHeightWindowedListView';
import AlphabetPicker from './AlphabetPicker';

export default class AtoZList extends Component {
  static propTypes = {
    cellHeight: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    hideAlphabetInstance: PropTypes.bool,
    onEndReached: PropTypes.func,
    onScroll: PropTypes.func,
    renderCell: PropTypes.func,
    renderSection: PropTypes.func,
    sectionHeaderHeight: PropTypes.number.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    let sectionHeight = props.sectionHeaderHeight || 35;
    let cellHeight = props.cellHeight || 95;

    var dataSource = new FixedHeightWindowedListView.DataSource({
      getHeightForSectionHeader: sectionId => {
        return sectionHeight;
      },
      getHeightForCell: sectionId => {
        return cellHeight;
      },
    });

    this.state = {
      dataSource: dataSource.cloneWithCellsAndSections(this.props.data),
      alphabet: Object.keys(this.props.data),
    };

    this.dataSource = dataSource;
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.cellHeight !== nextProps.cellHeight ||
      this.props.sectionHeaderHeight !== nextProps.sectionHeaderHeight
    ) {
      this.dataSource = new FixedHeightWindowedListView.DataSource({
        getHeightForSectionHeader: sectionId => {
          return nextProps.sectionHeaderHeight;
        },
        getHeightForCell: sectionId => {
          return nextProps.cellHeight;
        },
      });
    }

    if (this.props.data !== nextProps.data) {
      this.setState({
        dataSource: this.dataSource.cloneWithCellsAndSections(nextProps.data),
        alphabet: Object.keys(nextProps.data),
      });
    } else {
      this.setState({
        dataSource: this.dataSource.cloneWithCellsAndSections(this.props.data),
      });
    }
  }

  render() {
    const { hideAlphabetInstance } = this.props;
    
    this._alphabetInstance = (
      <View style={styles.alphabetSidebar}>
        <AlphabetPicker
          alphabet={this.state.alphabet}
          onTouchLetter={this._onTouchLetter.bind(this)}
          backgroundColor={this.props.backgroundColor || 'red'}
          textColor={this.props.textColor || 'white'}
        />
      </View>
    );

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <FixedHeightWindowedListView
            ref={view => (this._listView = view)}
            dataSource={this.state.dataSource}
            renderCell={this.props.renderCell}
            renderSectionHeader={this.props.renderSection}
            incrementDelay={1}
            initialNumToRender={10}
            pageSize={Platform.OS === 'ios' ? 15 : 8}
            maxNumToRender={40}
            numToRenderAhead={20}
            numToRenderBehind={4}
            onEndReached={this.props.onEndReached}
            onScroll={this.props.onScroll}
          />
        </View>
        {!hideAlphabetInstance && this._alphabetInstance}
      </View>
    );
  }

  _onTouchLetter = _.debounce(letter => {
    this._listView.scrollToSectionBuffered(letter);
  }, 150);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  alphabetSidebar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 32,
    bottom: 0,
    right: 5,
  },
});
