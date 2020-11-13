{
    "database": {
      "rules": "database.rules.json"
    },
    "hosting": {
      "public": "build",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  }
export default firebaseConfig;