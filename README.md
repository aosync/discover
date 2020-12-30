# discover

Downloads all images in a channel.

## Usage

```sh
node ./index.js <userToken>
```

Then, go into the user DMs and type
```
launch <channelID>
```
to start downloading all images.

The default rate is 30 concurrent downloads. This might be changed in src/Events.js.