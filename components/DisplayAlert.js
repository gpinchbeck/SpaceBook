import { Platform, Alert } from 'react-native';

class DisplayAlert{
    displayAlert(msg) {
        if (Platform.OS === 'web'){
            return alert(msg);
        }
        return Alert.alert(msg);
    }
}

export default DisplayAlert;