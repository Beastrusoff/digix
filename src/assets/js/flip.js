class Flip{
    constructor(config={}){
         this.config = {
            transition: 400,
            elContSel : '.animationTitle__changingsSpan',
            el : '.animationTitle__changingsSpan',
         }
        Object.assign(this.config,config);
        this.init();
    }
}
export {Flip};