const { loadImage } = require('canvas');

module.exports = async (client) => {
    client.bgs = {
        welcomeBackground: await loadImage(`./src/images/banner.png`),
        n1: await loadImage(`./src/images/profile1.png`),
        n2: await loadImage(`./src/images/profile2.png`),
        n3: await loadImage(`./src/images/profile3.png`),
        n4: await loadImage(`./src/images/profile4.png`)
    }
}