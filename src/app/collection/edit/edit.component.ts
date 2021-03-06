import { Component, OnInit } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { CollectionService } from '../../services/collection.service';
import { ToastrService } from "ngx-toastr";
export enum MODE {
  CREATE = 1 << 0,
  UPDATE = 1 << 1,
}
export enum TYPE {
  FOLDER = 1 << 0,
  REQUEST = 1 << 1,
}
export class RequestModalContext extends BSModalContext {
  public mode: number;
  public type: number;
  public path: string;
  public item: any;
}
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  context: RequestModalContext;

  mode: number = MODE.CREATE;
  type: number = TYPE.FOLDER;
  path: string;
  name: string;
  description: string;

   

  constructor(public dialog: DialogRef<RequestModalContext>, private collectionService: CollectionService, private toastr: ToastrService) {
    this.context = this.dialog.context;
    this.mode = this.dialog.context.mode;
    this.type = this.dialog.context.type;
    console.log(this.type, this.dialog.context.type);
    if (this.context.item) {
      let item = JSON.parse(JSON.stringify(this.context.item));
      this.name = item.name
      this.description = item.description;
    }
  }

  get saveName() {
    return this.type == MODE.CREATE ? 'Create' : 'Update';
  }

  tabClick( type){
    if(this.mode==2){
      return false;
    }
    this.type =type;
  }

  onClose() {
    this.dialog.close();
  }

  onSave() {

    let path = this.dialog.context.path;


    if (this.mode == MODE.CREATE) {
      var item = (this.type == TYPE.FOLDER) ? {
        'name': this.name,
        'description': this.description
      } : {
          'name': this.name,
          'description': this.description,
          'request': {
            'description': '',
            'method': 'GET',
            'url': 'http://',
          }
        };

      this.collectionService.itemPush(path, item).then(() => {
        this.toastr.info('생성 되었습니다.');
        this.dialog.close();
      },
        (error) => {
          this.toastr.error(`오류가 발생하였습니다. [${error.message}]`);
          this.dialog.close();
        })
    } else {

      this.collectionService
        .setItem(path + '/name', this.name)
        .setItem(path + '/description', this.description ? this.description : '')
        .update()


      this.collectionService.update(path, this.context.item).then(() => {
        this.toastr.info('수정되었습니다.');
        this.dialog.close();
      },
        (error) => {
          this.toastr.error(`오류가 발생하였습니다. [${error.message}]`);
          this.dialog.close();
        })
    }

  }
}
