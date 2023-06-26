
import { StyleSheet } from 'react-native';

const makeStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      margin: 3,
      borderRadius: 15,
      padding: 10,
      backgroundColor: 'white',
    },
    subContainer: {
      flex: 2,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerContent: {
      fontSize: 17,

      color: '#111111',
      paddingLeft: 5,
    },
    contentContainer: {
      flexDirection: 'row',
      marginTop: 10,
      alignItems: 'center',
    },
    coloredText: (color) => ({
      color: color,
      fontSize: 19,

    }),
    deviceName: {
      fontSize: 10,

      color: '#455066',
      marginTop: 10,
    },
    scale: {
      fontSize: 15,
      paddingLeft: 10,
      color: 'black',

    },
    footStepsLottieView: {
      width: 30,
      height: 30,
    },
  });

export default makeStyles;