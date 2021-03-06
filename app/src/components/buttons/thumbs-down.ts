import { Component, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';

import { SessionFactory } from '../../services/session';
import { Client } from '../../services/api';
import { WalletService } from '../../services/wallet';
import { SignupModalService } from '../modal/signup/service';

@Component({
  selector: 'minds-button-thumbs-down',
  viewBindings: [WalletService ],
  properties: ['_object: object'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="mdl-color-text--blue-grey-500" (click)="thumb()" [ngClass]="{'selected': has() }">
      <i class="material-icons">thumb_down</i>
      <counter *ngIf="object['thumbs:down:count'] > 0">{{object['thumbs:down:count']}}</counter>
    </a>
  `,
  directives: [CORE_DIRECTIVES]
})

export class ThumbsDownButton {

  object;
  session = SessionFactory.build();
  showModal : boolean = false;

  constructor(public client : Client, public wallet : WalletService, private modal : SignupModalService) {
  }

  set _object(value : any){
    this.object = value;
    if(!this.object['thumbs:down:user_guids'])
      this.object['thumbs:down:user_guids'] = [];
  }

  thumb(){
    var self = this;

    if(!this.session.isLoggedIn()){
      this.modal.setSubtitle("You need to have a channel to vote").open();
      return false;
    }

    this.client.put('api/v1/thumbs/' + this.object.guid + '/down', {});
    if(!this.has()){
      //this.object['thumbs:down:user_guids'].push(this.session.getLoggedInUser().guid);
      this.object['thumbs:down:user_guids'] = [this.session.getLoggedInUser().guid];
      this.object['thumbs:down:count']++;
      if (this.session.getLoggedInUser().guid != this.object.owner_guid) {
        self.wallet.increment();
      }
    } else {
      for(let key in this.object['thumbs:down:user_guids']){
        if(this.object['thumbs:down:user_guids'][key] == this.session.getLoggedInUser().guid)
          delete this.object['thumbs:down:user_guids'][key];
      }
      this.object['thumbs:down:count']--;
      if (this.session.getLoggedInUser().guid != this.object.owner_guid) {
        self.wallet.decrement();
      }
    }
  }

  has(){
    for(var guid of this.object['thumbs:down:user_guids']){
      if(guid == this.session.getLoggedInUser().guid)
        return true;
    }
    return false;
  }

}
