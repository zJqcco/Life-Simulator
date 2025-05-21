const express = require("express")
const app = express()
const port = 5000
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const {Organism, Food} = require("./organism")

app.set("view engine", "ejs");
app.use(express.static("public"))

app.use("/", (req,res) => {
    res.render("index")
})

server.listen(port, () => {
    console.log("Server is listening on port: " + port)
})

let data = {food: [], organism: []}

for(let i = 0; i<5; i++){
    //console.log(i)
    let newFood = new Food(5, Math.random() * 900+50, Math.random() * 500 +50, i)
    data.food.push(newFood)
    data.organism.push(new Organism(Math.random()*2+10, Math.random() * 900 +50, Math.random() * 500 +50, i))
    //console.log(data.organism)
    console.log(data.organism[i])
}

data.organism.forEach(organism => {
    organism.init()
})
function checkFood(){
    if(data.food.length > 2000){
        data.food = data.food.filter(f => {
            return data.food.indexOf(f) <= 2000
        })
        //console.log(data.food)
    }

    //console.log(data.food.length)

    if(data.food.length <= 0){
        let newFood = new Food(5, Math.random() * 900+50, Math.random() * 500 +50, 1)
        data.food.push(newFood)
    }
    data.food.forEach(f => {
        
        let id = data.food[data.food.length - 1].id + 1
        let newFood = f.reproduce(id)
        let death = f.die()
        if(newFood){
            data.food.push(newFood)
        }
        //console.log(data.food)
        if(death){
            data.food = data.food.filter(o => o.id !== f.id)
        }
    })
}


io.on("connection", async(socket) => {
    socket.emit("start", data)

    const interval = setInterval(() => {
        
        if(data.organism.length <= 0){
            let newOrganism = new Organism(Math.random()*2+10, Math.random() * 900 +50, Math.random() * 500 +50, 1)
            newOrganism.init()
            data.organism.push(newOrganism)
            
        }
        checkFood()
        data.organism.forEach(organism => {
            checkFood()
            let eat = organism.think(data.food)
            if(eat){
                data.food = data.food.filter(o => o.id !== eat.id)
            }
            if(organism.energy>=100){
                let newOrganism = organism.reproduce(data.organism)
                data.organism.push(newOrganism)
                //console.log("reproduce")
                organism.energy -= 40
                socket.emit("organismBorn",newOrganism)
            }
            let die = organism.outOfEnergy()
            //console.log(die)
            if(die){
                data.organism = data.organism.filter(o => organism.id !== o.id)
            }



            data.organism.find(o => o.id == organism.id) == organism
            })
        socket.emit("update", data)
    }, 1000/60)

    socket.on("disconnect", () => {
        clearInterval(interval)
    })

})
