// Tizen-specific helper functions
class TizenHelper {
    constructor() {
        this.isTizen = typeof tizen !== 'undefined';
    }

    initialize() {
        if (this.isTizen) {
            this.registerKeys();
            this.monitorNetwork();
        }
    }

    registerKeys() {
        try {
            tizen.tvinputdevice.registerKey('ColorF0Red');
            tizen.tvinputdevice.registerKey('ColorF1Green');
            tizen.tvinputdevice.registerKey('ColorF2Yellow');
            tizen.tvinputdevice.registerKey('ColorF3Blue');
            tizen.tvinputdevice.registerKey('Return');
            console.log('Tizen keys registered successfully');
        } catch (error) {
            console.error('Failed to register Tizen keys:', error);
        }
    }

    monitorNetwork() {
        if (tizen.systeminfo) {
            tizen.systeminfo.getPropertyValue('NETWORK', 
                (network) => {
                    console.log('Network status:', network.networkType);
                },
                (error) => console.error('Network check failed:', error)
            );
        }
    }

    exitApp() {
        if (this.isTizen && tizen.application) {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (error) {
                console.error('Failed to exit app:', error);
                window.close();
            }
        } else {
            window.close();
        }
    }
}