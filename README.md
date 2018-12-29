# Todoey - A todo sample using Hashql

To get started you need a local postgres server, node and npm.

```
npm install
createdb todoey
```

The default postgres connection is set to `postgres://localhost` if you need to connect with a specific user you can add a `.env` file with 
```
POSTGRES_URL=postgres://user:pass@localhost:5432/todoey
```

### To start in dev mode run 
```
npm run dev
```

This will send all sql queries raw to the server and give you a live reloading environment (both server and client)


### To start in simulated production run
```
npm start
```

This will bundle the application and replace all sql, in the bundled client code, with its md5 hash placed in `server/queries.json` which the server will use as a lookup when the client makes requests.
