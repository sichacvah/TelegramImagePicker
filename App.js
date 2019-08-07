// @ts-check
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImagePicker from './src/ImagePicker'
import * as ImageService from './src/ImagePicker/imageFetchingService'


function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandom20Colors() {
  let colors = []
  for (let i = 0; i < 90; i++) {
    colors.push({ color: getRandomColor(), uri: `https://loremflickr.com/${i % 2 === 0 ? 300 : 1000}/${500}`, width: i % 2 === 0 ? 300 : 1000, height: 500 })
  }
  return colors
}
export default class App extends React.PureComponent {
  state = {
    images: []
  }
  componentDidMount() {
    // ImageService.fetchPhotos().then(images => this.setState({images}))
    Promise.resolve(getRandom20Colors()).then(images => this.setState({ images }))
  }

  loadMore = () => {
    // Promise.resolve(getRandom20Colors()).then(images => this.setState({ images: this.state.images.concat(images) }))
    // ImageService.next().then(images => {
    //   this.setState({ images: this.state.images.concat(images) })
    // })
  }
  render() {
    return (
      <View style={styles.container}>
        <ImagePicker
          cellMargin={6}
          cellSideSize={80}
          expandedCellSideSize={160}
          onEndReaching={this.loadMore}
          containerPadding={8}
          images={this.state.images} />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    justifyContent: 'center'
  },
});
