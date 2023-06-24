module.exports = function (error, client){
    if (error.code === 50035) {
        const maxMessageLength = 2000;
        const replyChunks = splitIntoChunks(error.requestBody.json.content, maxMessageLength);

        // Obteniendo canal donde ocurrió el error
        const channelIdRegex = /channels\/(\d+)/;
        const channelIdMatch = error.url.match(channelIdRegex);
        const channelId = channelIdMatch ? channelIdMatch[1] : null;

        for (const chunk of replyChunks) {
            client.channels.cache.get(channelId).send(chunk);
        }
    }
}

function splitIntoChunks(text, chunkSize) {
    const chunks = [];
    const lines = text.split('\n');
    let currentChunk = '';

    for (const line of lines) {
        if (currentChunk.length + line.length + 1 <= chunkSize) {
            currentChunk += line + '\n';
        } else {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}