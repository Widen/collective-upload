collective-upload
----

Simple proof-of-concept application that can upload assets to [Widen Media Collective](www.widen.com) using the [node-collective](https://www.npmjs.com/package/media-collective) client to the [Media Collective REST API](http://docs.widen.apiary.io/).

# Getting Started

- First, ensure you have set up proper OAuth credentials with Collective.


- Second, set the proper environment variables based on the credentials you got from the previous step:

```
export COLLECTIVE_CLIENT_ID=foo
export COLLECTIVE_CLIENT_SECRET=bar
```

- Third, you may want to edit the default `node-collective` options in the sources (e.g., *protocol*, *port*, and *host* -- *auth* is probably ok).

```
var collective_options = {
    protocol: 'http',
    port: 8080,
    host: 'localhost',
    # I have a simple service to get
    # auth token from a cookie in
    # the code already, so don't
    # change that.

};

```

- Fourth, run the server:

```
npm run dev
```

OR

```
npm run start -- <OPTIONS>
```

Where `<OPTIONS>` is the options needed to connect to your Collective instance. (optional -- defaults to local development url)

- Fifth, open your browser:

```
http://localhost:1337
```
