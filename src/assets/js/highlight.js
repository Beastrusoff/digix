class Highlight{
    constructor(config={}){
        this.config = {
            leftSEl:'.works__left',
            rightSel:'.works__right',
            itemSel:'.works__item',
            contSel:'.works__container',
            observerSel:'.works',
            highLightClass:'works__item--active'
        };
        Object.assign(this.config,config);
        this.init();
    }
    init(){
        this.el = document.querySelector(this.config.contSel);
        if(!this.el)return ;
        this.body = document;
        this.observeEl = document.querySelector(this.config.observerSel);
        this.right = document.querySelector(this.config.rightSel);
        this.left = document.querySelector(this.config.leftSEl);
        this.items = document.querySelectorAll(this.config.itemSel);        
        this.body.addEventListener('scroll',(e)=>{
            this.scroll(e);                        
        })        
        
    }
    see(entries,cls){                
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Элемент видим - проверяем, находится ли он в центре
                const rect = entry.target.getBoundingClientRect();
                const windowHeight = window.innerHeight; 
                window.offsetTop;              
                // Проверяем, находится ли элемент в центре экрана
                console.log(entry.target.offsetTop + window.pageYOffset,entry.target.offsetTop );
                const isInView = 
                    rect.top <= entry.target.offsetTop + window.pageYOffset  
                    if(isInView)
                        entry.target.classList.add(cls);            
            }       else  entry.target.classList.remove(cls);   
                
        })
    }
    scroll(e){                      
        this.lightItems();
        this.scrollParts();
    }
    scrollParts(){
        clearTimeout(this.timerleft);
        clearTimeout(this.timerright);
        this.timerleft =  setTimeout(()=>{

            this.scrollPart(this.left);
        },1);
         this.scrollPart(this.right);
        this.timerright = setTimeout(()=>{

            // this.scrollPart(this.right);
        },1);

        
    }
    scrollPart(el){
        const windowHeight = window.innerHeight;
        let padd = 88;
        let rect = el.getBoundingClientRect(),
            parrect = el.parentElement.getBoundingClientRect();
        let fo = window.pageYOffset;
        let elOffset = windowHeight/2 + padd - (parrect.top);       
        if(elOffset<padd) elOffset = padd;
        if(elOffset>parrect.height - rect.height - padd) elOffset = parrect.height - rect.height - padd;
        console.log(parrect.bottom + fo , rect.bottom + elOffset + fo);
        el.style.top = `${elOffset}px`;
    }
    lightItems(){
        let padd = 150;
        const windowHeight = window.innerHeight; 
        [...this.items].forEach((item,i)=>{
            if (i==0) return
            const rect = item.getBoundingClientRect();
            

            if(rect.top<0||windowHeight>rect.top + rect.height + padd){
                item.classList.add(this.config.highLightClass);       
            }else{
                item.classList.remove(this.config.highLightClass);       
            }
        });
    }
}
export {Highlight};