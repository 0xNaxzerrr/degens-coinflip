const { createHash } = require('crypto');

function getDiscriminator(name) {
  const preimage = `global:${name}`;
  const hash = createHash('sha256').update(preimage).digest();
  return hash.slice(0, 8);
}

const placeBetDiscriminator = getDiscriminator('place_bet');
console.log("place_bet discriminator (hex):", placeBetDiscriminator.toString('hex'));
console.log("place_bet discriminator (array):", Array.from(placeBetDiscriminator));