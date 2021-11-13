const Discord = require("discord.js");
const db = require('wio.db');
const ayarlar = require('../ayarlar.json')

exports.run = async (client, message, args) => {//splashen
  let kişi = message.mentions.users.first() || message.member
  let erkek = db.get(`erkekpuan_${message.author.id}`);
  let kız = db.get(`kızpuan_${message.author.id}`);
let toplam = erkek+kız
var embed = new Discord.MessageEmbed()
.setThumbnail(message.author.displayAvatarURL({dynamic : true}))
.setColor('#f6ff00')
.setDescription(`
●▬▬▬  **Kayıt İstatistikleri**  ▬▬▬●

           >      • \`Yetkili\` • **${kişi}**
           >      • \`Toplam Üye Kayıt Sayısı\` • **${toplam}**
           >      • \`Toplam Erkek Kayıt Sayısı\` • **${erkek}**
           >      • \`Toplam Kadın Kayıt Sayısı\` • **${kız}**
              
●▬▬▬  **Kayıt  İstatistikleri**  ▬▬▬●




`)
message.reply(embed)

}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'toplam-kayıt'
};