import {Toggler} from './toggler.js'
class Faq{
    constructor(config){
        this.config = {
            faqItemSel:'.faq__item',
            questionSel:'.faq__question',
            answerSel:'.faq__answer',
            btnSel:'.faq__question-btn',
            classOpen:'open'
        }
        this._duration = 400;
        this.els = [];
        this.config = Object.assign(this.config,config);
        this.init();
    }
    init(){
        this.items = document.querySelectorAll(this.config.faqItemSel);
        this.toggler = new Toggler({duration:this._duration});
        [...this.items].forEach((x)=>{
            this.build(x);
        });        
        this.els.forEach((x)=>{x.el.addEventListener('click',(event)=>{            
            this.questionToggle(x);                        
        });})
    }
    toggleFaq(el){
        el.querySelector(this.config.questionSel).classList.toggle(this.config.classOpen);
        // el.querySelector(this.config.answerSel).classList.toggle(this.config.classOpen);
        this.toggler.toggle(el.querySelector(this.config.answerSel));
        el.querySelector(this.config.btnSel).classList.toggle(this.config.classOpen);
    }
    build(el,clickbtns=true){
        let q = el.querySelector(this.config.questionSel)||el,
        a = el.querySelector(this.config.answerSel),
        btn = el.querySelector(this.config.btnSel);
        
        this.els.push({q:q,a:a,btn:btn,el:el});
    }
    questionToggle(el,event){
        if(el.btn.classList.contains('collapsing'))   return;
          el.btn.classList.toggle(this.config.classOpen);
          this.toggler.toggle(el.a);
          el.q.classList.toggle(this.config.classOpen);
          el.el.classList.toggle(this.config.classOpen);
          el.btn.classList.add('collapsing');
          window.setTimeout(() => {
            el.btn.classList.remove('collapsing');
          }, this._duration);
      }
      

}
export { Faq }