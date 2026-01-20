
import bcrypt from "bcryptjs";

const pass = 'abc123!"£';

bcrypt.hash(pass, 10).then(hash => {
    console.log(`Hash for '${pass}':`);
    console.log(hash);
});
