import Swiper from 'swiper';
import {  Autoplay,  EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
class Mainheaderanim{
    constructor(config={}){
        this.config = {
            transition: 400, 
            elSel:'.animationTitle__swiper'         
        }
        Object.assign(this.config,config);
        this.init();
        this.duration = this.config.duration;
    }
    init(){       
        this.el = document.querySelector(this.config.elSel);
        new Swiper(this.el ,{
            slidesPerView:1,
            modules:[Autoplay,  EffectCreative],
            effect: 'creative',
            loop:1,
            speed:800,
            autoplay:{
                delay: 3000,          
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
                stopOnLastSlide: false,
            },
            creativeEffect: {
                prev: {
                translate: [0, 0, 0],
                rotate: [0, 190, 0],
                origin: 'left bottom',
                opacity: 1,
                },
                next: {
                    translate: [0, 0, 0],
                    rotate: [-190, 0, 0],
                    origin: 'right bottom',
                    opacity: 1,
                },
            },
        });
    }
    
}
export {Mainheaderanim};