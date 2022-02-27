import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
    async getData(done){
        try {
            const jsonValue = await AsyncStorage.getItem('@spacebook_details');
            const data = JSON.parse(jsonValue);
            return done(data);
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    async storeData(value){
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('@spacebook_details', jsonValue);
        } catch (e) {
            console.error(e);
        }
    }
}

export default Storage;