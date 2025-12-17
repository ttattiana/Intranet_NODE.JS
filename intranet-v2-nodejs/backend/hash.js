const bcrypt = require('bcryptjs');

bcrypt.hash('nuevaClave123', 10, (err, hash) => {
  if (err) throw err;
  console.log(hash);
});
