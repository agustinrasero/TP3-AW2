import express from 'express'
import pg from 'pg'
//para variables de entorno
import dotenv from 'dotenv'
//para los cors
import cors from 'cors'
import helmet from 'helmet' //Inserta cabeceras de seguridad


//Encriptacion
import jwt from 'jsonwebtoken' 
import cookieParser from 'cookie-parser' 
import bcrypt from 'bcryptjs' 

const app = express();
app.use(express.json()) //Vamos a capturar un JSON desde el cliente, formato JSON{ }

app.use(express.urlencoded({extended:true})) //formato url encode
/*
 producto=nombre&precio=1000
*/
app.use(helmet()) //cabeceras de seguridad

app.use(express.static('www'))
//cargamos el archivo .env con todas las variables 
dotenv.config()

app.use(cookieParser())


const PUERTO = process.env.PUERTO || 3333
const PG_USER = process.env.PG_USER
const PG_PASS = process.env.PG_PASS
const SECRETO = process.env.SECRETO



const {Pool} = pg //Instanciamos objeto de pg

const pool = new Pool({
    host: 'localhost', // -> 
    user: PG_USER,
    database: 'postgres',
    port: 5432,
    password: PG_PASS,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})






app.use('/admin', chequearToken, express.static('admin'))



//GET ALL
app.get('/productos',cors(),async (req,res)=>{
    try{
  
      const resultado = await pool.query('SELECT * FROM productos')
      console.log(resultado.rows)
      res.json(resultado.rows) //.json = darle cabecera 
    }catch(error){
  
      res.status(404).end()
    }
})


//GET ID
app.get('/productos/:id',cors(),async (req,res)=>{
    const id = req.params.id
    const resultado = await pool.query('SELECT * FROM productos WHERE id=$1',[id])
    res.json(resultado.rows)
})


//POST 
app.post('/productos',cors(), async (req,res)=>{
    const nombre = req.body.nombre
    const marca = req.body.marca
    const categoria = req.body.categoria
    const stock = req.body.stock
    const resultado = await pool.query('INSERT INTO productos (nombre, marca, categoria, stock) VALUES($1,$2,$3,$4) ',[nombre,marca,categoria,stock])
    console.log(resultado.rows)
    res.send('Producto cargado correctamente') 
})
  
//PUT
app.put('/productos/:id',cors(),async (req,res)=>{
    const id = req.params.id
    const nombre = req.body.nombre
    const marca = req.body.marca
    const categoria = req.body.categoria
    const stock = req.body.stock
    const resultado = await pool.query('UPDATE productos SET nombre = $1, marca = $2, categoria = $3 , stock = $4 WHERE id = $5 ',[nombre,marca,categoria,stock,id])
    res.send('Producto ' + id + " actualizado correctamente")
})



//DELETE
app.delete('/productos/:id',cors(), async(req,res)=>{
    const id = req.params.id
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1',[id])
    res.send('Producto ' + id + " eliminado correctamente")
})






//REGISTER

app.post('/register', async (req,res)=>{
    const nombre = req.body.nombre
    const usuario = req.body.usuario
    const pass = req.body.pass

    //Encriptacion de password
    const salt = bcrypt.genSaltSync(10);
    const passEncriptada = bcrypt.hashSync(pass, salt);

    const resultado = await pool.query('INSERT INTO usuarios (nombre,usuario,clave) VALUES ($1,$2,$3)',[nombre,usuario,passEncriptada])

    res.redirect('/')
})



//INTEGRACION DE LOGIN CON ENCRIPTACION DE CLAVE 
function chequearToken(req, res, next) {
    // console.log('cookie')
    // console.log(req.cookies)

    // Existe la cookie?
    if (req.cookies) {
        try {
            const { token } = req.cookies
            jwt.verify(token, SECRETO)
            // verificado -> sigo...
            next()
        } catch (error) {
            res.redirect('/')
        }
    } else {
        // redirecciono al inicio
        res.redirect('/')
    }
}


app.post('/login',async (req,res)=>{
    //Obtenemos el cuerpo
    const usuario = req.body.usuario
    const pass = req.body.pass


    // Consulta BD
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE usuario=$1', [usuario])
        console.log(resultado.rows)
        // Verificamos si el usuario esta registrado
        if (resultado.rowCount > 0) {
            const dbusuario = resultado.rows[0].usuario;
            const dbPassEncriptada = resultado.rows[0].clave;
            

            // Comparar la contraseña ingresada con la almacenada
            const match = bcrypt.compareSync(pass, dbPassEncriptada);

            if (match) {
                console.log(match)
                // Si la contraseña coincide -> Generar el token
                const token = jwt.sign({ usuario: dbusuario }, SECRETO, {
                    expiresIn: '1m'
                });

                // Enviamos token en una cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true
                });
                res.redirect('/admin');
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        res.redirect('/')
    }
})


app.listen(PUERTO,()=>{
    console.log('http://localhost:3000')
})