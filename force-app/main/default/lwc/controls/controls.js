import { LightningElement } from 'lwc';

export default class Controls extends LightningElement {

    handleAdd() {
        this.dispatchEvent(new CustomEvent('add'));
      }

    handleDecrement() {
        this.dispatchEvent(new CustomEvent('subtract'));
    }
    handleMultiply() {
        this.dispatchEvent(new CustomEvent('multiply'));
    }

}