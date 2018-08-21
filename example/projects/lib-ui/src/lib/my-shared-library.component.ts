import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-lib-ui',
  template: `
    <p>
      lib-ui works!
    </p>
  `,
  styles: []
})
export class MySharedLibraryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
