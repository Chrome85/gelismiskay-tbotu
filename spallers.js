const Discord = require("discord.js");
const moment = require("moment")
const ayarlar = require("./ayarlar.json")
const db = require("wio.db")
const jimp = require("jimp")
const client = new Discord.Client();
const express = require("express");
const app = express();
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');


//Uptime için__________________________________________________________________
app.get("/", (req, res) => {
  res.send("Bot Başarıyla Uptime Ediliyor . . .");
});
app.listen(process.env.PORT);

//KOMUT Algılayıcı______________________________________________________________

client.commands = new Discord.Collection();

fs.readdir("./komutlar/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let cmd = require(`./komutlar/${file}`);
    let cmdFileName = file.split(".")[0];
    console.log(`Komut Yükleme Çalışıyor: ${cmdFileName}`);
    client.commands.set(cmd.help.name, cmd);
  });
});
//EVENTS Yükleyici_______________________________________________________________
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    console.log(`Etkinlik Yükleme Çalışıyor: ${eventName}`);
    client.on(eventName, event.bind(null, client));
  });
});

client.on("ready", () => {
  console.log(`${client.user.tag}! Aktif!`);
});
//BOT ÇALIŞTIRICI______________________________________________________________
client.login(ayarlar.token)

//////////////////////////////////////////////////////////////////////////////////

client.on("guildMemberAdd", member => {
  let guild = member.guild;
  let kanal = db.fetch(`kayıthg_${member.guild.id}`);
  let kayıtçı = db.fetch(`kayıtçırol_${member.guild.id}`);
  let aylartoplam = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
  };
  let aylar = aylartoplam;

  let user = client.users.cache.get(member.id);
  require("moment-duration-format");

  const kurulus = new Date().getTime() - user.createdAt.getTime();
  const ayyy = moment.duration(kurulus).format("M");
  var kontrol = [];

  if (ayyy < 1) {
    kontrol = "**Şüpheli** :Carpi:";
  }
  if (ayyy > 1) {
    kontrol = "**Güvenilir** <:onaytiki:907277646344372305>";
  }

  if (!kanal) return;

  ///////////////////////

  let randomgif = [ 
             "https://media.discordapp.net/attachments/744976703163728032/751451554132918323/tenor-1.gif", "https://media.discordapp.net/attachments/744976703163728032/751451693992116284/black.gif", "https://media.discordapp.net/attachments/765870655958548490/765871557993824256/tumblr_ozitqtbIIf1tkflzao1_540.gif", "https://media.discordapp.net/attachments/765870655958548490/765871565257965578/68747470733a2f2f692e70696e696d672e636f6d2f6f726967696e616c732f32622f61352f31312f32626135313161663865.gif", "https://cdn.discordapp.com/attachments/780550397693657129/781490237184016404/584b9b8561c106fd5ba81300e9fa47a7.gif", "https://cdn.discordapp.com/attachments/780550397693657129/781490231781359626/f7ee8cd4766ff13159ffd6383156b136.gif", "https://cdn.discordapp.com/attachments/780550397693657129/781490364119908382/85GW.gif", "https://cdn.discordapp.com/attachments/780550397693657129/781490683847901194/original.gif", "https://cdn.discordapp.com/attachments/780550397693657129/781490442490740746/tenor.gif", "https://cdn.discordapp.com/attachments/782364044988121128/783105243625947176/source.gif", "https://cdn.discordapp.com/attachments/782364044988121128/783105115057946654/cd3afdcabfec8c297e55793cfebf9f6d.gif"];

  ///////////////////

  const embed = new Discord.MessageEmbed()
    .setColor("#f6ff00")
    .setImage(randomgif[Math.floor(Math.random() * randomgif.length)])
    .setThumbnail(
      user.displayAvatarURL({
        dynamic: true,
        format: "gif",
        format: "png",
        format: "jpg",
        size: 2048
      })
    )

 //
  .setDescription(` **Hoş geldin!** ${
        member.user
      }, seninle beraber **${
        guild.memberCount
      }** kişi olduk! \n <:onaytiki:907277646344372305> Kaydının yapılması için **isim** ve **yaş** yazman gerek. \n  Hesap kuruluş tarihi: **${moment(
        user.createdAt
      ).format("DD")} ${aylar[moment(user.createdAt).format("MM")]} ${moment(
        user.createdAt
      ).format(
        "YYYY HH:mm:ss"
       )}** \n  Bu vatandaş: ${kontrol} \n  <@&${kayıtçı}> rolündeki yetkililer sizinle ilgilenecektir.`);
  //
  client.channels.cache.get(kanal).send(embed);
  client.channels.cache.get(kanal).send(`||<@&${kayıtçı}>||`);
});
  

/////////////////////// OTOROL /////////////////////////
client.on('guildMemberAdd', member => {
    let rol = db.fetch(`autoRole_${member.guild.id}`) 
    if(!rol) return;
    let kanal = db.fetch(`autoRoleChannel_${member.guild.id}`) 
    if(!kanal) return;

 member.roles.add(member.guild.roles.cache.get(rol))
    let embed = new Discord.MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL({dynamic:true}))     
    .setDescription('>  <a:galp:778787614794186752> **<@' + member.user.id+  '>** **Adlı Kullanıcı Aramıza Katıldı** \n> **Kullanıcısına Başarıyla** <@&' + rol + '> **Rolü verildi**')
    .setColor('#f6ff00')    //.setFooter(`<@member.id>`)
    .setFooter('Chondixi Tercih Ettiğiniz İçin Teşekkür Ederiz.')
    member.guild.channels.cache.get(kanal).send(embed)

})
//////////////////////// OTOROL SON //////////////////////////

///////////////////////// SAYAÇ ////////////////////
//-----------------------Sayaç-----------------------\\


client.on("guildMemberAdd", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = client.channels.cache.get(skanal9)
  if (!skanal31) return;
  const geldi = new Discord.MessageEmbed()
.setColor('#f6ff00')
.setThumbnail(member.user.displayAvatarURL({dynamic : true}))
.addField( `***╭−−−−−−−−−−− \`『 °Chondix Sayaç° 』\` −−−−−−−−−−−−╮ ***`,
    `
**┊**  **${member}** Sunucuya Katıldı
**┊**  **${sayac}** Kişi Olmamıza **${sayac - member.guild.memberCount}** Kişi Kaldı
**┊**  Toplam **${member.guild.memberCount}** Kişiyiz !
**╰−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−╯**
  `)
  skanal31.send(geldi)
});

client.on("guildMemberRemove", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = client.channels.cache.get(skanal9)
  if (!skanal31) return;
const gitti = new Discord.MessageEmbed()
.setColor('#f6ff00')
.setThumbnail(member.user.displayAvatarURL({dynamic : true}))
.addField( `***╭−−−−−−−−−−− \`『 °Chondix Sayaç° 』\` −−−−−−−−−−−−╮ ***`,
    `
**┊**  **${member}** Sunucudan Ayrıldı
**┊**  **${sayac}** Kişi Olmamıza **${sayac - member.guild.memberCount}** Kişi Kaldı
**┊**  Toplam **${member.guild.memberCount}** Kişiyiz !
**╰−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−╯**
   `)
  skanal31.send(gitti)
});

//-----------------------Sayaç Son-----------------------\\


client.on("guildMemberAdd", async member => {
  let user = member.guild.members.cache.get(member.id);

  let kanal = await db.fetch(`güvenlik_${member.guild.id}`);
  if (!kanal) return; 
 
  const embed = new Discord.MessageEmbed()
        .setDescription(`${member} **Sunucuya Katıldı!** \n**Güvenlik İçin Hesabına Gerekli Rolü Verdim.**`)
        .setColor('#f6ff00');
      client.channels.cache.get(kanal).send(embed);
      let rol1 = await db.fetch(`güvenlikalınacak_${member.guild.id}`);
      let rol2 = await db.fetch(`güvenlikverilecek_${member.guild.id}`);
      if (!rol1) {
        if (!rol2) {
          return;
        } else {
          member.roles.add(rol2);
          return;
        }
      } else {
        member.roles.remove(rol1);
        if (!rol2) {
          return;
        } else {
          member.roles.add(rol2);
          return;
        }
      }
      {
      const embed = new Discord.MessageEmbed()
      .setThumbnail(user.author.displayAvatarURL({dynamic : true}))
      .setColor('#f6ff00')
      .setDescription(`${member} **Sunucuya Katıldı!** \n**Güvenlik İçin Hesabına Gerekli Rolü Verdim.**`)
      client.channels.cache.get(kanal).send(embed);
      let rol1 = await db.fetch(`güvenlikfake_${member.guild.id}`);
      if (!rol1) return;
      else {
        member.roles.add(rol1);
      }
    }
  }
)

////////////////////////// EKLENDİM ATILDIM ////////////////////
client.on("guildCreate", async guild => {
let embed = new Discord.MessageEmbed()
var botOwnerID = "477189482206986240";
var guildOwner = guild.owner.user
var guildOwnerTag = guild.owner.user.tag
var guildid = guild.id
var guildName = guild.name
var guildMemberCount = guild.memberCount

embed.setTitle(`Yeni Sunucu!`)
embed.addField("Sunucu adı", guildName)
embed.addField("Sunucu ID", guildid)
embed.addField("Sunucu üye sayısı", guildMemberCount)
embed.addField("Sunucu sahibi", guildOwnerTag)
embed.addField("Şuan ki Kullanıcı : ",
      client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString(),
      true
    )
embed.addField(
      "Şuan ki Sunucu sayısı",
      client.guilds.cache.size.toLocaleString(),
      true
    )
embed.setColor("#f6ff00")

embed.setFooter(guildName, guild.iconURL)
embed.setThumbnail(guild.iconURL)

client.users.cache.get(botOwnerID).send(embed)

})

client.on("guildDelete", async guild => {
let embed = new Discord.MessageEmbed()
var botOwnerID = "477189482206986240";
var guildOwner = guild.owner.user
var guildOwnerTag = guild.owner.user.tag
var guildid = guild.id
var guildName = guild.name
var guildMemberCount = guild.memberCount

embed.setTitle("Sunucudan Attılar Piçler")
embed.addField("Sunucu adı", guildName)
embed.addField("Sunucu ID", guildid)
embed.addField("Sunucu üye sayısı", guildMemberCount)
embed.addField("Sunucu sahibi", guildOwnerTag)
embed.addField("Şuan ki Kullanıcı : ",
      client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString(),
      true
    )
embed.addField(
      "Şuan ki Sunucu sayısı",
      client.guilds.cache.size.toLocaleString(),
      true
    )
  embed.setColor("#f6ff00")
embed.setFooter(guildName, guild.iconURL)
embed.setThumbnail(guild.iconURL)

client.users.cache.get(botOwnerID).send(embed)
});

////reklam-engel

const reklam = [
  ".com",
  ".net",
  ".xyz",
  ".tk",
  ".pw",
  ".io",
  ".me",
  ".gg",
  "www.",
  "https",
  "http",
  ".gl",
  ".org",
  ".com.tr",
  ".biz",
  "net",
  ".rf",
  ".gd",
  ".az",
  ".party",
".gf"
];
client.on("messageUpdate", async (old, nev) => {

if (old.content != nev.content) {
let i = await db.fetch(`reklam.${nev.member.guild.id}.durum`);
let y = await db.fetch(`reklam.${nev.member.guild.id}.kanal`);
if (i) {

if (reklam.some(word => nev.content.includes(word))) {
if (nev.member.hasPermission("BAN_MEMBERS")) return ;
 //if (ayarlar.gelistiriciler.includes(nev.author.id)) return ;
const embed = new Discord.MessageEmbed() .setColor('#f6ff00') .setDescription(`:Carpi: ${nev.author} , **Mesajını editleyerek reklam yapmaya çalıştı!**`)
      .addField("Mesajı:",nev)
  
      nev.delete();
      const embeds = new Discord.MessageEmbed() .setColor('#f6ff00') .setDescription(`:Carpi: ${nev.author} , **Mesajı editleyerek reklam yapamana izin veremem!**`) 
    client.channels.cache.get(y).send(embed)
      nev.channel.send(embeds).then(msg => msg.delete({timeout:5000}));
    
}
} else {
}
if (!i) return;
}
});

client.on("message", async msg => {


if(msg.author.bot) return;
if(msg.channel.type === "dm") return;
   let y = await db.fetch(`reklam.${msg.member.guild.id}.kanal`);

let i = await db.fetch(`reklam.${msg.member.guild.id}.durum`);
    if (i) {
        if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
          try {
           if (!msg.member.hasPermission("MANAGE_GUILD")) {
           //  if (!ayarlar.gelistiriciler.includes(msg.author.id)) return ;
msg.delete({timeout:750});
              const embeds = new Discord.MessageEmbed() .setColor('#f6ff00') .setDescription(`:Carpi: <@${msg.author.id}> , **Bu sunucuda reklam yapmak yasak!**`)
msg.channel.send(embeds).then(msg => msg.delete({timeout: 5000}));
                     db.add(`reklam_${msg.guild.id}_${msg.author.id}`, 1)

          const embed = new Discord.MessageEmbed() .setColor('#f6ff00') .setDescription(`:Carpi: ${msg.author} , **Reklam yapmaya çalıştı!**`) .addField("Mesajı:",msg)
         client.channels.cache.get(y).send(embed)
            }              
          } catch(err) {
            console.log(err);
          }
        }
    }
   if(!i) return ;
});


//reklam engel son //

//-----------------------Reklam Engel Son-----------------------\\
client.on("message", async msg => {
  //const args = msg.content.slice.split(' ');
  const args = msg.content.trim().split(/ +/g);
  const fAK = await db.fetch(`filtreAK_${msg.guild.id}`);
  let mesaj = args.slice(1).join(" ");
  const filtre = await db.fetch(`filtre_${msg.guild.id}`);
  const kufur = [
    "mk",
    "göt",
    "meme",
    "pipi",
    "am",
    "taşşak",
    "amk",
    "amq",
    "aq",
    "orospu",
    "oruspu",
    "yavşak",
    "oç",
    "sikerim",
    "yarrak",
    "piç",
    "amq",
    "sik",
    "amcık",
    "çocu",
    "oç",
    "sex",
    "seks",
    "amına",
    "orospu çocuğu",
    "sg",
    "kahpe",  
    "kahbe", 
    "siktir git"
  ];

  const reklam = [
    ".ml",
    "discord.gg",
    "invite",
    "discordapp",
    "discordgg",
    ".com",
    ".net",
    ".xyz",
    ".tk",
    ".pw",
    ".io",
    ".me",
    ".gg",
    "www.",
    "https",
    "http",
    ".gl",
    ".org",
    ".com.tr",
    ".biz",
    ".party",
    ".rf.gd",
    ".az",
    "glitch.me",
    "glitch.com"
  ];

  let kufures = await db.fetch(`kuyarr_${msg.author.id}`);
  let linkes = await db.fetch(`luyarr_${msg.author.id}`);
  let ads = msg.author.id;
  if (fAK == "açık") {
    const fltr = filtre;
    if (fltr.some(word => msg.content.includes(word))) {
      if (!msg.member.hasPermission("BAN_MEMBERS")) {
        msg.delete();

        var k = new Discord.MessageEmbed()
          .setColor("#f6ff00")
          .setAuthor("Filtre Sistemi")
          .setDescription(
            `Bu sunucuda yasaklanmış bir kelimeyi kullandınız, bu yüzden mesajınızı sildim.`
          );
        msg.channel.send(k).then(a=>a.delete({timeout:10000}));

        return;
      }
    }
  }
  
  if (!msg.guild) return;

  if (db.has(`küfürE_${msg.guild.id}`) === true) {
    if (kufur.some(word => msg.content.toLowerCase().includes(word))) {
      if (!msg.member.hasPermission("ADMINISTRATOR")) {
        msg.delete();

        var k = new Discord.MessageEmbed()
          .setColor("#f6ff00")
          .setAuthor("Küfür Engeli!")
          .setDescription(
            `Hey <@${msg.author.id}>, Bu sunucuda küfürler **${client.user.username}** tarafından engellenmektedir! Küfür etmene izin vermeyeceğim! :Carpi:`
          );
        db.add(`küfür_${msg.guild.id}_${msg.author.id}`, 1)
        msg.channel.send(k).then(a=>a.delete({timeout:10000}));
    
      }
    }
  }
});

//-------------------KÜFÜR ENGEL SON-----------------------\\

//-----------------------Sa-As-----------------------\\
//-----------------------Sa-As-----------------------\\

client.on('message', async (msg, member, guild) => {
  let i = await  db.fetch(`saas_${msg.guild.id}`)
      if(i === 'açık') {
        if (msg.content.toLowerCase() === 'sa'){
          
        const sa = new Discord.MessageEmbed()
        .setColor('#f6ff00')
        .setFooter(`${msg.author.tag} Selam Verdi.`, msg.author.avatarURL())
        .addField('Aleykum Selam Hoşgeldin İyi misin ?','İnşallah İyisindir.')
          msg.channel.send(sa).then(a=>a.delete({timeout:10000}));
      }
      }
    });

client.on('message', async (msg, member, guild) => {
  let i = await  db.fetch(`saas_${msg.guild.id}`)
      if(i === 'açık') {
        if (msg.content.toLowerCase() === 'hi'){
          
        msg.reply('**Hi welcome**').then(a=>a.delete({timeout:10000})); 
      }
      }
    });

client.on('message', async (msg, member, guild) => {
  let i = await  db.fetch(`saas_${msg.guild.id}`)
      if(i === 'açık') {
        if (msg.content.toLowerCase() === 'sea'){
          
        const sea = new Discord.MessageEmbed()
        .setColor('#f6ff00')
        .setFooter(`${msg.author.tag} Selam Verdi.`, msg.author.avatarURL())
        .addField('Aleykum Selam Hoşgeldin İyi misin ?','İnşallah İyisindir.')
          msg.channel.send(sea).then(a=>a.delete({timeout:10000})); 
      }
      }
    });
client.on('message', async (msg, member, guild) => {
  let i = await  db.fetch(`saas_${msg.guild.id}`)
      if(i === 'açık') {
        if (msg.content.toLowerCase() === 'iyiyim'){
          
        const iyilik = new Discord.MessageEmbed()
        .setColor('#f6ff00')
        .setFooter(`${msg.author.tag} İyi Olmana Sevindim.`, msg.author.avatarURL())
        .addField('Ohhh Ne Güzel!','Allah Dahada İyilik Versin.')
          msg.channel.send(iyilik).then(a=>a.delete({timeout:10000}));  
      }
      }
    });
client.on('message', async (msg, member, guild) => {
  let i = await  db.fetch(`saas_${msg.guild.id}`)
      if(i === 'açık') {
        if (msg.content.toLowerCase() === 'kötüyüm'){
          
        const kötülük = new Discord.MessageEmbed()
        .setColor('#f6ff00')
        .setFooter(`${msg.author.tag} Kötü Olmana Üzüldüm.`, msg.author.avatarURL())
        .addField('Senin Adına Üzüldüm.','Allah İyilik Versin Patron. Seviliyorsun Unutma')
          msg.channel.send(kötülük).then(a=>a.delete({timeout:10000}));  
      }
      }
    });



//-----------------------Sa-As Son-----------------------\\
//-----------------------Sa-As Son-----------------------\\



///////////////////////OtoCevap////////////////////////////
client.on("message", msg => {
  if (msg.content.toLowerCase() === "Chondix") {
    const oto = new Discord.MessageEmbed()
    .setThumbnail(msg.author.displayAvatarURL({dynamic : true}))
    .setColor('#f6ff00')
    .setTitle("▬▬▬▬[ Yardım Mesajım <a:kral:778787824018653205>]▬▬▬▬\n ")
    .addField("\n**Galiba Benden Yardım İstiyorsun ? O zaman Sana Yardım Edeyim.**\n","**\n`.yardım` Yazarak Benim `Tüm Komutlarımı Görebilirsin` ve Aşşağıdaki `Destek Sunucusuna Gelerek Botun Sahibinden Yardım Alabilirsin.`**")
    .addField("**➥ Link**", "[<a:kral:778787824018653205> Destek Sunucu](https://discord.gg/esXbPnr)")
    .setImage("https://cdn.discordapp.com/attachments/767544528537649193/782343691221205052/standard.gif")
    .setFooter(`${msg.author.username} Yardım Edebildiysem Çok Mutluyum.`, msg.author.avatarURL())
        
    msg.channel.send(oto).then(a=>a.delete({timeout:10000}));
    }
});
///////////////////////OtoCevap Bitiş////////////////////////////

///////////////////// UPTİME SİSTEMİİİ /////////////////////////
require("express")().listen(1343);

const discord = require("discord.js");
const ders = new discord.Client({ disableEveryone: true });
const fetch = require("node-fetch");

setInterval(() => {
  var links = db.get("linkler");
  if(!links) return 
  var linkA = links.map(c => c.url)
  linkA.forEach(link => {
    try {
      db.fetch(link)
    } catch(e) { console.log("" + e) };
  })
  console.log("Başarıyla Pinglendi.")
}, 60000)

client.on("ready", () => {
if(!Array.isArray(db.get("linkler"))) {
db.set("linkler", [])
}
})

client.on("ready", () => {
  console.log(`UPTİME SİSTEMİ BAŞARIYLA ÇALIŞIYOR / Chondix BOT`)
})


client.on("message", message => {
  if(message.author.bot) return;
  var spl = message.content.split(" ");
  if(spl[0] == ".ekle") {
  var link = spl[1]
  fetch(link).then(() => {
    let yardım = new Discord.MessageEmbed()
        .setAuthor(client.user.username)
        .setColor('#f6ff00')
        .setDescription("**<a:tmdir:778774341357797378> Başarılı! Projeniz artık 7/24!**")
        .setFooter(`© ${client.user.username}`)
        .setTimestamp()
     message.channel.send(yardım).then(msg => msg.delete(60000)); 
    db.push("linkler", { url: link, owner: message.author.id})
  }).catch(e => {
    let yardım = new Discord.MessageEmbed()
        .setAuthor(client.user.username)
        .setColor('#f6ff00')
        .setDescription("**<:nope:779036675338010654> Hata! Sadece düzgün url'ler ekleyebilirsiniz.**")
        .setFooter(`© ${client.user.username}`)
        .setTimestamp()
   return message.channel.send(yardım).then(msg => msg.delete(60000));
  })
  }
})


client.on("message", message => {
  if(message.author.bot) return;
  var spl = message.content.split(" ");
  if(spl[0] == ".botsay") {
  var link = spl[1]
 message.channel.send(`**Şuanda \`1000\` Slots Arasından Sadece \`${db.get("linkler").length}\` Slotu Kullanılıyor.**`)
}})

  const log = message => {
  console.log(`${message}`);
}
  
  
//-------------------- Afk Sistemi --------------------//
//-------------------- Afk Sistemi --------------------//
//-------------------- Afk Sistemi --------------------//


client.on('message', async message => {
if(message.channel.type !== 'text') return;
if(message.author.bot) return;
if(message.content.startsWith('.afk')) return;
if(message.mentions.members.first()) {
let mention = message.mentions.members.first();
const est = await db.fetch(`kullanıcı.${mention.id}.${message.guild.id}`);
if(est) {
message.channel.send(new Discord.MessageEmbed().setThumbnail(mention.user.avatarURL() ? mention.user.avatarURL({dynamic: true}) : 'https://cdn.glitch.com/8e70d198-9ddc-40aa-b0c6-ccb4573f14a4%2F6499d2f1c46b106eed1e25892568aa55.png')
.setTitle('Etiketlediğin Kullanıcı AFK').setColor('#f6ff00').setDescription(` \n**• __Sebep;__ \`${est}\`**`));
}
}
const stat = await db.fetch(`name.${message.author.id}.${message.guild.id}`);
if(stat) {
message.member.setNickname(stat);
db.delete(`kullanıcı.${message.author.id}.${message.guild.id}`);
db.delete(`name.${message.author.id}.${message.guild.id}`);
message.channel.send(new Discord.MessageEmbed().setColor('#f6ff00').setDescription(`${message.author} **Cihaz üzerine tekrardan hoş geldin!**`));
}
})


//-------------------- Afk Sistemi --------------------//
//-------------------- Afk Sistemi --------------------//
//-------------------- Afk Sistemi --------------------//
          
    
  

//-------------------- Mesaj Sayar -------------------//

  client.on("message", async (darkcode) => {
if(darkcode.author.bot === true) return

 if(darkcode.content.length >= 10) {
  db.add(`msayarfazla_${darkcode.guild.id}_${darkcode.author.id}`, 1) 
 } else {
     db.add(`msayaraz_${darkcode.guild.id}_${darkcode.author.id}`, 1) 

 } 
})
//-------------------- Mesaj Sayar SON -------------------//



//-------------------- Resim Sayar -------------------//

client.on("message", async darkcode => {
  if (darkcode.author.bot === true) return;
  if (darkcode.attachments.size < 1) {
db.add(`msayarfazla_${darkcode.guild.id}_${darkcode.author.id}`, 1);
  } else {
db.add(`msayaraz_${darkcode.guild.id}_${darkcode.author.id}`, 1);
  }
});

//-------------------- Resim Sayar SON -------------------//

client.on('userUpdate', (oldUser, newUser) => {
client.guilds.cache.forEach(async guild => {
if(!guild.members.cache.get(newUser.id)) return;
const tagFetch = await db.fetch(`tag.${guild.id}`);
const roleFetch = await db.fetch(`tag.role.${guild.id}`);
const logFetch = await db.fetch(`tag.log.${guild.id}`);
if(!tagFetch || !roleFetch || !logFetch) return;
let tag = tagFetch;
let role = guild.roles.cache.get(roleFetch);
let log = guild.channels.cache.get(logFetch);
if(oldUser.username === newUser.username) return;
if(newUser.username.includes(tag) && !oldUser.username.includes(tag)) {
log.send(new Discord.MessageEmbed()
.setTitle('Chondix - TAG Alındı.')
.setColor('#f6ff00')
.setDescription(`${newUser} **Aramıza hoşgeldin. \`${tag}\` tagını aldığı için ${role} rolü verildi!**`));
guild.members.cache.get(newUser.id).roles.add(role.id);
}
if(oldUser.username.includes(tag) && !newUser.username.includes(tag)) {
log.send(new Discord.MessageEmbed()
.setTitle('Chondix - TAG Çıkarıldı.')
.setColor('#f6ff00')
.setDescription(`${newUser} **Aramızdan ayrıldı. \`${tag}\` tagını çıkardığı için ${role} rolü alındı!**`));
guild.members.cache.get(newUser.id).roles.remove(role.id);
}
})
})

//////////////// SUNUCU PANEL /////////////////////////
client.on("guildMemberAdd", async(member) => {
  let sunucupaneli = await db.fetch(`sunucupanel_${member.guild.id}`)
  if(sunucupaneli) {
    let toplamuye = member.guild.channels.cache.find(x =>(x.name).startsWith("Toplam Üye •"))
   let aktifüye = member.guild.channels.cache.find(x =>(x.name).startsWith("Aktif Üye •"))
   let botlar = member.guild.channels.cache.find(x =>(x.name).startsWith("Botlar •"))
   let rekor = member.guild.channels.cache.find(x =>(x.name).startsWith("Rekor Aktiflik •"))
   let son = member.guild.channels.cache.find(x =>(x.name).startsWith("Son Üye •"))
   
    if(member.guild.members.filter(off => off.presence.status !== 'offline').size > rekor) {
      db.set(`panelrekor_${member.guild.id}`, member.guild.members.cache.filter(off => off.presence.status !== 'offline').size)
    }
    toplamuye.setName(`Toplam Üye • ${member.guild.members.size}`)
    aktifüye.setName(`Aktif Üye • ${member.guild.members.cache.filter(off => off.presence.status !== 'offline').size}`)
    botlar.setName(`Botlar • ${member.guild.members.cache.filter(m => m.user.bot).size}`)
    rekor.setName(`Son Üye • ${member.user.username}`)
  }
})

client.on("guildMemberRemove", async(member) => {
  let sunucupaneli = await db.fetch(`sunucupanel.${member.guild.id}`)
  if(sunucupaneli) {
    let toplamuye = member.guild.channels.cache.find(x =>(x.name).startsWith("Toplam Üye •"))
   let aktifüye = member.guild.channels.cache.find(x =>(x.name).startsWith("Aktif Üye •"))
   let botlar = member.guild.channels.cache.find(x =>(x.name).startsWith("Botlar •"))
   let rekor = member.guild.channels.cache.find(x =>(x.name).startsWith("Rekor Aktiflik •"))
   let son = member.guild.channels.cache.find(x =>(x.name).startsWith("Son Üye •"))
   
    if(member.guild.members.filter(off => off.presence.status !== 'offline').size > rekor) {
      db.set(`panelrekor_${member.guild.id}`, member.guild.members.cache.filter(off => off.presence.status !== 'offline').size)
    }
    toplamuye.setName(`Toplam Üye • ${member.guild.members.size}`)
    aktifüye.setName(`Aktif Üye • ${member.guild.members.cache.filter(off => off.presence.status !== 'offline').size}`)
    botlar.setName(`Botlar • ${member.guild.members.cache.filter(m => m.user.bot).size}`)
    rekor.setName(`Son Üye • ${member.user.username}`)
  }
})

client.on('voiceStateUpdate', async(oldMember, newMember) => {
let sunucupaneli = await db.fetch(`sunucupanel.${newMember.guild.id}`)
  if(sunucupaneli) {
let son = newMember.guild.channels.cache.find(x =>(x.name).startsWith("Seslideki Üye •"))
const voiceChannels = newMember.guild.channels.cache.filter(c => c.type === 'voice');
 let count = 0
   for (const [id, voiceChannel] of voiceChannels) count += voiceChannel.members.size;
son.setName(`Seslideki Üye • ${count}`)
  }
   })

//////////////// ROL KORUMA ////////////////////
client.on("roleDelete", async role => {
  let rolko = await db.fetch(`rolk_${role.guild.id}`);
  if (rolko) { 
         const entry = await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.guild.roles.create({ data: {
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions,
          mentionable: role.mentionable,
          position: role.position
}, reason: 'Silinen Roller Tekrar Açıldı.'})
  }
})

//

client.on("roleCreate", async role => {
  let rolk = await db.fetch(`rolk_${role.guild.id}`);
  if (rolk) { 
       const entry = await role.guild.fetchAuditLogs({ type: "ROLE_CREATE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.delete()
}
})

//kayıttag
client.on("userUpdate", async (oldUser, newUser) => {
  if (oldUser.username !== newUser.username) {
  const tag = 'K' //tag
  const sunucu = '830078707145244712' //sunucu id
  const kanal = '881928267140059136' //log kanal id
  const rol = '830078707154157629' //verilecek rol 

  try {

  if (newUser.username.includes(tag) && !client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.cache.has(rol)) {
  await client.channels.cache.get(kanal).send(new Discord.MessageEmbed().setColor("GREEN").setDescription(`${newUser} ${tag} Tagımızı Aldığı İçin <@&${rol}> Rolünü Verdim`));
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.add(rol);
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).send(`Selam ${newUser.username}, Sunucumuzda ${tag} Tagımızı Aldığın İçin ${client.guilds.cache.get(sunucu).roles.cache.get(rol).name} Rolünü Sana Verdim!`)
  }
  if (!newUser.username.includes(tag) && client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.cache.has(rol)) {
  await client.channels.cache.get(kanal).send(new Discord.MessageEmbed().setColor("RED").setDescription(`${newUser} ${tag} Tagımızı Çıkardığı İçin <@&${rol}> Rolünü Aldım`));
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.remove(rol);
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).send(`Selam **${newUser.username}**, Sunucumuzda ${tag} Tagımızı Çıkardığın İçin ${client.guilds.cache.get(sunucu).roles.cache.get(rol).name} Rolünü Senden Aldım!`)
  }
} catch (e) {
console.log(`Bir hata oluştu! ${e}`)
 }
}
});
client.on('ready', () => {

  client.channels.cache.get('892422698175725630').join() //girecek kanal id

  })
  
