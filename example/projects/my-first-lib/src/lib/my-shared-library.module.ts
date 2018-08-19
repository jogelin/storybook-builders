import { NgModule } from '@angular/core';
import { MySharedLibraryComponent } from './my-first-lib.component';

@NgModule({
  imports: [
  ],
  declarations: [MySharedLibraryComponent],
  exports: [MySharedLibraryComponent]
})
export class MySharedLibraryModule { }
