import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CropperModalPage } from './cropper-modal.page';

describe('CropperModalPage', () => {
  let component: CropperModalPage;
  let fixture: ComponentFixture<CropperModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropperModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CropperModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
