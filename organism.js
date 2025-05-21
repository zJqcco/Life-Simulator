const { sigmoid } = require("./util/sigmoid")


class Organism {
    constructor(size,x,y,id){
        this.height = size
        this.width = size
        this.age = 0
        this.hunger = 0
        this.x = x
        this.y = y
        this.id = id
        this.energy = 10
        this.brain = {
            weight: [],
            bias: []
            
        }
        this.face = {
            size: this.width/4,
            facing: Math.random() * 360
        }
        this.speed = 1
        this.energyClock = Date.now()
        this.energyLossFactor = 2
    }


    init(){

        for(let i = 0; i<2;i++){
            this.brain.weight.push(Math.random() *2 -1)
        }
        this.brain.bias.push(Math.random() *2 -1)

    }

    think(foods){
        
        let data = [];
        let distance = [];
        foods.forEach(food => {
            let distanceToFoodX = food.x-this.x
            let distanceToFoodY = food.y-this.y
            let distanceToFood = Math.sqrt(Math.pow(distanceToFoodX, 2) + Math.pow(distanceToFoodY, 2))
            let angle = Math.atan2(distanceToFoodX,distanceToFoodY)
            distance.push({distanceToFood: distanceToFood, food: food, angle:angle})
            data.push(distanceToFood)
            

        })
        data = Math.min(...data)
        distance = distance.find(d => data === d.distanceToFood)
        //console.log(distance)

        
        let eat = this.eat(distance)
        
        if(distance && distance.distanceToFood < 100){

            
            let decision = this.brain.weight[0] * distance.distanceToFood
            let decision2 = this.brain.weight[1] * distance.angle

            decision = decision*decision2*this.brain.bias
            decision = sigmoid(decision)
            //console.log(decision)
            

            //console.log(decision)
                
            // if(decision > 0){
            //     decision = 1
            // }else{
            //     decision = 0
            // }
                
            this.moveToDecision(decision.toFixed(5))
        }else{
            this.move()
        }
        return eat

    }

    moveToDecision(decision){
        //console.log(decision)
        this.face.facing += (decision - 0.5) * 2
        // if(decision){ 
        //     this.face.facing += Math.random() * 2
        // }else{
        //     this.face.facing -= Math.random() * 2
        // }
        this.move()
    }
    move(){

        if(this.face.facing > 360){
            this.face.facing -= 360
        }

        if(this.face.facing < 0){
            this.face.facing += 360
        }

        if(this.x<=0 && !(this.face.facing > 330 || this.face.facing < 30)){
                this.face.facing -= 1

                //console.log(`${this.x}, ${this.y} - ${this.face.facing}`)
                
            }else if(this.x>=1195 && (this.face.facing < 150 || this.face.facing > 210)){
                this.face.facing -=1
            }else{
                this.face.facing += Math.random()*2 -1

                this.changeX()
                
            }
            if(this.y<=0 && (this.face.facing < 60 || this.face.facing > 120)){
                this.face.facing -=1
                
                
            }
            else if(this.y>=795 && (this.face.facing < 240 || this.face.facing >300)){
                this.face.facing-=1
                
                
            }else{
                this.face.facing += Math.random()*2 -1
                this.changeY()
                
            }
        
        
        
    }
    changeX(){

        let radians = this.face.facing * Math.PI / 180
        this.x += Math.cos(radians) * this.speed

    }
    changeY(){

        let radians = this.face.facing * Math.PI / 180
        this.y += Math.sin(radians) * this.speed

    }

    eat(distance){
        if(distance){
            if(distance.distanceToFood < 10){
                this.energy += 20
                // console.log("eat " + distance)
                return distance.food
            }

            else{
                return 0
            }
        }
    }
    reproduce(organisms){
        let id = organisms[organisms.length - 1].id + 1
        let newOrganism = new Organism(this.height + Math.random()*2-1, this.x,this.y,id)
        this.brain.weight.forEach(val => {
            let mutation = Math.random()*2 -1
            while(val+mutation < -1){
                mutation += 0.1
            }
            while(val+mutation > 1){
                mutation -= 0.1
            }

            
            //newOrganism.energyLossFactor = this.energyLossFactor + (Math.random() *4 -4)
            newOrganism.brain.weight.push(val+mutation)

        })

        let mutation = Math.random()*2 - 1
            while(this.brain.bias[0]+mutation < -1){
                mutation += 0.1
            }
            while(this.brain.bias[0]+mutation > 1){
                mutation -= 0.1
            }

            newOrganism.brain.bias.push(this.brain.bias[0] + mutation)

        return newOrganism
    }

    outOfEnergy(){

        
        if(Date.now() - this.energyClock >= 5000){
            this.energy -= this.energyLossFactor * 2
            this.energyClock = Date.now()
        }

        if(this.energy <= 0){
            return 1
        }
        return 0

    }
}

class Food {
    constructor(value, x, y, id){
        this.value = value
        this.x = x
        this.y = y
        this.height = 8
        this.width = this.height
        this.id = id
        this.timer = Date.now()
        this.deathTimer = Date.now()
    }
    reproduce(newId){
        if(Date.now() - this.timer >= 5000){
            
            let newX = this.x + (Math.random() * 20 - 10)*20
            while(newX <= 0){
                newX += 20
            }
            while(newX >= 1195){
                newX -= 20
            }

            let newY = this.y + (Math.random() * 20 - 10)*20
            while(newY <= 0){
                newY += 20
            }
            while(newY >= 795){
                newY -= 20
            }
            this.timer = Date.now()
            return new Food(this.value, newX, newY, newId)
        }
        return 0
    }
    die(){
        if(Date.now() - this.deathTimer >= 11000){
            return 1
        }
        return 0
    }
}

module.exports.Food = Food;
module.exports.Organism = Organism;