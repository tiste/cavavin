# Cavavin

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tiste/cavavin&env=API_KEY,MONGO_URI&env-description=API%20Key%20and%20MongoDB%20URI%20for%20the%20application)

## Quick Start

Run `npm install` and `npm start` to launch the app.

### Environment

First, create the env file: `cp .env{.sample,}` (or `op inject -i .env.sample -o .env`)

You can now set the values in `.env` file.

To load them, either you export manually each environment variables of the `.env` file such as: `export API_NAME=...`
then `npm start`.

Or you can install `direnv` (`brew install direnv`), and allow sourcing from your current directory with `direnv allow`.

## Running tests

Run `npm test`

## Development

You can launch the API in dev mode, with `npm run start:dev`

---

⭐️ Feel free to [contact me](https://tiste.io/contact) if you liked this project, or want to work together.
