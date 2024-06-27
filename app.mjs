import express from 'express'
import pg from 'pg'
//para variables de entorno
import dotenv from 'dotenv'
//para los cors
import cors from 'cors'
import helmet from 'helmet' //Inserta cabeceras de seguridad

const app = express();
app.use(express.json()) //Vamos a capturar un JSON desde el cliente, formato JSON{ }

app.use(express.urlencoded({extended:true})) //formato url encode
/*
 producto=nombre&precio=1000
*/
app.use(helmet()) //cabeceras de seguridad


//cargamos el archivo .env con todas las variables 
dotenv.config()

const PUERTO = process.env.PUERTO || 3333
const PG_USER = process.env.PG_USER
const PG_PASS = process.env.PG_PASS




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



app.listen(PUERTO,()=>{
    console.log('http://localhost:3000')
})