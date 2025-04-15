# Yet Another SG Bus App
|                                           |                                           |                                           |
| ----------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| ![Image](https://i.imgur.com/vTFjIeU.png) | ![Image](https://i.imgur.com/WvHurAC.png) | ![Image](https://i.imgur.com/ev4KjpL.png) |


> ### SG Bus alternative android application for my own use, without the ads. Created as a side project outside working hours to pursue a career as a ReactJS (Mobile) Developer. 

---

# *Disclaimer*
```
All the data are derived from the LTA DataMall API. We apologize if there any discrepancies in the data provided and we will try our best to fix it on our end or through a data patch as soon as possible. Live data is purely dependent on LTA's backend and we are not responsible for the accuracy or availability of the data.

By using this application you agree to not hold us responsible for your bus not arriving on time or any other matters related to the accuracy or availability of the bus data provided.
```

---

## Features
- Ad-free application - say no to advertisements
- Easy to use GUI
- Location based sorting - gets the nearest bus stop from your location
---

## Screenshots
![Image](https://i.imgur.com/wv7KKv8.gif)

---

## Running the App

Config files to be created in the following folders:

<details>

### Backend\config\default.json
```
{
    "mongoURI" : "mongodb+srv://username:password@database01cluster.pqete.mongodb.net/database?retryWrites=true&w=majority",
    "jwtSecret" : "mysecrettoken",
    "LTADataMallAPI" : "",
    "FACEBOOK_APP_ID" : "",
    "FACEBOOK_APP_SECRET" : "",
    "FACEBOOK_CALLBACK_URL" : "http://localhost:8080/api/auth/facebook/callback",
    "FRONTEND_LINK" : "exp+yasgba://<LOCAL_IP>:19000",
    "TOKEN_EXPIRY_DAYS" : 1,
    "MAX_DISTANCE_IN_METRES": 300
}
```

### Backend\config\test.json
Note: This is for running yarn test
```
{}
```

### Frontend\app.config.json
```
module.exports = () => {
	const config = {
		android: {
			package: "com.onemanstudio.yasgba"
		},
	};
	if (process.env.NODE_ENV === "production") {
		// Production
		const production = {
			extra: {
				TOKEN: "TOKEN",
				BACKEND_API: "API_URL",
				MAPBOX: "",
				MAX_DISTANCE_IN_METRES: 300,
			}
		};
		return Object.assign(config, production);
	} else {
		// Development
		const development = {
			extra: {
				TOKEN: "TOKEN",
				BACKEND_API: "http://10.0.2.2:8080/api",
				MAPBOX: "",
				MAX_DISTANCE_IN_METRES: 300,
			},
		};
		return Object.assign(config, development);
	}
};
```
### Frontend\config\Emulator.bat
Note: Optional. This is only for quickly opening the Emulator.
```
cd /d C:\Users\%username%\AppData\Local\Android\sdk\emulator
emulator @Pixel_4_API_30
```
</details>

### Note
Ensure that the android emulator with expo installed is running already.
Open up terminal in the application's root directory and run the following commands:

## Install all dependencies
```
yarn install
```

// TODO: 
## Set up the database
<details>

### Get your own LTA DataMall API
https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html

### Create a mongodb docker container with a replica set
```
docker run -p 27017:27017 --name mongodb -d mongodb/mongodb-community-server:latest --replSet replicaSet
```

### Install mongosh tool
https://www.mongodb.com/docs/mongodb-shell/install/

### Run the migration script from the backend folder
```
yarn generate && 
yarn db &&
yarn seed
```

### Go into mongosh and run some additional commands
```
db.BusStop.createIndex({ location: "2dsphere" });
```

</details>

## Run Backend
```
yarn backend
```

## Run Frontend
### NOTE: Build and install development build first from the Frontend folder. Note that you also need an emulator running for the following command.
```
yarn build-development
```
or manually with the following command:
```
// Build
npx react-native build-android

// Install development build on android and run it
npx expo run:android
```

## To start in Android simulator
```
# In frontend folder run the following command:
adb reverse tcp:8080 tcp:8080 && expo start --dev-client

or 

yarn start
```
or this command from the root folder
```
yarn frontend
```

## To start in IOS simulator
```
npx expo run:ios
```

---

## Testing
```
# Android
# Start emulator

# Build
detox build -c android.emu.release
or
~~cd android && .\gradlew assembleDebug assembleAndroidTest -DtestBuildType=release --warning-mode all && cd -~~

# Run app and run detox
npx detox test -c android.emu.release

```

Any issues can use the following commands to resolve it:
```
gradlew --stop
```
---

# Building for app store (.aab)
```
npx react-native build-android [--mode=release]
```

# Deploying
```
To be updated once the architecture has been set up
```

# Devtools
Start dev tools using the command:
```
react-devtools
```

# If error
```
Uninstall react-native-elements and reinstalling it.
```

## Notes
Use
```
adb reverse tcp:8080 tcp:8080
```
for the frontend app to hit the backend server without 'Network Error'

Kill it with:
```
adb kill-server
```

To run emulator using a shortcut, open a notepad and paste the following:
```
cd /d C:\Users\%username%\AppData\Local\Android\sdk\emulator
emulator @Pixel_4_API_30
```
and save it as a batch file.

### Ongoing:
- Clean code and set up unit tests

## Todo:
- Change backend api hosting from heroku to render.com [Done]
- Bus Information page with First Bus, Last Bus and Bus Route 
  - Bus Route modal 
  - Information modal
  - Bus Location [Done]
- Add overlay settings page
- Auth (Clear states i.e, Auth, Settings when logging out. Use local async storage settings instead to load\save settings and offer a way to update the settings on the server when logged in.) [Done]
- Settings (Update the date modified for any updates)
- Settings page
  - Force download\upload of json data
- Redux as state management
- Bus Alerts
- Location Map [Done]
- Upload backend to Netlify\Azure\Heroku
- Upload frontend to Netlify\APK
- Save all bus stops to database and set the last updated time
  - To compare the last updated time from the server\current time and if it is later than the one in DB, drop the db and repopulate it again based on the latest data. To use 1 week for now (update weekly).
  - Remember to update \ delta the data for any fixes since LTA might be wrong.
- User Login using Passport JS and Mongo DB [Done]
  - Store user data on their device (bus stop list and favourites)
- Save the startup page accordingly in db settings
- Location based bus stop search [Done]
- Use an online DB like Mongo DB to store data and retrieve data instead [Done]
  - Have a job on the db server to parse new data from LTA and massage it every week
  - Locally store user's data and cached data from Mongo


## Known issues
- Facebook login doesn't work suddenly when using http. 
  - Fix is to change to https then back to http using the config json and server.js in backend.