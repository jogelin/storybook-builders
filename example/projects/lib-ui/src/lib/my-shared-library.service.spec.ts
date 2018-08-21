import { TestBed, inject } from '@angular/core/testing';

import { MySharedLibraryService } from './lib-ui.service';

describe('MySharedLibraryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MySharedLibraryService]
    });
  });

  it('should be created', inject([MySharedLibraryService], (service: MySharedLibraryService) => {
    expect(service).toBeTruthy();
  }));
});
