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

    async updateDraft(newVal, oldVal){
        const drafts = await this.getDrafts();
        const index = drafts.indexOf(oldVal);
        drafts[index] = newVal;
        const r = await AsyncStorage.setItem('@spacebook_savedDrafts', JSON.stringify(drafts));
        return r;
    }

    async removeDraft(val){
        const drafts = await this.getDrafts();
        const index = drafts.indexOf(val);
        drafts.splice(index, 1);
        const r = await AsyncStorage.setItem('@spacebook_savedDrafts', JSON.stringify(drafts));
        return r;
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

    // async schedTest(val){
    //     const values = await this.getSched();
    //     const updatedValues = [...values, val];
    //     await AsyncStorage.setItem('@spacebook_schedTest', JSON.stringify(updatedValues));
    // }

    // async getSched(){
    //     const r = await AsyncStorage.getItem('spacebook_schedTest');
    //     return r ? JSON.parse(r) : [];
    // }
}

export default Storage;