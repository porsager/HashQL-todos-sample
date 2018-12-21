# Todoey - A todo sample using Ey

To get started you need a local postgres server, node and npm.

```
npm install
createdb todoey
```

Check connection details in `server/index.js`

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
