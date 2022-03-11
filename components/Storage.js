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

    async updateDraft(userId, newVal, oldVal){
        const key = `@spacebook_savedDrafts_${ userId }`;
        const drafts = await this.getDrafts(userId);
        const index = drafts.indexOf(oldVal);
        drafts[index] = newVal;
        const r = await AsyncStorage.setItem(key.toString(), JSON.stringify(drafts));
        return r;
    }

    async removeDraft(userId, val){
        const key = `@spacebook_savedDrafts_${ userId }`;
        const drafts = await this.getDrafts(userId);
        const index = drafts.indexOf(val);
        drafts.splice(index, 1);
        const r = await AsyncStorage.setItem(key.toString(), JSON.stringify(drafts));
        return r;
    }

    async saveDraft(userId, value){
        const key = `@spacebook_savedDrafts_${ userId }`;
        const drafts = await this.getDrafts(userId);
        const updatedDrafts = [...drafts, value];
        await AsyncStorage.setItem(key.toString(), JSON.stringify(updatedDrafts));
    }

    async getDrafts(userId){
        const key = `@spacebook_savedDrafts_${ userId }`;
        const drafts = await AsyncStorage.getItem(key.toString());
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