# Steam Emoji Extractor

This is a website that can download emoji or sticker from Steam directly.

## Tech point

### Convert APNG to GIF at client side

Here's the steps about how we did that:

1: Get apng file data from ajax request (returns an arraybuffer).

2: Use `apng-js` to parse a apng data.

3: Use `gif-js` to make a gif by frames of apng.

## Related Projects

[apng-js](https://github.com/davidmz/apng-js)
[gif-js](https://github.com/jnordberg/gif.js)
[gif-js (modified by us)]()

## Tips

If you want to build or deploy your own `Steam Emoji Extractor`, PLEASE MODIFY THE `CORS_HOST` CONSTANT IN `src/constrants/urls.js`.

Here's a eazy tool to build a cors proxy by using Cloudflare Worker:

[worker-cors](https://github.com/backrunner/worker-cors)

## License

MIT
