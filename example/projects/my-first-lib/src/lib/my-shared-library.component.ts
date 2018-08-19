import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-my-first-lib',
  template: `
    <p>
      my-first-lib works!
    </p>
  `,
  styles: []
})
export class MySharedLibraryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
