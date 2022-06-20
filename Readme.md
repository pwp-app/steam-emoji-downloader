# Steam Emoji Downloader

This is a useful tool that can download emoji or sticker from Steam by name.

[Here's the link](https://steamemoji.pwp.app)

## Scripts

Start a dev server:

```bash
npm run serve
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Tech points

### Convert APNG to GIF at client side

Here's the steps about how we did that:

1: Get apng file data from ajax request (returns an arraybuffer).

2: Using `apng-js` to parse a apng data.

3: Using `gif.js` to make a gif by the frames of apng.

## Related Projects

[apng-js](https://github.com/davidmz/apng-js)

[gif.js](https://github.com/jnordberg/gif.js)

[gif.js (modified by us)](https://github.com/backrunner/gif.js)

## Tips

If you want to build or deploy your own `Steam Emoji Downloader`, PLEASE MODIFY THE `CORS_HOST` CONSTANT IN `src/constants/urls.js`.

Here's a eazy tool to build your own cors proxy by Cloudflare Worker:

[worker-cors](https://github.com/backrunner/worker-cors)

## License

MIT
