import { TouchableOpacity } from "react-native";
import { View, Image, Text } from "react-native";
import makeStyles from './styles'


export default Transation = ()=>{
    const styles = makeStyles();
    return(
    <TouchableOpacity
        activeOpacity={0.8}
        style={{
            flex: 1,
            flexDirection: 'row',
            margin: 3,
            borderRadius: 5,
            borderLeftWidth: 4,
            borderLeftColor: 'green',
            padding: 10,
            borderWidth: 1,
            borderColor: '#E6EBF0',
            backgroundColor: 'white',
        }}
        onPress={() => {
        
        }}

        >
        <View style={styles.subContainer}>
            <View style={styles.headerContainer}>
            <Image
                source={require('../../../../app/assets/images/shopIcon.png')}
                style={{ width: 40, height: 40, borderRadius: 50 }}
            />
            <View style={{ marginHorizontal: 10 }}>
                <Text style={{ marginBottom: 5 }}>Uber</Text>
                <Text>AA</Text>
            </View>
            </View>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text>$45.12</Text>
            <Text>29 May 2023</Text>
        </View>
    </TouchableOpacity>
  );

}