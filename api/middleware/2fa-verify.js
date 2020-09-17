const speakeasy = require('speakeasy')

var userToken = '458046';
const base32secret = 'NF3FAP3UJRWWWRTIFIRTSJJEPI7FCRSRF53HG6JFMFQVE5CIIJRQ'

var verified = speakeasy.totp.verify({
    secret: base32secret,
    encoding: 'base32',
    token: userToken
});

console.log(verified)