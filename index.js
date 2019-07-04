const Discord = require("discord.js")
const fs = require('fs')
const premium_user = JSON.parse(fs.readFileSync("./bd.json", "utf8"))
const bd2 = JSON.parse(fs.readFileSync("./bd2.json", "utf8"))
    function write() {
        fs.writeFile("./bd.json", JSON.stringify(premium_user, null, "\t"), (err) => {
            if (err) console.log(err)
        })
    }

    function write2() {
        fs.writeFile("./bd2.json", JSON.stringify(bd2, null, "\t"), (err) => {
            if (err) console.log(err)
        })
    }

const client = new Discord.Client()
client.login(process.env.TOKEN);
client.on("ready", () => {
    console.log("Le bot a démaréer avec succèes !")
})
client.on("message",message => {
    if(bd2[message.guild.id] === undefined){
            bd2[message.guild.id] = {"prefix":"/"}
            write2()
    }
    const prefix = bd2[message.guild.id].prefix


const warns = JSON.parse(fs.readFileSync('./warns.json'))



setInterval(function(){

    var jeuxs = [
    `/help | V1`,
    `Nous sommes sur ${client.guilds.size} serveurs`];
  
    var jeux = jeuxs[Math.floor(Math.random()*jeuxs.length)];

    client.user.setPresence({ 
      game:{ 
        name: jeux, 
        type: 0
      } 
    });
}, 7000);



/*Kick*/
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)

    if (args[0].toLowerCase() === prefix + 'kick') {
        if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ;(")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Veuillez mentionner un utilisateur :x:")
        if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas kick cet utilisateur :x:")
        if (!member.kickable) return message.channel.send("Je ne peux pas exclure cet utilisateur :sunglass:")
        member.kick()
        message.channel.send('**' + member.user.username + '** a été exclu :white_check_mark:')
    }

/*Ban*/
if (args[0].toLocaleLowerCase() === prefix + 'ban') {
    if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande ;(")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("Veuillez mentionner un utilisateur :x:")
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas bannir cet utilisateur :x:")
    if (!member.bannable) return message.channel.send("Je ne peux pas bannir cet utilisateur :sunglass:")
    message.guild.ban(member, {
        days: 7
    })
    message.channel.send('**' + member.user.username + '** a été banni :white_check_mark:')
}

if (args[0].toLowerCase() === prefix + "clear") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let count = args[1]
    if (!count) return message.channel.send("Veuillez indiquer un nombre de messages à supprimer")
    if (isNaN(count)) return message.channel.send("Veuillez indiquer un nombre valide")
    if (count < 1 || count > 100) return message.channel.send("Veuillez indiquer un nombre entre 1 et 100")
    message.channel.bulkDelete(parseInt(count) + 1)
}

if (args[0].toLowerCase() === prefix + "mute") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("Membre introuvable")
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas mute ce membre")
    if (member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne peux pas mute ce membre")
    let muterole = message.guild.roles.find(role => role.name === 'Muted')
    if (muterole) {
        member.addRole(muterole)
        message.channel.send(member + ' a été mute :white_check_mark:')
    } else {
        message.guild.createRole({
            name: 'Muted',
            permissions: 0
        }).then(function (role) {
            message.guild.channels.filter(channel => channel.type === 'text').forEach(function (channel) {
                channel.overwritePermissions(role, {
                    SEND_MESSAGES: false
                })
            })
            member.addRole(role)
            message.channel.send(member + ' a été mute :white_check_mark:')
        })
    }
}

if (args[0].toLowerCase() === prefix + "warn") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("Veuillez mentionner un membre")
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas warn ce membre")
    let reason = args.slice(2).join(' ')
    if (!reason) return message.channel.send("Veuillez indiquer une raison")
    if (!warns[member.id]) {
        warns[member.id] = []
    }
    warns[member.id].unshift({
        reason: reason,
        date: Date.now(),
        mod: message.author.id
    })
    fs.writeFileSync('./warns.json', JSON.stringify(warns))
    message.channel.send(member + " a été warn pour " + reason + " :white_check_mark:")
}

if (args[0].toLowerCase() === prefix + "infractions") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("Veuillez mentionner un membre")
    let embed = new Discord.RichEmbed()
        .setAuthor(member.user.username, member.user.displayAvatarURL)
        .addField('10 derniers warns', ((warns[member.id] && warns[member.id].length) ? warns[member.id].slice(0, 10).map(e => e.reason) : "Ce membre n'a aucun warns"))
        .setTimestamp()
    message.channel.send(embed)
}

//unmute
if (args[0].toLowerCase() === prefix + "unmute") {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("Membre introuvable")
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas unmute ce membre.")
    if (member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne pas unmute ce membre.")
    let muterole = message.guild.roles.find(role => role.name === 'Muted')
    if (muterole && member.roles.has(muterole.id)) member.removeRole(muterole)
    message.channel.send(member + ' a été unmute :white_check_mark:')
}

//unwarn
if (args[0].toLowerCase() === prefix + "unwarn") {
    let member = message.mentions.members.first()
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
    if (!member) return message.channel.send("Membre introuvable")
    if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas unwarn ce membre.")
    if (member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne pas unwarn ce membre.")
    if (!warns[member.id] || !warns[member.id].length) return message.channel.send("Ce membre n'a actuellement aucun warns.")
    warns[member.id].shift()
    fs.writeFileSync('./warns.json', JSON.stringify(warns))
    message.channel.send("Le dernier warn de " + member + " a été retiré :white_check_mark:")
}

if (message.content === prefix + 'serverinfo') {

    const embed = new Discord.RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .addField("Nom", message.guild.name, true)
        .addField("ID", message.guild.id, true)
        .addField("Fondateur", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`, true)
        .addField("Total | Humains | Bots", `${message.guild.members.size} | ${message.guild.members.filter(member => !member.user.bot).size} | ${message.guild.members.filter(member => member.user.bot).size}`, true)
        .addField("Channels", message.guild.channels.size, true)
        .addField("Roles", message.guild.roles.size, true)
        .setThumbnail(message.guild.iconURL)
    message.channel.send({
        embed
    });
}

if (message.content === prefix + 'help') {

    const embed = new Discord.RichEmbed()

        .setTitle('**__Voici la page aide ! Petit rappel mon préfix et "/".__\n \n__Voici la légende :__\n<:disponible:595220008628387853> <:endev:594188572844883980> <:enmaintenance:594188443740012556> <:indisponible:594188513260601344>**')

        .setColor(0xFF0000)

        .setDescription('\n:shield: Commandes de modération → <:disponible:595220008628387853> (10) `kick`,`ban` ,`clear`,`mute`,`unmute`,`warn`,`unwarn`,`infractions`,`gban`,`prefix`\n \n:grinning: Commandes fun → <:disponible:595220008628387853> (2) `avatar`,`send`\n \n:robot: Commandes utiles → <:disponible:595220008628387853> (9) `serverinfo`,`ping`,`report`,`invite`,`support`,`help2`,`staff`,`premium`,`version`\n \n:shield: Commandes premium → <:disponible:595220008628387853> (1) `say`\n \n:shield: Commandes de owner → <:disponible:595220008628387853> (2) `addpremium`,`addpremium`\n')       
     
        .addField("**__Voici quelques informations :__**", "**Les () sont le nombres de commandes fonctionnels !**");
        message.channel.send(embed);
}

if (message.content === prefix + 'help2') {

    const embed = new Discord.RichEmbed()

        .setTitle('**__Voici la page aide ! Petit rappel mon préfix est "/".__\n \n__Voici la légende :__\n:disponible: :endev: :enmaintenance: :indisponible:**')

        .setColor(0xFF0000)

        .setDescription('\n:shield: Commandes de modération → <:disponible:595220008628387853> (10) `kick`,`ban` ,`clear`,`mute`,`unmute`,`warn`,`unwarn`,`infractions`,`gban`,`prefix`\n \n:grinning: Commandes fun → <:disponible:595220008628387853> (2) `avatar`,`send`\n \n:robot: Commandes utiles → <:disponible:595220008628387853> (9) `serverinfo`,`ping`,`report`,`invite`,`support`,`help2`,`staff`,`premium`,`version`\n \n:shield: Commandes premium → <:disponible:595220008628387853> (1) `say`\n \n:shield: Commandes de owner → <:disponible:595220008628387853> (2) `addpremium`,`addpremium`\n')       
     
        .addField("**__Voici quelques informations :__**", "**Les () sont le nombres de commandes fonctionnels !**");
        message.author.send(embed);
}

if (message.content === prefix + "staff"){
    message.channel.send({embed: {
        color: 3447003,
        description: "**Voici la liste du staff de SecuryBot :\n \n@Luny#2181**"
      }});
    }

    if (message.content === prefix + "premium"){
        let premium_user = JSON.parse(fs.readFileSync("./bd.json", "utf8"))
        var liste = ""; 
        for(i=0;i<premium_user.length;i++){
liste += "<@"+ premium_user[i] +">"+ "\n";
} 
let embed = new Discord.RichEmbed()
.setTitle("Voici la liste des premiums :\n")
.setDescription(liste)
message.channel.send(embed)
    }

        if (message.content === prefix + "version"){
            message.channel.send({embed: {
                color: 3447003,
                description: "**Voici la version du bot :\n \nV1**"
              }});
            }

if(message.content.startsWith(prefix + "send")) {
    let prepamsg = message.content.split(" ").slice(1);
     let msg = prepamsg.join(" ")
     
    const sended = new Discord.RichEmbed()
    .setTitle("message de "+ message.author.username)
    .setDescription(msg)
    message.channel.send(sended)
    
    }

    if(message.content.startsWith(prefix + "say")) {
        if(!premium_user.includes(message.author.id)) return message.channel.send("Vous n'êtes pas premium")
        let prepamsg = message.content.split(" ").slice(1);
         let msg = prepamsg.join(" ")

         const sended = new Discord.RichEmbed()
         .setDescription(msg)
         message.channel.send(sended)
        }

if (args[0].toLowerCase() === prefix + "avatar") {
    let member = message.mentions.members.first()
    if (!member) return message.channel.send("**Merci de bien vouloir mentionner la personne !!**")
    let embed = new Discord.RichEmbed()
        .setTitle("Avatar")
        .setDescription(`${message.author.username} **voici la photo de profil de** ${message.mentions.users.first().username} **!**`)
        .setImage(message.mentions.users.first().avatarURL)
        .setTimestamp()
        .setColor("#BE81F7")
        .setFooter(" SecuryBot | Avatar")
    message.channel.send(embed)
    message.delete();

}

if (message.content === prefix + 'invite') {

    const embed = new Discord.RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setColor("RANDOM")
        .setDescription('**Voici le lien du bot : https://discordapp.com/oauth2/authorize?client_id=595350747818754054&scope=bot&permissions=2146958847**', true)
    message.channel.send({
        embed
    });
}

if (message.content === prefix + 'support') {

    const embed = new Discord.RichEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setColor("RANDOM")
        .setDescription('**Voici le lien support : https://discord.io/SecuryBotSupport**', true)
    message.channel.send({
        embed
    });
}

if (args[0].toLowerCase() === prefix + "ping") {
    message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");        
}

if (message.content.startsWith(prefix + "report")) {
    const args2 = message.content.slice(prefix.length).trim().split(' ');
    let reported = message.mentions.users.first();
    let reason = args2.join(' ').slice(29)
    if(!reported) return message.channel.send('Utilisateur introuvable !')
    if(!reason) return message.reply(', vous devez donner une raison à ce report !!')
    message.channel.send('Votre report a bien été envoyé !')
    message.guild.channels.filter(c => c.type === "text").random().createInvite().then(invite => {let lien = invite.code;
    client.guilds.get('595296116904558612').channels.get('595297630737661952').send(`${reported} a été report sur **${message.guild.name}** pour \`${reason}\` : https://discord.gg/${lien}`);
    })
}

if (message.content.startsWith(prefix + "addpremium")) {
    if(message.author.id !== "595293622262562817") return message.channel.send("vous n'avez pas la permission")

    let user = message.mentions.users.first()
    if(!user) return message.reply("utilisateur introuvable")

    premium_user.push(user.id)
    write()
    message.channel.send(user + " a été ajouté a la liste des premiums !")
}

if (message.content.startsWith(prefix + "removepremium")) {
    if(message.author.id !== "595293622262562817") return message.channel.send("vous n'avez pas la permission")

    let user = message.mentions.users.first()
    if(!user) return message.reply("utilisateur introuvalbe")

   premium_user.splice(premium_user.indexOf(user.id), 1)
    write()

    message.channel.send(`<@${user.id}> a été enlevé de la liste des premiums !`)
}
let messageKick = message.content.split(" ");
let infos = messageKick.slice(1);
if(message.content.startsWith(prefix + "prefix")){
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
    let newPrefix = infos.join(" ").slice(0)
    if(!newPrefix) return message.channel.send("vous devez entrer un nouveau prefix")
    if(newPrefix.length > 1) return message.channel.send("Le prefix ne doit pas dépasser 1 caractère")
    bd2[message.guild.id].prefix = newPrefix
    write2()
    message.channel.send("prefix modifié")
}
});

client.on('guildMemberAdd', function (member) {
    let embed = new Discord.RichEmbed()
        .setDescription(':tada: **' + member.user.username + '** a rejoint ' + member.guild.name)
        .setFooter('Nous sommes désormais ' + member.guild.memberCount)
        member.guild.channels.get('595297605873827861').send(embed)
    // member.addRole('ID DU ROLE A AJOUTER AUTOMATIQUEMENT')
    })

client.on('guildMemberRemove', function (member) {
    let embed = new Discord.RichEmbed()
        .setDescription(':cry: **' + member.user.username + '** a quitté ' + member.guild.name)
        .setFooter('Nous sommes désormais ' + member.guild.memberCount)
    member.guild.channels.get('595297605873827861')
})
     
