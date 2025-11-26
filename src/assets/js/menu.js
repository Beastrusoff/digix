class Menu{
    constructor(config={}){
        this.config = {
            transition: 400,
            elSel: '.menu',
            bodySel: 'body',
            bodyMenuOpenClass:'menu--bodyOpen',
            wrapperSel: '.menu__wrapper',
            menuMobileSel: '.menu__burger',
            menuMobileOpenedClass: 'menu__burger--open',
            wrapperOpenedClass: 'menu__wrapper--open',
        }
        Object.assign(this.config,config);        
        this.init();
    }
    init(){
        this.el = document.querySelector(this.config.elSel);
        this.wrapper = this.el.querySelector(this.config.wrapperSel);
        this.btn = this.el.querySelector(this.config.menuMobileSel);
        this.body = document.querySelector(this.config.bodySel);
        this.btn.addEventListener('click',(e)=>{e.preventDefault();this.toggleMenu();});
    }
    toggleMenu(){
        this.btn.classList.toggle(this.config.menuMobileOpenedClass);
        this.wrapper.classList.toggle(this.config.wrapperOpenedClass);
        this.body.classList.toggle(this.config.bodyMenuOpenClass);
    }
}
export {Menu};