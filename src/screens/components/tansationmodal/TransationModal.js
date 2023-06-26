import { Image, Text, View, TouchableOpacity, Modal,StyleSheet } from 'react-native'

export default  TransactionModal = (props) =>{
      const closeModalAndNavigate = () => {
    props.setModalVisible(false)
  };

   
    return(
       <Modal  visible={props.modalVisible} animationType='slide' >
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
                        source={require('../../../../app/assets/images/shopIcon.png')}
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