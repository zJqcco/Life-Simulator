const socket = io()


const ctx = document.getElementById("world").getContext("2d")


let organisms = []

socket.on("start", async data => {

    //console.log(data.organism[0])
    data.organism.forEach(o => {
        organisms.push({organism: o, id: o.id})
    })
    draw(data)
    // data.organism.forEach(o => {

    //     ctx.fillStyle = "rgb(255 0 0)"
    //     ctx.fillRect(o.x, o.y, o.width, o.height)
    //     console.log(o)
    //     

    // })
    // data.food.forEach(f => {

    //     ctx.fillStyle = "rgb(0 255 0)"
    //     ctx.fillRect(f.x, f.y, f.width, f.height)
        

    // })
})
socket.on("organismBorn", async organism =>{

    organisms.push({organism: organism, id:organism.id})

})

let foodAmount = []
let organismAmount = []
let x = 0

let time = Date.now()
socket.on("update", async data => {

    if(Date.now() - time >= 1000){
        foodAmount.push({x:x, y:await data.food.length})
        organismAmount.push({x:x, y:await data.organism.length})
        x++
        time = Date.now()
    }
    
    draw(data)

})

async function draw(data){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //console.log(organisms)
    data.organism.forEach(async(o) => {
        let organism = await organisms.find(i => i.id ===o.id)
        
        organism.organism.x = o.x
        organism.organism.y = o.y
        //console.log(o.face.facing)
        //console.log(o)
        ctx.save()
        ctx.translate(o.x + o.width / 2, o.y + o.height / 2);
        ctx.rotate(o.face.facing * Math.PI/180)
        ctx.fillStyle = "rgb(255 0 0)"
        ctx.fillRect(-o.width / 2, -o.height / 2, o.width, o.height);
        //console.log(o.x + " - " + o.y)
        //ctx.fillRect(o.x,o.y,o.width,o.height)
        ctx.fillStyle = "rgb(0 0 0)"
        ctx.fillRect(o.width/2,0-o.face.size/2,o.face.size,o.face.size)
        //ctx.rotate((360-o.face.facing) * Math.PI/180)
        ctx.restore()
    })

    data.food.forEach(f => {

        ctx.fillStyle = "rgb(0 255 0)"
        ctx.fillRect(f.x, f.y, f.width, f.height)
        

    })
}


let foodGraph = {
    id:"foodChart",
    data: foodAmount,
    name: "Foods",
    yMax:0,
}
let organismGraph = {
    id:"organismChart",
    data: organismAmount,
    name: "Organisms",
    yMax: 0,
}
let graphs = [foodGraph, organismGraph]

setInterval(() => {
    
    graphs.forEach(graph => {
    //graph.yMax = Math.max(...graph.data)
    let xValues = []
    let yValues = []
    graph.data.forEach(data => {
        xValues.push(data.x)
        yValues.push(data.y)
    })
    console.log(graph.data)
    new Chart(graph.id, {
        type: "line",
        data: {
            labels: xValues,
            datasets:[{
                data: yValues,
                fill:false,
                borderColor: "blue",
            }]
            
        },
        options:{
            legend:false,
            title:{
                display:true,
                text: graph.name
            },
            animation:{
                duration:0
            },
            scales:{

                yAxes: [{ ticks: {min: 0}}],
                xAxes: [{ ticks: {min: 0}}]

            }
        },
        

    })
})


},1000)
