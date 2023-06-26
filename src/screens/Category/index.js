
import { View, Image, Text ,StyleSheet,TouchableOpacity} from "react-native";
import TransationModal from "../components/tansationmodal/TransationModal";
import React,{useState} from 'react'

export default Category = ()=>{
      const [modalVisible, setModalVisible] = useState(false)

    return(
        <View style={{flex: 1, backgroundColor: 'white',}}>
            <View style={{marginHorizontal: 10}}>
                <View style={{justifyContent: "space-around", flexDirection: "row",marginVertical: 40}}>
                 <TouchableOpacity  onPress={()=> setModalVisible(true)}>
                       <View  style={{ alignItems: "center",width: 100, height: 100}}>
                            <Image source={require('../../../app/assets/images/emojeIcon.png')}/>
                            <Text style={{justifyContent: "center", alignItems: "center"}}>Income</Text>
                        </View>
                </TouchableOpacity>
                <TouchableOpacity  onPress={()=>console.log("ferf")}>
                          <View  style={{ alignItems: "center",width: 100, height: 100}}>
                            <Image source={require('../../../app/assets/images/pizza.png')}/>
                            <Text>Food and Drink </Text>
                        </View>
                </TouchableOpacity>
                 <TouchableOpacity  onPress={()=>console.log("ferf")}>
                          <View  style={{ alignItems: "center",width: 100, height: 100}}>
                            <Image source={require('../../../app/assets/images/medicne.png')}/>
                            <Text>Healthcare</Text>
                        </View>
                </TouchableOpacity>
                
                </View>
                <View style={{justifyContent: "space-around", flexDirection: "row", }}>
                 <TouchableOpacity  onPress={()=>console.log("ferf")}>
                    <View  style={{ alignItems: "center",width: 100, height: 100}}>
                        <Image source={require('../../../app/assets/images/tele.png')}/>
                        <Text>Subscription</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity  onPress={()=>console.log("ferf")}>
                    <View  style={{ alignItems: "center",width: 100, height: 100}}>
                        <Image source={require('../../../app/assets/images/shop.png')}/>
                        <Text>Shops</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity  onPress={()=>console.log("ferf")}>
                     <View  style={{ alignItems: "center",width: 100, height: 100}}>
                        <Image source={require('../../../app/assets/images/plane.png')}/>
                        <Text>Travel</Text>
                    </View>
                </TouchableOpacity>
                </View>
            </View>
            <TransationModal modalVisible={modalVisible} setModalVisible={setModalVisible}/>

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