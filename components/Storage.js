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
            console.log(e);
        }
    }

    async saveDraft(value){
        const drafts = await this.getDrafts();
        const updatedDrafts = [...drafts, value];
        await AsyncStorage.setItem('@spacebook_savedDrafts', JSON.stringify(updatedDrafts));
    }

    async getDrafts(){
        const drafts = await AsyncStorage.getItem('@spacebook_savedDrafts');
        return drafts ? JSON.parse(drafts) : [];
    }
}

export default Storage;