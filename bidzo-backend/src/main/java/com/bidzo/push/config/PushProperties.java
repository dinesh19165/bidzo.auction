package com.bidzo.push.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "push")
public class PushProperties {
    private String provider = "firebase";
    private String firebaseServerKey;
    private String oneSignalAppId;
    private String webPushVapidPublicKey;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getFirebaseServerKey() {
        return firebaseServerKey;
    }

    public void setFirebaseServerKey(String firebaseServerKey) {
        this.firebaseServerKey = firebaseServerKey;
    }

    public String getOneSignalAppId() {
        return oneSignalAppId;
    }

    public void setOneSignalAppId(String oneSignalAppId) {
        this.oneSignalAppId = oneSignalAppId;
    }

    public String getWebPushVapidPublicKey() {
        return webPushVapidPublicKey;
    }

    public void setWebPushVapidPublicKey(String webPushVapidPublicKey) {
        this.webPushVapidPublicKey = webPushVapidPublicKey;
    }
}
