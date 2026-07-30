class Toggler{
    constructor(config={}){
        this.config ={
            classOpen:'open',
            duration:400,
            changeprop:'height',
            classCollapse:'collapse'
        }
        this.config = Object.assign(this.config,config);
    }
    show(el) {        
        if (el.classList.contains('collapsing') || el.classList.contains( this.config.classOpen)) {
        return;
        }
        el.classList.remove(this.config.classCollapse);        
        const value = this.config.changeprop=='height'?el.offsetHeight:el.offsetWidth;
        el.style[this.config.changeprop] = 0;
        el.style['overflow'] = 'hidden';
        el.style['transition'] = `${this.config.changeprop} ${this.config.duration}ms ease`;
        el.classList.add('collapsing');
        this.config.changeprop=='height'?el.offsetHeight:el.offsetWidth;
        el.style[this.config.changeprop] = `${value}px`;
        return new Promise(resolve => {
            window.setTimeout(() => {
            el.classList.remove('collapsing');
            el.classList.add(this.config.classCollapse);
            el.classList.add( this.config.classOpen);
            el.style[this.config.changeprop] = '';
            el.style['transition'] = '';
            el.style['overflow'] = '';          
            }, this.config.duration);
        });
    }
    hide(el) {        
        if (el.classList.contains('collapsing') || !el.classList.contains( this.config.classOpen)) {
        return;
        }
        const value = this.config.changeprop=='height'?el.offsetHeight:el.offsetWidth;
        el.style[this.config.changeprop] = `${value}px`;        
        el.block = true;
        this.config.changeprop=='height'?el.offsetHeight:el.offsetWidth;
        el.style[this.config.changeprop] = 0;
        el.style['overflow'] = 'hidden';
        el.style['transition'] = `${this.config.changeprop} ${this.config.duration}ms ease`;
        el.classList.remove(this.config.classCollapse);
        el.classList.remove( this.config.classOpen);
        el.classList.add('collapsing');
        return new Promise(resolve => {
            window.setTimeout(() => {
            el.classList.remove('collapsing');
            el.classList.add(this.config.classCollapse);
            el.style[this.config.changeprop] = '';
            el.style['transition'] = '';
            el.style['overflow'] = '';
            el.block = false;
            }, this.config.duration);
        });
    }
    toggle(el) {
        el.classList.contains( this.config.classOpen) ? this.hide(el) : this.show(el);
    }
}
export {Toggler}