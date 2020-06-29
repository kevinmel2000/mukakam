const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'db_mukakam',
  password: 'postgres',
  port: 5555,
})



const cekUser = (request, response) => {
  
    const { username, password } = request.body
    pool.query('SELECT * FROM tb_users WHERE username  = $1 AND password = $2', [username, password], (error, results) => {
        if (error) {
          request.session.message = "oops there was a problem when trying to login";
          response.render('login',{message:"oops there was a problem when trying to login"});
          //response.status(500).send(error)
        } else if(results.rowCount > 0){
          request.session.loggedin = true;
          request.session.userID = results.insertedID;
          request.session.username = username;
          response.redirect('/home');
        } else {
          request.session.message = "oops account not found";
          response.render('login',{message:"oops account not found"});
        }
        
    })
}

const createUser = (request, response) => {
    const { username, password } = request.body
  
    pool.query("INSERT INTO tb_users (username, password) VALUES ($1, $2)", [username, password], (error, results) => {
      if (error) {
          
        response.status(500).send(error)
      } else {
        request.session.loggedin = true;
        request.session.userID = results.insertedID;
        request.session.username = username;
        response.redirect('/home');
      }
      //response.status(201).send(results)
    })
  }


module.exports.cekUser = cekUser;
module.exports.createUser = createUser;
