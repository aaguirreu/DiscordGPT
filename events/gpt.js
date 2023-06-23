const { Events } = require('discord.js');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
var escribiendo = false;

var context = [];

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return; // Ignorar mensajes de otros bots
        if (message.channel.id !== channelId) return; // Ignorar mensajes de otros canales
        
        if (escribiendo) { // Si el bot está escribiendo, borrar el mensaje
            message.delete()
            .catch((error) => console.error('Error al borrar el mensaje:', error));
            return;
        }
        escribiendo = true; // Establecer el estado de escritura a verdadero

		const channelId = process.env.CHANNEL_ID; // Reemplaza esto con el ID del canal específico

        if (context.length > 20) context.shift() // máximo 20 mensajes en la historia
        // Obtener el contenido del mensaje
        context.push({ role: 'user', content: message.content });

		// Enviar la consulta a ChatGPT
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: `${context}`},
                {role: "user", content: `${message}`},
              ],
        });
        // Obtener la respuesta generada por ChatGPT
        const reply = chatCompletion.data.choices[0].message;

        // Agregar la respuesta a la historia de mensajes
        context.push({ role: 'assistant', content: reply });
        
        // Aquí puedes realizar acciones con la respuesta generada, como enviarla de vuelta al canal de Discord
        message.channel.send(reply)
        .then(escribiendo = false) // Establecer el estado de escritura a falso
	},
};