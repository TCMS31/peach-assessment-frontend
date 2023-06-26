import React,{useState} from 'react'
import { Image, Text, View, TouchableOpacity, Modal } from 'react-native'
import {  VictoryPie } from "victory-native";
import Transation from '../components/transations/Transation'
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg'
import { useNavigation } from '@react-navigation/native';
import TransationModal from '../components/tansationmodal/TransationModal';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false)
    const closeModalAndNavigate = () => {
    console.log("ewfer")
     navigation.navigate('SelectCategory')
         setModalVisible(false);
    
  };



const graphicData = [  { x: "35%", y: 35, fill: '#B6E4FB' },
    { x: "55%", y: 55, fill: '#B6E4FB' }];
    return (
       
        <View style={{ flex: 1, padding: 20,backgroundColor: '#FFFFFF'  }}>
            <View style={{ width:"100%", marginTop: 20 }}>
                <View style={{ backgroundColor: '#FFFFFF', height: 270, borderRadius: 1, borderColor: '#E6EBF0', borderWidth: 1, padding: 20}}>
                    <View>
                        <Text style={{color: '#949CA8', fontSize: 12,}}>Top spending categories</Text>
                    </View>
                    <View style={{ flex:1, flexDirection: 'row',justifyContent: 'space-between'}}>
                        <View style={{flex:0.3,justifyContent:'center'}}>
                            <View style= {{borderLeftWidth: 2, borderLeftColor: '#87CEEB',paddingLeft: 7 }}>
                            <View style={{flexDirection: 'row'}} >
                             <Image style={{ width: 15, height: 15}} source={require('../../../app/assets/images/shopIcon.png')}/>
                            
                                 <Text style={{marginHorizontal: 5, fontSize: 10, color: '#6C727C'}}>Shops</Text>
                           
                            </View>
                            <View>
                                <Text>+$1234</Text>
                            </View>
                            </View>
                        </View>
                        <View style={{flex: 0.7,alignItems: 'center'}}>
   
                         <VictoryPie  data={graphicData} width={200} height={200}  innerRadius={40}  style={{
            data: {
                fill: ({datum}) => datum.fill
            }
        }}/>
 
                         <View>
                            <Text>Total: 1234</Text>
                         </View>
                        </View>

                    </View>
                </View>
            </View>
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={()=>setModalVisible(true)}>
                    <LinearGradient
                    colors={['#C0CEFF', '#F4D9D0']}
                    style={styles.gradient}>
                    <Text style={styles.text}>10 New Transactions to Review          -></Text>
                    </LinearGradient>
                </TouchableOpacity>
           </View>
            <View style={{marginVertical: 10, fontSize: 16, fontWeight: '600'}}>
                <Text>
                    Recent Transactions
                </Text>
            </View>
            <View style={{ height: 65}}>
                 <Transation/>
            </View>
             <View style={{justifyContent: 'center',alignItems: 'center'}} >
             <Modal  visible={modalVisible} animationType='slide' >
                <View
                    style={{
                    borderRadius: 5,
                    marginTop:200,
                    marginHorizontal: 10,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E6EBF0',
                    height: 300,
                    
                    
                    }}
                >
                    <Text style={{ marginVertical: 5, color: '#949CA8' }}>Mon, 29 May 2023</Text>
                    <Text style={{ marginVertical: 5 }}>SFO to JFK</Text>
                    <Text style={{ marginVertical: 5, color: '#949CA8' }}>United</Text>
                    <Text style={{ marginVertical: 5, fontSize: 32 }}>$129.97</Text>
                <TouchableOpacity style={styles.button} onPress={()=>closeModalAndNavigate()}>

                    <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginVertical: 15,
                    }}
                    >
                    <Image
                        source={require('../../../app/assets/images/shopIcon.png')}
                        style={{
                        width: 30,
                        height: 30,
                        borderRadius: 50,
                        marginHorizontal: 5,
                        }}
                    />
                    <Text>Shops</Text>
                    </View>
                     </TouchableOpacity>
                    <TouchableOpacity
                    style={{
                        backgroundColor: '#323A47',
                        width: '90%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 10,
                        borderRadius: 5,
                        marginVertical: 15,
                        marginHorizontal: 10
                    }}
                    onPress={()=> closeModalAndNavigate()}
                    >
                    <Text style={{color: 'white'}}>Next</Text>
                    </TouchableOpacity>
                </View>
           </Modal>
           </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  button: {
    width: '100%',
    height: 45,
  },
  text: {

    fontSize: 16,
  },
});