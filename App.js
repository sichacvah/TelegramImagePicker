// @ts-check
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImagePicker from './src/ImagePicker'
import * as ImageService from './src/ImagePicker/imageFetchingService'


export default class App extends React.PureComponent {
  state = {
    images: []
  }
  componentDidMount() {
    ImageService.fetchPhotos().then(images => this.setState({images}))
  }

  loadMore = () => {
    ImageService.next().then(images => {
      this.setState({ images: this.state.images.concat(images) })
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <ImagePicker
          cellMargin={6}
          cellSideSize={80}
          expandedCellSideSize={300}
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
