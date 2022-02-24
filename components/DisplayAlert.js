import { Platform, Alert } from 'react-native';

class DisplayAlert{
    constructor(){}
    displayAlert(msg) {
        if (Platform.OS == 'web'){
            return alert(msg);
        }
        else{
            return Alert.alert(msg);
        }
    }
}

export default DisplayAlert;