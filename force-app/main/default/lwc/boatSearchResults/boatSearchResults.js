import { LightningElement, api, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  
  @api
  selectedBoatId;


  columns = [{label:'Name', fieldName:'Name',editable:true},
             {label:'Length',fieldName:'Length__c',editable:true,vtype:'number'},
             {label:'Price',fieldName:'Price__c',editable:true, type:'currency'},
             {label:'Description', fieldName:'Description__c',editable:true}
            ];


  boatTypeId = '';
  
  @track 
  boats;

  @track
  draftValues=[];
  
  isLoading = false;
  

  
  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method 
   @wire(getBoats,{boatTypeId:'$boatTypeId'})
  wiredBoats({data,error}) {
   
    if(data){
        
      this.boats = data;
    }else if(error){
      
    }

    //this.isLoading=false;
    //this.notifyLoading(this.isLoading);

   }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    //alert('boatTypeId:' + boatTypeId);
    this.boatTypeId=boatTypeId;
    this.isLoading=true;
    this.notifyLoading(this.isLoading);

   }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);

  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId=event.detail.boatId;
    //alert('boatSearchResults: boatId: ' + this.selectedBoatId);ok
    this.sendMessageService(this.selectedBoatId);

   }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    //const payload = {recordId: boatId};
    publish(this.messageContext,BOATMC,{recordId: boatId});
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);

    const updatedFields = event.detail.draftValues;
    
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(result => {
        const toastEvt = new ShowToastEvent(
            {
                title: SUCCESS_TITLE,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT
            }
        );
        this.dispatchEvent(toastEvt);
        this.draftValues=[];
        return this.refresh();
    })
    .catch(error => {
        const toastEvt = new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.message,
            variant: ERROR_VARIANT
        });
        this.dispatchEvent(toastEvt);
    })
    .finally(() => {
        this.draftValues = [];
        this.notifyLoading(false);
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  
  notifyLoading(isLoading) {
      if(isLoading){
          this.dispatchEvent(new CustomEvent('loading'));
      }else{
          this.dispatchEvent(new CustomEvent('doneloading'));
      }
  }
}