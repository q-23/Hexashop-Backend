# Hexashop

Ecommerce application written in Node.JS, Express.JS, with MongoDB as database.
## Installation

Use the package manager [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/) to install dependencies.

```bash
yarn install || npm install
```

## Usage


1. In main directory create folder named "config".
2. Create two files - dev.env and test.env
3. Fill in your environment variables, which are the following:

✳️PORT - port on which your server will be running.

✳️MONGODB_URL - database url.

✳️SENDGRID_API_KEY - Sendgrid API key for sending E-mails.

✳️JWT_SECRET - Web token secret phrase.

With this done, run
```bash
yarn dev || npm run dev - to run in development mode
yarn start || npm run start - to run in production mode
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)