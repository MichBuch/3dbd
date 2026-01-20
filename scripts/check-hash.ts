
import bcrypt from "bcryptjs";

const hash = "$2b$10$m1u7yMZponI0ZdBnNKY1ZOry6kwWmXpIkqicNrE99o9zc66iEHqh6";
const pass = "password123";

bcrypt.compare(pass, hash).then(match => {
    console.log(`Does 'password123' match the hash? ${match}`);
});
