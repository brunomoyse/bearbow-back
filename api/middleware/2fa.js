// Générer le QRcode pour ajouter l'authentification 2 facteurs de notre site dans l'app Google Auth
const speakeasy = require('speakeasy')

const QRCode = require('qrcode')

var secret = speakeasy.generateSecret({
    name: "BearBow"
})

const user = {}
user.two_factor_temp_secret = secret.base32;

console.log(user.two_factor_temp_secret)

QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
    console.log(data_url);
  });


