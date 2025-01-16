import React, { useEffect, useState } from 'react';
import { View, Pressable, Alert,StyleSheet } from 'react-native';
import { Text,List } from 'react-native-paper';
import client from '../../connection/connectApi';
import { useAuth } from '../../connection/authContext';
import getError from '../../connection/getError';

const RemoveUser = () => {
    const [users, setUsers] = useState([]);
    const {authState} = useAuth(); 
    const HandleDeleteGate = async (id,name,gid) => {
        // Your remove device logic goes here
        try {
            const data = {id};
            // console.log('Removing gate:', id,"Removing gate:",name,"Removing gate:",uid);
            const response = await client.delete(`/gate/${gid}`,{data});
            console.log(response);
            if (response.status == 200) {
                Alert.alert("Removed:", name);
            }
            getGates();
        } catch (error) {
            try {
                getError(error);
            } catch (error) {
                console.log('Error:', error.message, "At RemoveDevice");
            }
        }
    }
    const getGates=()=>{
        let key = authState.user_id;
        console.log("key:",key);
        client.get(`/gate/admin/${key}`)
            .then(response => {
                console.log("response:",response.data.data);
                setUsers(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error, error.response.data.message);
            });
        }
    useEffect(() => {
        // Fetch gates from the server
        getGates();
    }, []);

    return (
        <View>
    <Text style={styles.text}>List Of Users:</Text>
   
    <List.Section>
    {users.filter(user => user.Gates.length > 0).map(user => 
        user.Gates.map((gate, index) => (
            <View key={`${user.id}-${index}`}>      
                <Pressable onPress={() => {
                    console.log('User:', user, 'Gate:', gate);
                    HandleDeleteGate(user.id, gate.name, gate.id); // Adjusted to include gate.name if needed
                }}>
                    <List.Item
                        style={styles.card}
                        title={`User: -> ${user.name}, email -> ${user.email}`}
                        titleStyle={styles.title}
                        description={`Gate Name: ${gate.name}, Subscription: ${gate.subscription}`}
                    />
                </Pressable>
            </View>
        ))
        )}
    </List.Section>
    </View>
        // <View>
        //     <Text style={styles.text}>List Of Users:</Text>
           
        //     <List.Section>
        //        {users.map(user => (
        //             <View>      
        //                 <Pressable onPress={() => {
        //                     console.log('User:', user);
        //                     HandleDeleteGate(user.id, user.name);
        //                 }}>
        //             <List.Item
        //             style={styles.card}
        //                 key={user.id}
        //                 title={"User:  -> "}
        //                 titleStyle={styles.title}
        //                 description={"Gate Name: "+user.name+", Subscription: "+user.Gates.subscription}
        //             /></Pressable>
        //             </View>
        //         ))}
        //     </List.Section>
        // </View>
    );
};
const styles = StyleSheet.create({
    text:{
        fontSize:18,
        margin:14,
        fontWeight:"600",
        
    },
    title:{
        marginBottom:10,
        fontSize:16,
        fontWeight:"700"
    },
    card:{
        backgroundColor:"#FFEBEE",
        margin:10,
        borderRadius:15,
        elevation:8,
        marginVertical:7,

    }
})
export default RemoveUser;