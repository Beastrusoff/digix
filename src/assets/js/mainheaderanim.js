class Mainheaderanim{
    constructor(config={}){
        this.config = {
            transition: 400,
            elSel: 'svg.animationTitle__svg',
            bodySel: 'body',         
            repeat:-1, // бесконечный повтор
            repeatDelay:2000, // задержка между повторениями в миллисекундах
            loop:true,
            partsPause:22.5, // в миллисекундах
            duration:13000 // длительность анимации в миллисекундах   
        }
        Object.assign(this.config,config);        
        this.init();
        this.iteration = 0; 
    }
    init(){
        this.el = document.querySelector(this.config.elSel);
        this.elems = this.el.querySelectorAll('svg path'); 
        this.elems.forEach(p=>{        
            p.style.transformOrigin = '50% 50%'; // центр для вращения
            p.style.transform = `translate(${this.getRand(-500, 500)}px, ${this.getRand(-500, 500)}px) rotate(${this.getRand(-720, 720)}deg) scale(0)`;
            p.style.opacity = '0';
        });
        this.elems.forEach((el, i) => {
            this.animateElement(el, i * this.config.partsPause);
        });
    }
    getRand(min,max){
        return Math.random() * (max - min) + min;
    }
    animateElement(el, delay) {
        this.keyframesForward = [
            { transform: el.style.transform, opacity: 0 },
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }
        ];
        this.keyframesBackward = [
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
            { transform: el.style.transform, opacity: 0 }
        ];                              
        this.runAnimation(el,delay);

    }
    runAnimation(el,delay) {
            console.log("ANIMATION start");
            let anim = el.animate(this.keyframesForward, {
                duration: this.config.duration,
                fill: 'forwards',
                easing: 'cubic-bezier(0.77, 0, 0.175, 1)', // приближенно Power4.easeInOut
                delay: 0
            });
            
            // anim.onfinish = () => {
            // if (this.config.loop) {
            //     let animBack = el.animate(this.keyframesBackward, {
            //         duration: this.config.duration,
            //         fill: 'forwards',
            //         easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
            //         delay: 0
            //     });

            //     animBack.onfinish = () => {
            //         console.log("ANIMATION OVER");
            //         this.iteration++;
            //         if (this.config.repeat === -1 || this.iteration <this.config.repeat) {
            //             setTimeout(this.runAnimation(el), this.config.repeatDelay);
            //         }
            //     };
            //     } else {
            //         this.iteration++;
            //         if (this.config.repeat === -1 || this.iteration <this.config.repeat) {
            //             setTimeout(this.runAnimation(el), this.config.repeatDelay);
            //         }
            //     }
            // };
        }
    
}
export {Mainheaderanim};