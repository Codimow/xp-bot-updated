// events/ready.js
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        // Initialize invites cache
        client.invites = {};
        client.guilds.cache.forEach(async (guild) => {
            const firstInvites = await guild.invites.fetch();
            client.invites[guild.id] = firstInvites.reduce((acc, inv) => {
                acc[inv.code] = inv.uses;
                return acc;
            }, {});
        });
    },
};