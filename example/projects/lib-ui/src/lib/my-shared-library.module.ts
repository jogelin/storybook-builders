import { NgModule } from '@angular/core';
import { MySharedLibraryComponent } from './lib-ui.component';

@NgModule({
  imports: [
  ],
  declarations: [MySharedLibraryComponent],
  exports: [MySharedLibraryComponent]
})
export class MySharedLibraryModule { }
