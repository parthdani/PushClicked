import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CleverTap } from '@ionic-native/clevertap/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private clevertap: CleverTap,
    private firebase: Firebase
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.clevertap.profileGetCleverTapID().then((id) => {console.log("CleverTapID: " + id)});

      // CleverTap
      document.addEventListener('onCleverTapProfileDidInitialize', (e: any) => {
        console.log("onCleverTapProfileDidInitialize");
        console.log(e.CleverTapID);
      });

      document.addEventListener('onCleverTapInAppNotificationDismissed', (e: any) => {
        console.log("onCleverTapInAppNotificationDismissed");
        console.log(JSON.stringify(e.extras));
        console.log(JSON.stringify(e.actionExtras));
      });

      //deeplink handling
      document.addEventListener('onDeepLink', (e: any) => {
        console.log("onDeepLink");
        console.log(e.deeplink);
      });

      //push notification payload handling
      document.addEventListener('onPushNotification', (e: any) => {
        console.log("onPushNotification");
        console.log(JSON.stringify(e.notification));
      });

      this.clevertap.setDebugLevel(3);
      this.clevertap.enablePersonalization();

      setTimeout(() => {
          alert("pedir push")
          this.clevertap.registerPush();
          (window as any).window.FirebasePlugin.hasPermission( hasPermission => {
          //this.zone.run(() => {
            if (hasPermission) {
              (window as any).FirebasePlugin.getToken(token => console.log("FB getToken", token));
              (window as any).FirebasePlugin.onTokenRefresh(newToken =>  console.log("FB onTokenRefresh", newToken));
              (window as any).FirebasePlugin.onMessageReceived(message => console.log("FB onMessageReceived", message));
              if(this.platform.is("ios")){
                (<any>window).FirebasePlugin.onApnsTokenReceived(
                  APNToken => {
                    console.log('FB onApnsTokenReceived ', APNToken)
                    if(APNToken){
                      this.clevertap.setPushToken(APNToken).then(res => console.log(res));
                    }
                  },
                  error => {
                    console.log('FB error onApnsTokenReceived ', error)
                  });
              }
            } else {
              (window as any).FirebasePlugin.grantPermission(hasPermission => {
                  if (hasPermission) {
                      (window as any).FirebasePlugin.getToken(token => console.log("FB getToken", token));
                      (window as any).FirebasePlugin.onTokenRefresh(newToken =>  console.log("FB onTokenRefresh", newToken));
                      (window as any).FirebasePlugin.onMessageReceived(message => console.log("FB onMessageReceived", message));
                      // if(this.platform.is("ios")){
                      //   (<any>window).FirebasePlugin.onApnsTokenReceived(
                      //     APNToken => {
                      //       console.log('FB onApnsTokenReceived ', APNToken)
                      //       if(APNToken){
                      //         this.clevertap.setPushToken(APNToken).then(res => console.log(res));
                      //       }
                      //     },
                      //     error => {
                      //       console.log('FB error onApnsTokenReceived ', error)
                      //     });
                      // }
                    } else {
                      console.log("FB Permision not garanted");
                  }
              });
            }
          //})
        });
        }, 10000);
  
      //this.clevertap.registerPush();



      // this.firebaseX.getToken()
      //     .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
      //     .catch(error => console.error('Error getting token', error));

      // this.firebaseX.onMessageReceived()
      //     .subscribe(data => console.log(`User opened a notification ${data}`));

      // this.firebaseX.onTokenRefresh()
      //     .subscribe((token: string) => console.log(`Got a new token ${token}`));

    });
  }
}
