console.log(gsap)
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth /2
canvas.height = innerHeight/2

//Score
const scoreEl = document.querySelector('#scoreEl');

//Start btn
const startGameBtn = document.querySelector("#startGameBtn");

//janela de iniciação do game
const modelEl = document.querySelector("#modelEl");




class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//Enimes
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}



//Criando particulas de destruição
const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}



const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'gray')
const projectiles = []
const enemies = []
const particles = []


//spawEnemies
function spawEnemies() {
    setInterval(() => {
        const radius = Math.random() * (70 - 10) + 10

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
            /* const x = Math.random() < 0.5 ? 0 - radius : canvas.width+radius
            const y = Math.random() < 0.5 ? 0 - radius : canvas.height+radius */
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        //cor dos inimigos
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x,
        )

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
        /* console.log(enemies) */
    }, 1500)
}
//End spawRnemies

//Início animação
let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle,  index) => {
        if(particle.alpha <= 0){
            particles.splice( index, 1)
        } else{
            particle.update()
        }
 
    });

    projectiles.forEach((projectile, index) => {
        projectile.update()

        //remover das bordas da tela
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {

                projectiles.splice(index, 1)
            }, 0)
        }

    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        //end game
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)

        }
        //end game

        projectiles.forEach((projectile, projetileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Quando os tiros colidirem com os inimigos
            if (dist - enemy.radius - projectile.radius < 1) {

            
            
                //criando particulas de destruição
                for (let i = 0; i < enemy.radius * 2 ; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5)*(Math.random() * 2),
                                y: (Math.random() - 0.5)*(Math.random() * 2)
                            })
                    )
                }
                //fim criando particulas de destruição

                if (enemy.radius - 10 > 10) {
                     // acrescentando o score quando atacar o inimigo
                score += 1;
                scoreEl.innerHTML = score
                console.log(score)

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })

                    /* enemy.radius -= 10 *///elimina o inimigo
                    setTimeout(() => {
                        projectiles.splice(projetileIndex, 1)
                    }, 0)
                } else {
                    // acrescentando o score quando matar o inimigo
                    score += 10;
                    scoreEl.innerHTML = score
                    console.log(score)
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projetileIndex, 1)
                    }, 0)
                }

            } // Fim de Quando os tiros colidirem com os inimigos

        });
    })
}
//fim Animação
addEventListener('click', (event) => {



    const angle = Math.atan2(
     /*    event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2, */
        event.clientY - canvas.height,
        event.clientX - canvas.width,
    )

    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            1,
            'orange',
            velocity
        )
    )
})


startGameBtn.addEventListener('click',()=>{
    animate()
spawEnemies()

modelEl.style.display ='none'
})